import { PageHeading } from "@/shared/components/page-heading";

import { useSaveProfile } from "../hooks/use-save-profile";

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

export const DraftSummary = ({ draft, onEdit }: DraftSummaryProps) => {
  const { save, state } = useSaveProfile();

  return (
    <section>
      <PageHeading
        subtitle={state === "saved" ? "Your profile is saved." : "Here is what we have."}
        title={state === "saved" ? "All set" : "That is everything"}
      />
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

      {state === "saved" ? null : (
        <div className="mt-10 flex items-center gap-4">
          <button
            className="rounded-lg bg-ink px-5 py-3 text-sm text-surface transition-opacity hover:opacity-90 disabled:opacity-40"
            disabled={state === "saving"}
            onClick={() => {
              void save(draft);
            }}
            type="button"
          >
            {state === "saving" ? "Saving…" : "Save profile"}
          </button>
          <button className="text-sm text-ink-muted" onClick={onEdit} type="button">
            Change something
          </button>
        </div>
      )}

      {state === "failed" ? (
        <p className="mt-4 text-sm text-ink-muted" role="alert">
          We could not save that. Try again.
        </p>
      ) : null}
    </section>
  );
};
