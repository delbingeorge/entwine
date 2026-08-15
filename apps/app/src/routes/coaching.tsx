import { createFileRoute } from "@tanstack/react-router";

import { coachingTabs, type CoachingTab } from "@/shared/lib/coaching-tabs";
import { requireSession } from "@/shared/lib/require-session";

import { CoachingScreen } from "@/features/coaching";

interface CoachingSearch {
  tab: CoachingTab;
}

export const Route = createFileRoute("/coaching")({
  beforeLoad: requireSession,
  component: CoachingScreen,
  validateSearch: (search: Record<string, unknown>): CoachingSearch => {
    const tab = coachingTabs.find((entry) => entry === search.tab);

    return { tab: tab ?? "Negotiation" };
  },
});
