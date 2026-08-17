import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

import { useMountTransition } from "@/shared/hooks/use-mount-transition";
import { agentName } from "@/shared/lib/agent";

import { CallWidget } from "../components/call-widget";
import { VoiceCallScreen } from "../components/voice-call-screen";
import { useLiveCall } from "../hooks/use-live-call";
import { playEndSound, playJoinSound } from "../lib/call-sounds";


interface VoiceCallContextValue {
  end: () => void;
  isActive: boolean;
  isOpen: boolean;
  start: (threadId: string, topic: string) => void;
}

const VoiceCallContext = createContext<VoiceCallContextValue | null>(null);

interface CallState {
  caption: string;
  isOpen: boolean;
  startedAt: number;
  topic: string;
}

const idleState: CallState = { caption: "", isOpen: false, startedAt: 0, topic: "" };

export const VoiceCallProvider = ({ children }: { children: ReactNode }) => {
  const [callState, setCallState] = useState<CallState>(idleState);

  const call = useLiveCall({
    onFailure: (message) => {
      setCallState((state) => ({ ...state, caption: message }));
    },
    onTranscript: (text) => {
      setCallState((state) => ({ ...state, caption: text }));
    },
  });

  const end = () => {
    playEndSound();
    call.stop();
    setCallState(idleState);
  };

  const start = (threadId: string, topic: string) => {
    playJoinSound();
    setCallState({ caption: "", isOpen: true, startedAt: Date.now(), topic });
    void call.start(threadId);
  };

  const callScreen = useMountTransition(callState.isOpen, {
    hidden: { autoAlpha: 0, scale: 0.985, y: 0 },
  });

  const callWidget = useMountTransition(!callState.isOpen && callState.startedAt !== 0, {
    hidden: { autoAlpha: 0, scale: 0.9, y: 12 },
    origin: "bottom right",
  });

  return (
    <VoiceCallContext.Provider
      value={{
        end,
        isActive: callState.startedAt !== 0,
        isOpen: callState.isOpen,
        start,
      }}
    >
      {children}

      {callScreen.isMounted ? (
        <VoiceCallScreen
          agentName={agentName}
          getLevel={call.getLevel}
          caption={callState.caption}
          isMuted={call.isMuted}
          isSilent={call.isSilent}
          onEnd={end}
          onMinimise={() => {
            setCallState((state) => ({ ...state, isOpen: false }));
          }}
          onToggleMute={call.toggleMute}
          onToggleSpeaker={call.toggleSpeaker}
          rootRef={callScreen.ref}
          startedAt={callState.startedAt}
          status={call.status}
          topic={callState.topic}
        />
      ) : null}

      {callWidget.isMounted ? (
        <CallWidget
          agentName={agentName}
          isMuted={call.isMuted}
          isSilent={call.isSilent}
          onEnd={end}
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
    </VoiceCallContext.Provider>
  );
};

export const useVoiceCall = () => {
  const ctx = useContext(VoiceCallContext);

  if (ctx === null) {
    throw new Error("useVoiceCall must be used within VoiceCallProvider");
  }

  return ctx;
};
