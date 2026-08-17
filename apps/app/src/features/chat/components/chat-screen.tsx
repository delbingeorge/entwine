import { useLayoutEffect, useRef } from "react";

import { useSearch } from "@tanstack/react-router";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";

import { useDisplayName } from "@/shared/hooks/use-display-name";
import { placeholderFor } from "@/shared/lib/scenarios";

import { useVoiceCall } from "@/features/voice";

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
  const voiceCall = useVoiceCall();

  const chat = useChat({
    onSettled: history.syncTitles,
    threadId: history.currentId,
  });

  const current = history.threads.find((entry) => entry.id === history.currentId);
  const canCall = current?.kind === "coaching";

  const threads = useJobThreads();
  const isEmpty = chat.turns.length === 0;
  const showIntro = isEmpty && !chat.isLoading;
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
      canCall={canCall && !voiceCall.isActive}
      chat={chat}
      onJoinCall={() => {
        if (history.currentId !== null) {
          voiceCall.start(history.currentId, current?.title ?? "");
        }
      }}
      onSubmit={send}
      placeholder={placeholderFor(canCall, current?.title ?? "")}
    />
  );

  return (
    <div className="flex h-screen flex-col bg-surface">
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
        showIntro ? (
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
