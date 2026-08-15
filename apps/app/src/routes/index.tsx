import { createFileRoute, redirect } from "@tanstack/react-router";

import { getProfile } from "@/shared/lib/profile-api";
import { getSession } from "@/shared/lib/session";

import { SignUpScreen } from "@/features/auth";
import { ChatScreen } from "@/features/chat";

interface HomeSearch {
  thread: string;
}

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getSession();

    if (session === null) {
      return { isSignedIn: false };
    }

    if ((await getProfile()) === null) {
      throw redirect({ replace: true, search: { edit: false }, to: "/onboarding" });
    }

    return { isSignedIn: true };
  },
  component: HomePage,
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    thread: typeof search.thread === "string" ? search.thread : "",
  }),
});

function HomePage() {
  const { isSignedIn } = Route.useRouteContext();

  return isSignedIn ? <ChatScreen /> : <SignUpScreen />;
}
