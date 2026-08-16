import { useCallback, useRef, useState } from "react";

import { useSearch } from "@tanstack/react-router";

import { useMountTransition } from "@/shared/hooks/use-mount-transition";
import { isVoiceSupported, useVoiceCall } from "@/shared/hooks/use-voice-call";
import { importResume } from "@/shared/lib/profile-detail-api";

import { CallWidget, VoiceCallScreen } from "@/features/voice";

import { agentName } from "../data";
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
  const [callState, setCallState] = useState({
    caption: "",
    isMuted: false,
    isOpen: false,
    isSilent: false,
    startedAt: 0,
  });

  const chat = useChat({
    onReply: (text) => {
      if (!isOnCall.current) {
        return;
      }

      const spoken = htmlToText(renderMarkdown(text));
      setCallState((current) => ({ ...current, caption: spoken }));

      if (callState.isSilent) {
        call.listen();
        return;
      }

      call.speak(spoken, call.listen);
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

  const endCall = () => {
    isOnCall.current = false;
    call.stop();
    chat.setValue("");
    setCallState({ caption: "", isMuted: false, isOpen: false, isSilent: false, startedAt: 0 });
  };

  const toggleMute = () => {
    setCallState((state) => {
      const isMuted = !state.isMuted;

      if (isMuted) {
        call.stop();
      } else {
        call.listen();
      }

      return { ...state, isMuted };
    });
  };

  const toggleSpeaker = () => {
    window.speechSynthesis.cancel();
    setCallState((state) => ({ ...state, isSilent: !state.isSilent }));
  };

  const callScreen = useMountTransition(callState.isOpen, {
    hidden: { autoAlpha: 0, scale: 0.985, y: 0 },
  });

  const callWidget = useMountTransition(!callState.isOpen && callState.startedAt !== 0, {
    hidden: { autoAlpha: 0, scale: 0.9, y: 12 },
    origin: "bottom right",
  });

  const toggleCall = () => {
    if (call.isCalling || isOnCall.current) {
      endCall();
      return;
    }

    isOnCall.current = true;
    setCallState((state) => ({ ...state, isOpen: true, startedAt: Date.now() }));
    call.listen();
  };
  const threads = useJobThreads();

  return (
    <div className="flex h-screen flex-col bg-surface">
      {callScreen.isMounted ? (
        <VoiceCallScreen
          agentName={agentName}
          caption={callState.caption}
          isMuted={callState.isMuted}
          isSilent={callState.isSilent}
          onEnd={endCall}
          onMinimise={() => {
            setCallState((state) => ({ ...state, isOpen: false }));
          }}
          onShowTranscript={() => {
            setCallState((state) => ({ ...state, isOpen: false }));
          }}
          onToggleMute={toggleMute}
          onToggleSpeaker={toggleSpeaker}
          rootRef={callScreen.ref}
          startedAt={callState.startedAt}
          status={chat.isBusy ? "Connecting" : call.isCalling ? "Listening" : "Speaking"}
          topic={current?.title ?? ""}
        />
      ) : null}

      {callWidget.isMounted ? (
        <CallWidget
          agentName={agentName}
          isMuted={callState.isMuted}
          isSilent={callState.isSilent}
          onEnd={endCall}
          onOpen={() => {
            setCallState((state) => ({ ...state, isOpen: true }));
          }}
          onToggleMute={toggleMute}
          onToggleSpeaker={toggleSpeaker}
          rootRef={callWidget.ref}
          startedAt={callState.startedAt}
          status={chat.isBusy ? "Connecting" : call.isCalling ? "Listening" : "Speaking"}
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
