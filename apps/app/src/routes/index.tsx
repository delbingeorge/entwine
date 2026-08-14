import { createFileRoute } from "@tanstack/react-router";

import { SignUpScreen } from "@/features/auth";

export const Route = createFileRoute("/")({
  component: SignUpScreen,
});
