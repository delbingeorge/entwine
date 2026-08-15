import type { ReactNode } from "react";

import { BlurText } from "./blur-text";

interface PageHeadingProps {
  subtitle: ReactNode;
  title: string;
}

export const PageHeading = ({ subtitle, title }: PageHeadingProps) => (
  <hgroup>
    <BlurText as="h1" className="text-3xl text-ink" text={title} />
    {typeof subtitle === "string" ? (
      <BlurText className="text-3xl text-ink-muted" delay={0.12} text={subtitle} />
    ) : (
      <p className="text-3xl text-ink-muted">{subtitle}</p>
    )}
  </hgroup>
);
