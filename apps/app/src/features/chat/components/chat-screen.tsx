import { useLayoutEffect, useRef, useState } from "react";

import { useSearch } from "@tanstack/react-router";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";

import { useDisplayName } from "@/shared/hooks/use-display-name";
import { useMountTransition } from "@/shared/hooks/use-mount-transition";
import { placeholderFor } from "@/shared/lib/scenarios";

import {
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
import { introCopy } from "../lib/intro-copy";

import { ChatHeader } from "./chat-header";
import { JobThread } from "./job-thread";
import { ThreadComposer } from "./thread-composer";
import { ThreadIntro } from "./thread-intro";
import { Transcript } from "./transcript";

import "../styles/md-body.css";

gsap.registerPlugin(Flip);

export const ChatScreen = () => {
  const { thread } = useSearch({ from: "/" });
  const history = useThreads(thread ?? "");
  const name = useDisplayName();
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
  const isEmpty = chat.turns.length === 0;
  const flipState = useRef<Flip.FlipState | null>(null);

  useLayoutEffect(() => {
    if (flipState.current === null) {
      return;
    }

    Flip.from(flipState.current, {
      absolute: true,
      duration: 0.62,
      ease: "power3.inOut",
      onLeave: (leaving) => gsap.to(leaving, { autoAlpha: 0, y: -12, duration: 0.28 }),
    });

    flipState.current = null;
  }, [isEmpty]);

  const send = () => {
    if (isEmpty) {
      try {
        flipState.current = Flip.getState("[data-flip-id]");
      } catch (cause) {
        console.error("could not capture the layout", cause);
        flipState.current = null;
      }
    }

    chat.submit();
  };

  // Blank threads are reused, and a streaming reply would be abandoned.
  const canStartNew = !isEmpty && !chat.isBusy;

  const startNewThread = () => {
    if (!canStartNew) {
      return;
    }

    history.startNew();
  };

  const composer = (
    <ThreadComposer
      canCall={canCall && callState.startedAt === 0}
      chat={chat}
      onJoinCall={toggleCall}
      onSubmit={send}
      placeholder={placeholderFor(canCall, current?.title ?? "")}
    />
  );

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
        canStartNew={canStartNew}
        onDeleteThread={history.remove}
        onLeaveSession={history.leaveSession}
        onNewThread={startNewThread}
        onOpenJob={threads.open}
        onSelectThread={history.select}
        startedIds={threads.startedIds}
        statusOf={threads.statusOf}
        threads={history.threads}
      />

      {threads.openJob === undefined ? (
        isEmpty ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 pb-16">
            <div className="flex w-full max-w-2xl flex-col">
              <ThreadIntro {...introCopy(canCall, name, current?.title ?? "")} />
              {composer}
            </div>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 px-8 pb-4" style={{ gridTemplateRows: "1fr auto" }}>
            <Transcript
              onOpenJob={threads.open}
              onStartEdit={chat.startEdit}
              statusOf={threads.statusOf}
              turns={chat.turns}
            />
            {composer}
          </div>
        )
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
