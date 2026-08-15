import { PageHeading } from "@/shared/components/page-heading";

import type { ProfileDraft } from "../types";

interface DraftSummaryProps {
  draft: ProfileDraft;
  onEdit: () => void;
}

const rows = (draft: ProfileDraft) => [
  { label: "Level", value: draft.seniority.join(", ") },
  { label: "Stack", value: draft.stack.join(", ") },
  { label: "Locations", value: draft.locations.join(", ") },
  { label: "Salary floor", value: draft.salaryMin === "" ? "" : `₹${draft.salaryMin}` },
  { label: "Wants to build", value: draft.wantsToBuild },
];

export const DraftSummary = ({ draft, onEdit }: DraftSummaryProps) => (
  <section>
    <PageHeading subtitle="Here is what we have." title="That is everything" />
    <dl className="mt-8 flex flex-col gap-3">
      {rows(draft)
        .filter((row) => row.value !== "")
        .map((row) => (
          <div className="flex gap-4 border-b border-border pb-3" key={row.label}>
            <dt className="w-32 shrink-0 text-sm text-ink-muted">{row.label}</dt>
            <dd className="text-sm text-ink">{row.value}</dd>
          </div>
        ))}
    </dl>
    <p className="mt-6 text-sm text-ink-muted">Saving this needs the profile API, which is next.</p>
    <button
      className="mt-4 w-fit border-b border-border pb-1 text-sm text-ink transition-colors hover:border-ink"
      onClick={onEdit}
      type="button"
    >
      Change something
    </button>
  </section>
);
