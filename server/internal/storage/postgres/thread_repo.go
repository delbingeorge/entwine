package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"

	"github.com/octane/entwine/server/internal/domain"
)

type threadRow struct {
	ID            string     `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID        string     `gorm:"column:user_id;type:uuid"`
	Kind          string     `gorm:"column:kind"`
	ParentID      *string    `gorm:"column:parent_id;type:uuid"`
	Title         string     `gorm:"column:title"`
	Status        *string    `gorm:"column:status"`
	LastMessageAt *time.Time `gorm:"column:last_message_at"`
	CreatedAt     time.Time  `gorm:"column:created_at"`
	UpdatedAt     time.Time  `gorm:"column:updated_at"`
}

func (threadRow) TableName() string { return "chat_threads" }

type messageRow struct {
	ID             string    `gorm:"column:id;type:uuid;primaryKey;default:gen_random_uuid()"`
	ThreadID       string    `gorm:"column:thread_id;type:uuid"`
	Seq            int64     `gorm:"column:seq"`
	Role           string    `gorm:"column:role"`
	Content        string    `gorm:"column:content"`
	AttachmentKind *string   `gorm:"column:attachment_kind"`
	AttachmentName *string   `gorm:"column:attachment_name"`
	AttachmentSize *string   `gorm:"column:attachment_size"`
	CreatedAt      time.Time `gorm:"column:created_at"`
}

func (messageRow) TableName() string { return "chat_messages" }

type ThreadRepo struct {
	db *gorm.DB
}

func NewThreadRepo(db *gorm.DB) *ThreadRepo {
	return &ThreadRepo{db: db}
}

func (r *ThreadRepo) Create(
	ctx context.Context, thread domain.Thread, now time.Time,
) (domain.Thread, error) {
	row := threadRow{
		UserID:    thread.UserID,
		Kind:      string(thread.Kind),
		Title:     thread.Title,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if thread.ParentID != "" {
		row.ParentID = &thread.ParentID
	}

	if thread.Status != "" {
		row.Status = &thread.Status
	}

	if err := r.db.WithContext(ctx).Create(&row).Error; err != nil {
		return domain.Thread{}, fmt.Errorf("create thread: %w", err)
	}

	return row.toDomain(), nil
}

func (r *ThreadRepo) ListByUser(ctx context.Context, userID string) ([]domain.Thread, error) {
	var rows []threadRow

	if err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("last_message_at desc nulls last, created_at desc").
		Find(&rows).Error; err != nil {
		return nil, fmt.Errorf("list threads: %w", err)
	}

	threads := make([]domain.Thread, 0, len(rows))
	for _, row := range rows {
		threads = append(threads, row.toDomain())
	}

	return threads, nil
}

func (r *ThreadRepo) Get(ctx context.Context, threadID, userID string) (domain.Thread, error) {
	var row threadRow

	err := r.db.WithContext(ctx).
		Where("id = ? and user_id = ?", threadID, userID).
		First(&row).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return domain.Thread{}, fmt.Errorf("thread %s: %w", threadID, domain.ErrNotFound)
	}

	if err != nil {
		return domain.Thread{}, fmt.Errorf("get thread: %w", err)
	}

	return row.toDomain(), nil
}

func (r *ThreadRepo) Delete(ctx context.Context, threadID, userID string) error {
	result := r.db.WithContext(ctx).
		Where("id = ? and user_id = ?", threadID, userID).
		Delete(&threadRow{})

	if result.Error != nil {
		return fmt.Errorf("delete thread: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("thread %s: %w", threadID, domain.ErrNotFound)
	}

	return nil
}

func (r *ThreadRepo) Messages(ctx context.Context, threadID string) ([]domain.ChatMessage, error) {
	var rows []messageRow

	if err := r.db.WithContext(ctx).
		Where("thread_id = ?", threadID).
		Order("seq").
		Find(&rows).Error; err != nil {
		return nil, fmt.Errorf("list messages: %w", err)
	}

	messages := make([]domain.ChatMessage, 0, len(rows))
	for _, row := range rows {
		messages = append(messages, row.toDomain())
	}

	return messages, nil
}

func (r *ThreadRepo) Append(
	ctx context.Context, message domain.ChatMessage, now time.Time,
) (domain.ChatMessage, error) {
	var stored messageRow

	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var next int64

		if err := tx.Raw(
			"select coalesce(max(seq), 0) + 1 from chat_messages where thread_id = ?",
			message.ThreadID,
		).Scan(&next).Error; err != nil {
			return fmt.Errorf("next seq: %w", err)
		}

		stored = messageRow{
			ThreadID:  message.ThreadID,
			Seq:       next,
			Role:      string(message.Role),
			Content:   message.Content,
			CreatedAt: now,
		}

		if message.Attachment != nil {
			stored.AttachmentKind = nullableString(message.Attachment.Kind)
			stored.AttachmentName = nullableString(message.Attachment.Name)
			stored.AttachmentSize = nullableString(message.Attachment.Size)
		}

		if err := tx.Create(&stored).Error; err != nil {
			return fmt.Errorf("insert message: %w", err)
		}

		updates := map[string]any{"last_message_at": now, "updated_at": now}

		if message.Role == domain.MessageRoleUser {
			if err := tx.Exec(
				"update chat_threads set title = ? where id = ? and title = ''",
				domain.TitleFrom(message.Content), message.ThreadID,
			).Error; err != nil {
				return fmt.Errorf("set title: %w", err)
			}
		}

		if err := tx.Model(&threadRow{}).
			Where("id = ?", message.ThreadID).
			Updates(updates).Error; err != nil {
			return fmt.Errorf("touch thread: %w", err)
		}

		return nil
	})
	if err != nil {
		return domain.ChatMessage{}, err
	}

	return stored.toDomain(), nil
}

func (r messageRow) toDomain() domain.ChatMessage {
	message := domain.ChatMessage{
		ID:        r.ID,
		ThreadID:  r.ThreadID,
		Seq:       r.Seq,
		Role:      domain.MessageRole(r.Role),
		Content:   r.Content,
		CreatedAt: r.CreatedAt,
	}

	if r.AttachmentKind != nil && r.AttachmentName != nil && r.AttachmentSize != nil {
		message.Attachment = &domain.ChatAttachment{
			Kind: *r.AttachmentKind,
			Name: *r.AttachmentName,
			Size: *r.AttachmentSize,
		}
	}

	return message
}

func (r threadRow) toDomain() domain.Thread {
	return domain.Thread{
		ID:            r.ID,
		UserID:        r.UserID,
		Kind:          domain.ThreadKind(r.Kind),
		ParentID:      derefString(r.ParentID),
		Title:         r.Title,
		Status:        derefString(r.Status),
		LastMessageAt: r.LastMessageAt,
		CreatedAt:     r.CreatedAt,
	}
}
