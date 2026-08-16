import { useState } from "react";

import { useNavigate, useSearch } from "@tanstack/react-router";

import { LucideIcon } from "@/shared/components/lucide-icon";
import { TabBar } from "@/shared/components/tab-bar";
import { coachingTabs, type CoachingTab } from "@/shared/lib/coaching-tabs";
import { createThread } from "@/shared/lib/thread-api";

import { scenariosByTab, type Scenario } from "../scenarios";

import { ScenarioCard } from "./scenario-card";

export const CoachingScreen = () => {
  const navigate = useNavigate();
  const { tab } = useSearch({ from: "/coaching" });
  const [isBusy, setIsBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const begin = (scenario: Scenario) => {
    setIsBusy(true);
    setFailure(null);

    createThread({ kind: "coaching", title: scenario.title })
      .then(async (thread) => {
        await navigate({ search: { thread: thread.id }, to: "/" });
      })
      .catch((cause: unknown) => {
        console.error("could not start coaching", cause);
        setFailure("Could not start that session. Try again in a moment.");
        setIsBusy(false);
      });
  };

  return (
    <div className="flex h-screen flex-col bg-surface">
      <header className="flex h-12 shrink-0 items-center gap-2 px-8" />
      <div className="min-h-0 flex-1 overflow-y-auto px-8">
        <div className="mx-auto w-full max-w-3xl font-ui">
          <div className="sticky top-0 z-10 bg-surface pt-5">
            <button
              className="-ml-2 flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] text-composer-soft hover:bg-composer-track hover:text-composer-ink"
              onClick={() => {
                void navigate({ search: { thread: "" }, to: "/" });
              }}
              type="button"
            >
              <LucideIcon className="size-3.5 shrink-0" name="chevron-left" />
              Back
            </button>
            <h1 className="pt-3 text-[32px] leading-tight font-semibold tracking-tight text-composer-ink">
              Coaching
            </h1>
            <TabBar
              current={tab}
              onChange={(next: CoachingTab) => {
                void navigate({ replace: true, search: { tab: next }, to: "/coaching" });
              }}
              tabs={coachingTabs}
            />
          </div>

          <div className="pt-7 pb-16">
            <p className="pb-5 text-[12.5px] leading-relaxed text-composer-soft">
              Rehearse the conversations that decide your salary. Ellie plays the other side.
            </p>

            {failure === null ? null : (
              <p className="pb-4 text-[12.5px] text-composer-soft" role="alert">
                {failure}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {scenariosByTab[tab].map((scenario) => (
                <ScenarioCard
                  isBusy={isBusy}
                  key={scenario.id}
                  onBegin={() => {
                    begin(scenario);
                  }}
                  scenario={scenario}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
