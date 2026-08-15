import { importResume } from "@/shared/lib/profile-detail-api";

import { useChat } from "../hooks/use-chat";
import { useJobThreads } from "../hooks/use-job-threads";
import { useThreads } from "../hooks/use-threads";
import { classifyFile, humanSize } from "../lib/classify-file";

import { ChatHeader } from "./chat-header";
import { Composer } from "./composer";
import { JobThread } from "./job-thread";
import { Transcript } from "./transcript";

import "../styles/md-body.css";

export const ChatScreen = () => {
  const history = useThreads();
  const chat = useChat({ onSettled: history.syncTitles, threadId: history.currentId });
  const threads = useJobThreads();

  return (
    <div className="flex h-screen flex-col bg-surface">
      <ChatHeader
        currentThreadId={history.currentId}
        onDeleteThread={history.remove}
        onNewThread={history.startNew}
        onOpenJob={threads.open}
        onSelectThread={history.select}
        startedIds={threads.startedIds}
        statusOf={threads.statusOf}
        threads={history.threads}
      />

      {threads.openJob === undefined ? (
        <div className="grid min-h-0 flex-1 px-8 pb-4" style={{ gridTemplateRows: "1fr auto" }}>
          <Transcript
            onOpenJob={threads.open}
            onRetry={chat.retry}
            onStartEdit={chat.startEdit}
            statusOf={threads.statusOf}
            turns={chat.turns}
          />
          <Composer
            attachment={chat.attachment}
            isBusy={chat.isBusy}
            isEditing={chat.isEditing}
            onCancelEdit={() => {
              chat.setValue("");
              chat.cancelEdit();
            }}
            onFile={(file) => {
              if (file === undefined) {
                return;
              }

              const kind = classifyFile(file);
              chat.setAttachment({
                id: Date.now(),
                name: file.name,
                kind,
                size: humanSize(file.size),
                url: kind === "image" ? URL.createObjectURL(file) : undefined,
              });

              if (kind === "pdf") {
                importResume(file).catch((cause: unknown) => {
                  console.error("resume import failed", cause);
                });
              }
            }}
            onRemoveAttachment={() => {
              chat.setAttachment(null);
            }}
            onSubmit={chat.submit}
            onValueChange={chat.setValue}
            value={chat.value}
          />
        </div>
      ) : (
        <JobThread
          job={threads.openJob}
          key={threads.openJob.id}
          onBack={threads.close}
          onStatusChange={(status) => {
            threads.setStatus(threads.openJob?.id ?? "", status);
          }}
          status={threads.statusOf(threads.openJob.id)}
        />
      )}
    </div>
  );
};
