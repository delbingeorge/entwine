import type { ReactNode } from "react";

interface PageHeadingProps {
  subtitle: ReactNode;
  title: string;
}

export const PageHeading = ({ subtitle, title }: PageHeadingProps) => (
  <hgroup>
    <h1 className="text-3xl text-ink">{title}</h1>
    <p className="text-3xl text-ink-muted">{subtitle}</p>
  </hgroup>
);
