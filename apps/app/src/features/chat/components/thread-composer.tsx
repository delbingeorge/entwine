import { importResume } from "@/shared/lib/profile-detail-api";

import { type useConversation } from "../hooks/use-conversation";
import { attachmentFromFile } from "../lib/classify-file";

import { Composer } from "./composer";

interface ThreadComposerProps {
  canCall?: boolean;
  chat: ReturnType<typeof useConversation>;
  onJoinCall?: () => void;
  onSubmit: () => void;
  placeholder: string;
}

export const ThreadComposer = ({
  canCall,
  chat,
  onJoinCall,
  onSubmit,
  placeholder,
}: ThreadComposerProps) => (
  <div data-flip-id="composer">
    <Composer
      attachment={chat.attachment}
      canCall={canCall}
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

        const attachment = attachmentFromFile(file);
        chat.setAttachment(attachment);

        if (attachment.kind === "pdf") {
          importResume(file).catch((cause: unknown) => {
            console.error("resume import failed", cause);
          });
        }
      }}
      onJoinCall={onJoinCall}
      placeholder={placeholder}
      onRemoveAttachment={() => {
        chat.setAttachment(null);
      }}
      onSubmit={onSubmit}
      onValueChange={chat.setValue}
      value={chat.value}
    />
  </div>
);
