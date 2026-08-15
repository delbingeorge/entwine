import { useEffect, useState } from "react";

import { useNavigate, useSearch } from "@tanstack/react-router";

import { FadeSwap } from "@/shared/components/fade-swap";
import { SplitLayout } from "@/shared/components/split-layout";
import { getProfile } from "@/shared/lib/profile-api";

import { draftFromProfile } from "../api/draft-from-profile";
import { useSaveProfile } from "../hooks/use-save-profile";
import { emptyDraft, type ProfileDraft } from "../types";

import { ManualForm } from "./manual-form";
import { StepCounter } from "./step-counter";

export const OnboardingScreen = () => {
  const navigate = useNavigate();
  const { hasFailed, isSaving, save } = useSaveProfile();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft);
  const { edit } = useSearch({ from: "/onboarding" });

  useEffect(() => {
    if (!edit) {
      return;
    }

    getProfile()
      .then((profile) => {
        setDraft(draftFromProfile(profile));
      })
      .catch((cause: unknown) => {
        console.error("could not load your answers", cause);
      });
  }, [edit]);

  const patch = (change: Partial<ProfileDraft>) => {
    setDraft((current) => ({ ...current, ...change }));
  };

  const finish = (completed: ProfileDraft) => {
    void save(completed).then((saved) => {
      if (saved) {
        void navigate({ replace: true, to: "/" });
      }
    });
  };

  return (
    <SplitLayout headerAside={<StepCounter step={step} />} wide>
      <FadeSwap swapKey={step}>
        <ManualForm
          draft={draft}
          hasFailed={hasFailed}
          isSaving={isSaving}
          onDone={finish}
          onDraftChange={patch}
          onStepChange={setStep}
          step={step}
        />
      </FadeSwap>
    </SplitLayout>
  );
};
