import type { ProfileSource } from "../types";

interface ChosenSourceStepProps {
  onBack: () => void;
  source: ProfileSource;
}

export const ChosenSourceStep = ({ onBack, source }: ChosenSourceStepProps) => (
  <section>
    <h1 className="text-3xl text-ink">
      {source === "resume" ? "Upload your resume" : "Tell us about your work"}
    </h1>
    <p className="text-3xl text-ink-muted">Not built yet.</p>
    <button
      className="mt-10 w-fit border-b border-border pb-1 text-sm text-ink transition-colors hover:border-ink"
      onClick={onBack}
      type="button"
    >
      Pick a different way
    </button>
  </section>
);
