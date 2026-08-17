import { useCallback, useEffect, useRef, useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import {
  createThread,
  deleteThread,
  listThreads,
  type ThreadSummary,
} from "@/shared/lib/thread-api";

export const useThreads = (requestedId: string) => {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const resolvingFor = useRef<string | null>(null);
  const latestRequest = useRef(requestedId);
  latestRequest.current = requestedId;

  const open = useCallback(
    (id: string, replace = false) => {
      void navigate({ replace, search: { thread: id }, to: "/" });
    },
    [navigate],
  );

  const refresh = useCallback(async () => {
    const listed = await listThreads();
    setThreads(listed);

    return listed;
  }, []);

  const openNewest = useCallback(
    async (listed: ThreadSummary[]) => {
      const newest = listed[0];

      if (newest !== undefined) {
        open(newest.id, true);

        return;
      }

      const created = await createThread();
      setThreads([created]);
      open(created.id, true);
    },
    [open],
  );

  const isKnown = threads.some((thread) => thread.id === requestedId);

  useEffect(() => {
    if (isKnown || resolvingFor.current === requestedId) {
      return;
    }

    resolvingFor.current = requestedId;

    refresh()
      .then(async (listed) => {
        if (latestRequest.current !== requestedId) {
          return;
        }

        if (!listed.some((thread) => thread.id === requestedId)) {
          await openNewest(listed);
        }
      })
      .catch((cause: unknown) => {
        console.error("could not load your chats", cause);
      })
      .finally(() => {
        if (resolvingFor.current === requestedId) {
          resolvingFor.current = null;
        }
      });
  }, [isKnown, openNewest, refresh, requestedId]);

  const openFresh = () => {
    createThread()
      .then(async (created) => {
        await refresh();
        open(created.id);
      })
      .catch((cause: unknown) => {
        console.error("could not start a new chat", cause);
      });
  };

  return {
    currentId: isKnown ? requestedId : null,
    leaveSession: () => {
      const chat = threads.find((thread) => thread.kind !== "coaching");

      if (chat !== undefined) {
        open(chat.id);

        return;
      }

      openFresh();
    },
    remove: (id: string) => {
      deleteThread(id)
        .then(refresh)
        .catch((cause: unknown) => {
          console.error("could not delete that chat", cause);
        });
    },
    select: (id: string) => {
      open(id);
    },
    startNew: openFresh,
    syncTitles: () => {
      refresh().catch(() => {
        return;
      });
    },
    threads,
  };
};
