import { redirect } from "@tanstack/react-router";

import { getSession } from "./session";

export const requireSession = async () => {
  const session = await getSession();

  if (session === null) {
    throw redirect({ replace: true, search: { thread: "" }, to: "/" });
  }

  return session;
};
