import { createFileRoute } from "@tanstack/react-router";

import { requireSession } from "@/shared/lib/require-session";
import { settingsTabs, type SettingsTab } from "@/shared/lib/settings-tabs";

import { SettingsScreen } from "@/features/settings";

interface SettingsSearch {
  tab: SettingsTab;
}

export const Route = createFileRoute("/settings")({
  beforeLoad: requireSession,
  component: SettingsScreen,
  validateSearch: (search: Record<string, unknown>): SettingsSearch => {
    const tab = settingsTabs.find((entry) => entry === search.tab);

    return { tab: tab ?? "Account" };
  },
});
