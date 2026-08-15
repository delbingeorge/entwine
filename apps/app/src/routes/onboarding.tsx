import { createFileRoute, redirect } from "@tanstack/react-router";

import { getProfile } from "@/shared/lib/profile-api";
import { requireSession } from "@/shared/lib/require-session";

import { OnboardingScreen } from "@/features/onboarding";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async () => {
    await requireSession();

    if ((await getProfile()) !== null) {
      throw redirect({ replace: true, to: "/" });
    }
  },
  component: OnboardingScreen,
});
