import { useEffect, useState } from "react";

import { getSession } from "@/shared/lib/session";

const readName = (metadata: Record<string, unknown>) => {
  const raw = metadata.name ?? metadata.full_name;

  if (typeof raw !== "string") {
    return "";
  }

  return raw.trim().split(" ")[0] ?? "";
};

export const useDisplayName = () => {
  const [name, setName] = useState("");

  useEffect(() => {
    void getSession().then((session) => {
      if (session !== null) {
        setName(readName(session.user.user_metadata));
      }
    });
  }, []);

  return name;
};
