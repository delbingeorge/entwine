import { useState } from "react";

import { useSearch } from "@tanstack/react-router";

import { useMountTransition } from "@/shared/hooks/use-mount-transition";
import { importResume } from "@/shared/lib/profile-detail-api";

import {
  CallInvite,
  CallWidget,
  playEndSound,
  playJoinSound,
  useLiveCall,
  VoiceCallScreen,
} from "@/features/voice";

import { agentName } from "../data";
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
  const { thread } = useSearch({ from: "/" });
  const history = useThreads(thread);
  const [callState, setCallState] = useState({ caption: "", isOpen: false, startedAt: 0 });

  const chat = useChat({
    onSettled: history.syncTitles,
    threadId: history.currentId,
  });

  const call = useLiveCall({
    onFailure: (message) => {
      setCallState((state) => ({ ...state, caption: message }));
    },
    onTranscript: (text) => {
      setCallState((state) => ({ ...state, caption: text }));
    },
  });

  const current = history.threads.find((entry) => entry.id === history.currentId);
  const canCall = current?.kind === "coaching";

  const endCall = () => {
    playEndSound();
    call.stop();
    setCallState({ caption: "", isOpen: false, startedAt: 0 });
  };

  const callScreen = useMountTransition(callState.isOpen, {
    hidden: { autoAlpha: 0, scale: 0.985, y: 0 },
  });

  const callWidget = useMountTransition(!callState.isOpen && callState.startedAt !== 0, {
    hidden: { autoAlpha: 0, scale: 0.9, y: 12 },
    origin: "bottom right",
  });

  const toggleCall = () => {
    if (callState.startedAt !== 0) {
      endCall();
      return;
    }

    if (history.currentId === null) {
      return;
    }

    playJoinSound();
    setCallState({ caption: "", isOpen: true, startedAt: Date.now() });
    void call.start(history.currentId);
  };
  const threads = useJobThreads();

  return (
    <div className="flex h-screen flex-col bg-surface">
      {callScreen.isMounted ? (
        <VoiceCallScreen
          agentName={agentName}
          getLevel={call.getLevel}
          caption={callState.caption}
          isMuted={call.isMuted}
          isSilent={call.isSilent}
          onEnd={endCall}
          onMinimise={() => {
            setCallState((state) => ({ ...state, isOpen: false }));
          }}
          onToggleMute={call.toggleMute}
          onToggleSpeaker={call.toggleSpeaker}
          rootRef={callScreen.ref}
          startedAt={callState.startedAt}
          status={call.status}
          topic={current?.title ?? ""}
        />
      ) : null}

      {callWidget.isMounted ? (
        <CallWidget
          agentName={agentName}
          isMuted={call.isMuted}
          isSilent={call.isSilent}
          onEnd={endCall}
          onOpen={() => {
            setCallState((state) => ({ ...state, isOpen: true }));
          }}
          onToggleMute={call.toggleMute}
          onToggleSpeaker={call.toggleSpeaker}
          rootRef={callWidget.ref}
          startedAt={callState.startedAt}
          status={call.status}
        />
      ) : null}
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
            invite={
              canCall && callState.startedAt === 0 ? <CallInvite onJoin={toggleCall} /> : undefined
            }
            onOpenJob={threads.open}
            onStartEdit={chat.startEdit}
            statusOf={threads.statusOf}
            turns={chat.turns}
          />
          <div>
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
