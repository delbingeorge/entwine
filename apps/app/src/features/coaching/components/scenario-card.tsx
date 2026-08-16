import { LucideIcon } from "@/shared/components/lucide-icon";

import type { Scenario } from "../scenarios";

interface ScenarioCardProps {
  isBusy: boolean;
  onBegin: () => void;
  scenario: Scenario;
}

export const ScenarioCard = ({ isBusy, onBegin, scenario }: ScenarioCardProps) => (
  <button
    className="group flex min-h-[132px] flex-col items-start gap-2 rounded-xl border border-composer-line bg-composer-surface px-4 py-4 text-left transition-colors hover:bg-composer-track disabled:opacity-60"
    disabled={isBusy}
    onClick={onBegin}
    type="button"
  >
    <span className="flex w-full items-start justify-between gap-2">
      <span className="min-w-0 text-[14px] leading-snug text-composer-ink">{scenario.title}</span>
      {scenario.isTailored === true ? (
        <span className="shrink-0 rounded-full border border-composer-line px-2 py-0.5 text-[10px] tracking-widest text-composer-soft">
          TAILORED
        </span>
      ) : null}
    </span>

    <span className="text-[12.5px] leading-relaxed text-composer-soft">{scenario.subtitle}</span>

    <span className="mt-auto flex items-center gap-1.5 pt-2 text-[12.5px] text-composer-soft group-hover:text-composer-ink">
      Begin
      <LucideIcon
        className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
        name="arrow-right"
      />
    </span>
  </button>
);
