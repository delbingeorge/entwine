import { createFileRoute } from "@tanstack/react-router";

import { profileTabs, type ProfileTab } from "@/shared/lib/profile-tabs";
import { requireSession } from "@/shared/lib/require-session";

import { ProfileScreen } from "@/features/profile";

interface ProfileSearch {
  tab: ProfileTab;
}

export const Route = createFileRoute("/profile")({
  beforeLoad: requireSession,
  component: ProfileScreen,
  validateSearch: (search: Record<string, unknown>): ProfileSearch => {
    const tab = profileTabs.find((entry) => entry === search.tab);

    return { tab: tab ?? "Account" };
  },
});
