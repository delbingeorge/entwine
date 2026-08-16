import { useCallback, useEffect, useRef, useState } from "react";

import {
  createThread,
  deleteThread,
  listThreads,
  type ThreadSummary,
} from "@/shared/lib/thread-api";

export const useThreads = (requestedId: string) => {
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const currentRef = useRef<string | null>(null);

  useEffect(() => {
    currentRef.current = currentId;
  }, [currentId]);

  const refresh = useCallback(async () => {
    const listed = await listThreads();
    setThreads(listed);

    return listed;
  }, []);

  useEffect(() => {
    refresh()
      .then(async (listed) => {
        const requested = listed.find((thread) => thread.id === requestedId);

        if (requested !== undefined) {
          setCurrentId(requested.id);
          return;
        }

        const newest = listed[0];

        if (newest !== undefined) {
          setCurrentId(newest.id);
          return;
        }

        const created = await createThread();
        setThreads([created]);
        setCurrentId(created.id);
      })
      .catch((cause: unknown) => {
        console.error("could not load your chats", cause);
      });
  }, [refresh, requestedId]);

  return {
    currentId,
    remove: (id: string) => {
      deleteThread(id)
        .then(refresh)
        .then(async (listed) => {
          if (currentRef.current !== id) {
            return;
          }

          const next = listed[0];

          if (next !== undefined) {
            setCurrentId(next.id);
            return;
          }

          const created = await createThread();
          setThreads([created]);
          setCurrentId(created.id);
        })
        .catch((cause: unknown) => {
          console.error("could not delete that chat", cause);
        });
    },
    leaveSession: () => {
      const chat = threads.find((thread) => thread.kind !== "coaching");

      if (chat !== undefined) {
        setCurrentId(chat.id);
        return;
      }

      createThread()
        .then(async (created) => {
          setCurrentId(created.id);
          await refresh();
        })
        .catch((cause: unknown) => {
          console.error("could not open your chat", cause);
        });
    },
    select: setCurrentId,
    startNew: () => {
      createThread()
        .then(async (created) => {
          setCurrentId(created.id);
          await refresh();
        })
        .catch((cause: unknown) => {
          console.error("could not start a new chat", cause);
        });
    },
    syncTitles: () => {
      refresh().catch(() => {
        return;
      });
    },
    threads,
  };
};
