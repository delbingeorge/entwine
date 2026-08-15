import { createFileRoute } from "@tanstack/react-router";

import { requireSession } from "@/shared/lib/require-session";

import { OnboardingScreen } from "@/features/onboarding";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: requireSession,
  component: OnboardingScreen,
});
