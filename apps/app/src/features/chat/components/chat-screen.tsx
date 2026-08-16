import { useCallback, useRef } from "react";

import { useSearch } from "@tanstack/react-router";

import { isVoiceSupported, useVoiceCall } from "@/shared/hooks/use-voice-call";
import { importResume } from "@/shared/lib/profile-detail-api";

import { useChat } from "../hooks/use-chat";
import { useJobThreads } from "../hooks/use-job-threads";
import { useThreads } from "../hooks/use-threads";
import { classifyFile, humanSize } from "../lib/classify-file";
import { htmlToText } from "../lib/html-to-text";
import { renderMarkdown } from "../lib/render-markdown";

import { ChatHeader } from "./chat-header";
import { Composer } from "./composer";
import { JobThread } from "./job-thread";
import { Transcript } from "./transcript";

import "../styles/md-body.css";

export const ChatScreen = () => {
  const { thread } = useSearch({ from: "/" });
  const history = useThreads(thread);
  const isOnCall = useRef(false);

  const chat = useChat({
    onReply: (text) => {
      if (isOnCall.current) {
        call.speak(htmlToText(renderMarkdown(text)), call.listen);
      }
    },
    onSettled: history.syncTitles,
    threadId: history.currentId,
  });

  const call = useVoiceCall({
    onHeard: useCallback(
      (text: string) => {
        chat.setValue("");
        chat.say(text);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [chat.say],
    ),
    onInterim: chat.setValue,
  });

  const current = history.threads.find((entry) => entry.id === history.currentId);
  const canCall = current?.kind === "coaching" && isVoiceSupported();

  const toggleCall = () => {
    if (call.isCalling || isOnCall.current) {
      isOnCall.current = false;
      call.stop();
      chat.setValue("");

      return;
    }

    isOnCall.current = true;
    call.listen();
  };
  const threads = useJobThreads();

  return (
    <div className="flex h-screen flex-col bg-surface">
      <ChatHeader
        currentThreadId={history.currentId}
        onDeleteThread={history.remove}
        onLeaveSession={history.leaveSession}
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
            onStartEdit={chat.startEdit}
            statusOf={threads.statusOf}
            turns={chat.turns}
          />
          <Composer
            attachment={chat.attachment}
            canCall={canCall}
            isBusy={chat.isBusy}
            isCalling={call.isCalling || isOnCall.current}
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
            onToggleCall={toggleCall}
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
