import type { ReactNode } from "react";

import { PageHeading } from "@/shared/components/page-heading";

interface StepShellProps {
  canContinue: boolean;
  children: ReactNode;
  continueLabel?: string;
  error?: string;
  onBack: () => void;
  onContinue: () => void;
  step: number;
  subtitle: string;
  title: string;
}

export const StepShell = ({
  canContinue,
  children,
  continueLabel = "Continue",
  error,
  onBack,
  onContinue,
  step,
  subtitle,
  title,
}: StepShellProps) => (
  <section>
    <PageHeading subtitle={subtitle} title={title} />

    <div className="mt-4">{children}</div>

    <div className="mt-10 flex flex-row-reverse items-center gap-4">
      <button
        className="ml-auto rounded-lg bg-ink px-5 py-3 text-sm text-surface transition-opacity hover:opacity-90 disabled:opacity-40"
        disabled={!canContinue}
        onClick={onContinue}
        type="button"
      >
        {continueLabel}
      </button>
      {step === 1 ? null : (
        <button className="text-sm text-ink-muted" onClick={onBack} type="button">
          Back
        </button>
      )}
    </div>

    {error === undefined ? null : (
      <p className="mt-4 text-sm text-ink-muted" role="alert">
        {error}
      </p>
    )}
  </section>
);
