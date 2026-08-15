import { createFileRoute, redirect } from "@tanstack/react-router";

import { getProfile } from "@/shared/lib/profile-api";
import { getSession } from "@/shared/lib/session";

import { SignUpScreen } from "@/features/auth";
import { ChatScreen } from "@/features/chat";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getSession();

    if (session === null) {
      return { isSignedIn: false };
    }

    if ((await getProfile()) === null) {
      throw redirect({ replace: true, to: "/onboarding" });
    }

    return { isSignedIn: true };
  },
  component: HomePage,
});

function HomePage() {
  const { isSignedIn } = Route.useRouteContext();

  return isSignedIn ? <ChatScreen /> : <SignUpScreen />;
}
