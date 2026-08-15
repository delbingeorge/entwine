import { createFileRoute, redirect } from "@tanstack/react-router";

import { getProfile } from "@/shared/lib/profile-api";
import { requireSession } from "@/shared/lib/require-session";

import { OnboardingScreen } from "@/features/onboarding";

interface OnboardingSearch {
  edit: boolean;
}

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async ({ search }) => {
    await requireSession();

    if (search.edit) {
      return;
    }

    if ((await getProfile()) !== null) {
      throw redirect({ replace: true, to: "/" });
    }
  },
  component: OnboardingScreen,
  validateSearch: (search: Record<string, unknown>): OnboardingSearch => ({
    edit: search.edit === true || search.edit === "true",
  }),
});
