import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechResult {
  0: { transcript: string };
  isFinal: boolean;
}

interface SpeechEvent {
  resultIndex: number;
  results: { length: number } & Record<number, SpeechResult>;
}

interface Recognition {
  abort: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

type RecognitionConstructor = new () => Recognition;

const recognitionClass = (): RecognitionConstructor | undefined => {
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };

  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition;
};

export const isVoiceSupported = () => recognitionClass() !== undefined;

interface VoiceCallOptions {
  onHeard: (text: string) => void;
  onInterim: (text: string) => void;
}

export const useVoiceCall = ({ onHeard, onInterim }: VoiceCallOptions) => {
  const [isCalling, setIsCalling] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const heard = useRef(onHeard);
  const interim = useRef(onInterim);

  heard.current = onHeard;
  interim.current = onInterim;

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    recognition.current?.abort();
    recognition.current = null;
    setIsCalling(false);
  }, []);

  useEffect(() => stop, [stop]);

  const listen = useCallback(() => {
    const Recogniser = recognitionClass();

    if (Recogniser === undefined) {
      return;
    }

    const session = new Recogniser();
    session.lang = "en-IN";
    session.continuous = false;
    session.interimResults = true;

    session.onresult = (event) => {
      let draft = "";

      for (let index = event.resultIndex; index < event.results.length; index++) {
        const result = event.results[index];

        if (result === undefined) {
          continue;
        }

        if (result.isFinal) {
          heard.current(result[0].transcript.trim());
          return;
        }

        draft += result[0].transcript;
      }

      interim.current(draft);
    };

    session.onerror = () => {
      setIsCalling(false);
    };

    session.onend = () => {
      setIsCalling(false);
    };

    recognition.current = session;
    session.start();
    setIsCalling(true);
  }, []);

  return {
    isCalling,
    listen,
    speak: useCallback((text: string, onDone: () => void) => {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";
      utterance.onend = onDone;
      utterance.onerror = onDone;

      window.speechSynthesis.speak(utterance);
    }, []),
    stop,
  };
};
