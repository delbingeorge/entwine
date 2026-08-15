import { useCallback, useEffect, useState } from "react";

import {
  createThread,
  deleteThread,
  listThreads,
  type ThreadSummary,
} from "@/shared/lib/thread-api";

export const useThreads = () => {
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const listed = await listThreads();
    setThreads(listed);

    return listed;
  }, []);

  useEffect(() => {
    refresh()
      .then(async (listed) => {
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
  }, [refresh]);

  return {
    currentId,
    remove: (id: string) => {
      deleteThread(id)
        .then(refresh)
        .then((listed) => {
          if (id !== currentId) {
            return;
          }

          setCurrentId(listed[0]?.id ?? null);
        })
        .catch((cause: unknown) => {
          console.error("could not delete that chat", cause);
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
