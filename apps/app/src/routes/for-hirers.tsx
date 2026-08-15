import { createFileRoute } from "@tanstack/react-router";

import { HirerSignIn } from "@/features/auth";

export const Route = createFileRoute("/for-hirers")({
  component: HirerSignIn,
});
