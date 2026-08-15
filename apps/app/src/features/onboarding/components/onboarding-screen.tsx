import { useState } from "react";

import { FadeSwap } from "@/shared/components/fade-swap";
import { SplitLayout } from "@/shared/components/split-layout";

import { DraftSummary } from "./draft-summary";
import { ManualForm } from "./manual-form";
import { StepCounter } from "./step-counter";

import type { ProfileDraft } from "../types";

export const OnboardingScreen = () => {
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [step, setStep] = useState(1);

  const restart = () => {
    setDraft(null);
    setStep(1);
  };

  return (
    <SplitLayout headerAside={draft === null ? <StepCounter step={step} /> : null} wide>
      <FadeSwap swapKey={draft === null ? step : "summary"}>
        {draft === null ? (
          <ManualForm onDone={setDraft} onStepChange={setStep} step={step} />
        ) : (
          <DraftSummary draft={draft} onEdit={restart} />
        )}
      </FadeSwap>
    </SplitLayout>
  );
};
