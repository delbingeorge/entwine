import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";

interface IntentLinkProps {
  children: ReactNode;
  to: "/for-engineers" | "/for-hirers";
}

export const IntentLink = ({ children, to }: IntentLinkProps) => (
  <Link
    className="text-ink underline decoration-border decoration-2 underline-offset-4 transition-colors hover:decoration-ink"
    to={to}
  >
    {children}
  </Link>
);
