import { useDisplayName } from "@/shared/hooks/use-display-name";

import { locationOptions, seniorityOptions, totalManualSteps } from "../questions";

import { ChipGroup } from "./chip-group";
import { SalaryField } from "./salary-field";
import { StepShell } from "./step-shell";

import type { ProfileDraft } from "../types";

interface ManualFormProps {
  draft: ProfileDraft;
  hasFailed: boolean;
  isSaving: boolean;
  onDone: (draft: ProfileDraft) => void;
  onDraftChange: (change: Partial<ProfileDraft>) => void;
  onStepChange: (step: number) => void;
  step: number;
}

export const ManualForm = ({
  draft,
  hasFailed,
  isSaving,
  onDone,
  onDraftChange,
  onStepChange,
  step,
}: ManualFormProps) => {
  const name = useDisplayName();
  const patch = onDraftChange;

  const goBack = () => {
    onStepChange(step - 1);
  };

  const goNext = () => {
    if (step === totalManualSteps) {
      onDone(draft);
      return;
    }

    onStepChange(step + 1);
  };

  const shell = { onBack: goBack, onContinue: goNext, step };

  if (step === 1) {
    return (
      <StepShell
        {...shell}
        canContinue={draft.seniority.length > 0}
        subtitle="Where are you in your career?"
        title={
          name === ""
            ? "Hello! Let's set up your profile."
            : `Hello, ${name}! Let's set up your profile.`
        }
      >
        <ChipGroup
          mode="single"
          onChange={(seniority) => {
            patch({ seniority });
          }}
          options={seniorityOptions}
          values={draft.seniority}
        />
      </StepShell>
    );
  }

  if (step === 2) {
    return (
      <StepShell
        {...shell}
        canContinue={draft.locations.length > 0}
        subtitle="Pick as many as you are open to."
        title="Where do you want to work?"
      >
        <ChipGroup
          mode="multi"
          onChange={(locations) => {
            patch({ locations });
          }}
          options={locationOptions}
          values={draft.locations}
        />
      </StepShell>
    );
  }

  return (
    <StepShell
      {...shell}
      canContinue={draft.salaryMin.length > 0 && !isSaving}
      continueLabel={isSaving ? "Saving…" : "Finish"}
      error={hasFailed ? "We could not save that. Try again." : undefined}
      subtitle="We only show you roles that clear it."
      title="What is your salary floor?"
    >
      <SalaryField
        currency={draft.salaryCurrency}
        onCurrencyChange={(salaryCurrency) => {
          patch({ salaryCurrency });
        }}
        onValueChange={(salaryMin) => {
          patch({ salaryMin });
        }}
        value={draft.salaryMin}
      />
    </StepShell>
  );
};
