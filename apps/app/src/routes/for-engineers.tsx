import { createFileRoute } from "@tanstack/react-router";

import { EngineerSignIn } from "@/features/auth";

export const Route = createFileRoute("/for-engineers")({
  component: EngineerSignIn,
});
