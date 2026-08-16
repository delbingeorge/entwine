import { useCallback, useEffect, useRef, useState } from "react";

import { env } from "@/shared/lib/env";
import { getSession } from "@/shared/lib/session";

import { AudioPlayback } from "../lib/audio-playback";
import { captureWorkletUrl } from "../lib/capture-worklet";

export type LiveStatus = "Connecting" | "Listening" | "Muted" | "Speaking";

interface LiveCallOptions {
  onFailure: (message: string) => void;
  onTranscript: (text: string) => void;
}

const captureRate = 16000;

export const useLiveCall = ({ onFailure, onTranscript }: LiveCallOptions) => {
  const [status, setStatus] = useState<LiveStatus>("Connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [isSilent, setIsSilent] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const socket = useRef<WebSocket | null>(null);
  const capture = useRef<AudioContext | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const playback = useRef(new AudioPlayback());
  const muted = useRef(false);
  const silent = useRef(false);
  const live = useRef(false);
  const ending = useRef(false);
  const report = useRef(onFailure);
  const transcript = useRef(onTranscript);

  report.current = onFailure;
  transcript.current = onTranscript;

  const stop = useCallback(() => {
    ending.current = true;
    socket.current?.close();
    socket.current = null;

    stream.current?.getTracks().forEach((track) => {
      track.stop();
    });
    stream.current = null;

    void capture.current?.close();
    capture.current = null;

    void playback.current.close();
    playback.current = new AudioPlayback();

    live.current = false;
    muted.current = false;
    silent.current = false;
    setIsLive(false);
    setIsMuted(false);
    setIsSilent(false);
    setStatus("Connecting");
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(
    async (threadId: string) => {
      ending.current = false;

      try {
        const auth = await getSession();

        if (auth === null) {
          report.current("You are signed out.");

          return;
        }

        const microphone = await navigator.mediaDevices.getUserMedia({
          audio: { autoGainControl: true, echoCancellation: true, noiseSuppression: true },
        });

        stream.current = microphone;

        const context = new AudioContext({ sampleRate: captureRate });
        capture.current = context;

        const url = captureWorkletUrl();
        await context.audioWorklet.addModule(url);
        URL.revokeObjectURL(url);

        await playback.current.ready();

        const connection = new WebSocket(`${env.VITE_API_URL.replace(/^http/u, "ws")}/v1/voice`);
        connection.binaryType = "arraybuffer";
        socket.current = connection;

        connection.onopen = () => {
          connection.send(JSON.stringify({ threadId, token: auth.access_token }));

          const node = new AudioWorkletNode(context, "pcm-capture");
          node.port.onmessage = (event: MessageEvent<Int16Array>) => {
            if (muted.current || connection.readyState !== WebSocket.OPEN) {
              return;
            }

            connection.send(event.data);
          };

          context.createMediaStreamSource(microphone).connect(node);
          node.connect(context.destination);
        };

        connection.onmessage = (event: MessageEvent<ArrayBuffer | string>) => {
          if (typeof event.data !== "string") {
            setStatus("Speaking");
            playback.current.play(event.data, () => {
              setStatus("Listening");
            });

            return;
          }

          const notice = JSON.parse(event.data) as { text?: string; type: string };

          if (notice.type === "ready") {
            live.current = true;
            setIsLive(true);
            setStatus("Listening");
          }

          if (notice.type === "interrupted") {
            playback.current.flush();
            setStatus("Listening");
          }

          if (notice.type === "transcript" && notice.text !== undefined) {
            transcript.current(notice.text);
          }

          if (notice.type === "error") {
            report.current(notice.text ?? "The call could not start.");
          }
        };

        connection.onerror = () => {
          report.current("Could not reach the server. Is the API running?");
        };

        connection.onclose = (event) => {
          if (!live.current && !ending.current) {
            console.error("voice socket closed before it was ready", event.code, event.reason);
            report.current(
              event.reason === ""
                ? "The call could not start. Check the API logs."
                : `The call could not start: ${event.reason}`,
            );
          }

          stop();
        };
      } catch (cause) {
        console.error("could not start the call", cause);
        report.current("Could not reach your microphone.");
        stop();
      }
    },
    [stop],
  );

  return {
    getLevel: useCallback(() => playback.current.level(), []),
    isLive,
    isMuted,
    isSilent,
    start,
    status: isMuted ? ("Muted" as LiveStatus) : status,
    stop,
    toggleMute: () => {
      muted.current = !muted.current;
      setIsMuted(muted.current);
    },
    toggleSpeaker: () => {
      silent.current = !silent.current;
      playback.current.setMuted(silent.current);

      if (silent.current) {
        playback.current.flush();
      }

      setIsSilent(silent.current);
    },
  };
};
