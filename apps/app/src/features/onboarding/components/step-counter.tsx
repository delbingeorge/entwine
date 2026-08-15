import { totalManualSteps } from "../questions";

interface StepCounterProps {
  step: number;
}

export const StepCounter = ({ step }: StepCounterProps) => (
  <span className="text-sm text-ink-muted">
    {step} of {totalManualSteps}
  </span>
);
