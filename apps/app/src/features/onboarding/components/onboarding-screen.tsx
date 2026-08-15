import { useState } from "react";

import { SplitLayout } from "@/shared/components/split-layout";

import { ChosenSourceStep } from "./chosen-source-step";
import { DraftSummary } from "./draft-summary";
import { ManualForm } from "./manual-form";
import { SourceStep } from "./source-step";
import { StepCounter } from "./step-counter";

import type { ProfileDraft, ProfileSource } from "../types";

export const OnboardingScreen = () => {
  const [source, setSource] = useState<ProfileSource | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [step, setStep] = useState(1);

  const restart = () => {
    setDraft(null);
    setSource(null);
    setStep(1);
  };

  const isFilling = source === "manual" && draft === null;

  return (
    <SplitLayout headerAside={isFilling ? <StepCounter step={step} /> : null} wide>
      {source === null ? <SourceStep onChoose={setSource} /> : null}
      {source === "resume" ? <ChosenSourceStep onBack={restart} source={source} /> : null}
      {isFilling ? (
        <ManualForm onBack={restart} onDone={setDraft} onStepChange={setStep} step={step} />
      ) : null}
      {draft === null ? null : <DraftSummary draft={draft} onEdit={restart} />}
    </SplitLayout>
  );
};
