import { createFileRoute } from "@tanstack/react-router";

import { requireSession } from "@/shared/lib/require-session";

import { SettingsScreen } from "@/features/settings";

export const Route = createFileRoute("/settings")({
  beforeLoad: requireSession,
  component: SettingsScreen,
});
