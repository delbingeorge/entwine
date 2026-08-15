import { createFileRoute } from "@tanstack/react-router";

import { CompanySignIn } from "@/features/auth";

export const Route = createFileRoute("/for-companies")({
  component: CompanySignIn,
});
