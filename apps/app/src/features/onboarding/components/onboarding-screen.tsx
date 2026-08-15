import { useState } from "react";

import { SplitLayout } from "@/shared/components/split-layout";

import { ChosenSourceStep } from "./chosen-source-step";
import { SourceStep } from "./source-step";

import type { ProfileSource } from "../types";

export const OnboardingScreen = () => {
  const [source, setSource] = useState<ProfileSource | null>(null);

  return (
    <SplitLayout>
      {source === null ? (
        <SourceStep onChoose={setSource} />
      ) : (
        <ChosenSourceStep
          onBack={() => {
            setSource(null);
          }}
          source={source}
        />
      )}
    </SplitLayout>
  );
};
