import { PageHeading } from "@/shared/components/page-heading";

import type { ProfileSource } from "../types";

interface ChosenSourceStepProps {
  onBack: () => void;
  source: ProfileSource;
}

export const ChosenSourceStep = ({ onBack, source }: ChosenSourceStepProps) => (
  <section>
    <PageHeading
      subtitle="Not built yet."
      title={source === "resume" ? "Upload your resume" : "Tell us about your work"}
    />
    <button
      className="mt-10 w-fit border-b border-border pb-1 text-sm text-ink transition-colors hover:border-ink"
      onClick={onBack}
      type="button"
    >
      Pick a different way
    </button>
  </section>
);
