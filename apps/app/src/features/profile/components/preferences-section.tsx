import { Link } from "@tanstack/react-router";

import { formatSalary } from "@/shared/lib/currencies";
import type { Profile } from "@/shared/lib/profile-api";

const seniorityLabels: Record<string, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  staff: "Staff and above",
};

const Label = ({ children }: { children: string }) => (
  <p className="pb-2 text-[11px] tracking-widest text-composer-placeholder">{children}</p>
);

const Fact = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-composer-line bg-composer-surface px-3.5 py-3">
    <p className="text-[10px] tracking-widest text-composer-placeholder">{label}</p>
    <p className="pt-1 text-[15px] text-composer-ink">{value === "" ? "Not set" : value}</p>
  </div>
);

const Chips = ({ values }: { values: string[] }) =>
  values.length === 0 ? (
    <p className="text-[12.5px] text-composer-placeholder">Not set</p>
  ) : (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span
          className="rounded-full border border-composer-line px-3 py-1 text-[12px] text-composer-soft"
          key={value}
        >
          {value}
        </span>
      ))}
    </div>
  );

interface PreferencesSectionProps {
  profile: Profile | null;
}

export const PreferencesSection = ({ profile }: PreferencesSectionProps) => (
  <section className="border-t border-composer-line pt-7">
    <h2 className="pb-4 text-[11px] tracking-widest text-composer-placeholder">
      WHAT YOU'RE LOOKING FOR
    </h2>

    {profile === null ? (
      <p className="text-[12.5px] leading-relaxed text-composer-placeholder">
        You haven't set your preferences yet.
      </p>
    ) : (
      <div className="flex flex-col gap-6">
        <p className="text-[12.5px] leading-relaxed text-composer-soft">
          Ellie searches against these. Change them whenever you like.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Fact label="LEVEL" value={seniorityLabels[profile.seniority] ?? profile.seniority} />
          <Fact
            label="SALARY FLOOR"
            value={
              profile.salaryMin === 0 ? "" : formatSalary(profile.salaryMin, profile.salaryCurrency)
            }
          />
        </div>

        <div>
          <Label>LOCATIONS</Label>
          <Chips values={profile.locations} />
        </div>
      </div>
    )}

    <Link
      className="mt-6 inline-flex items-center rounded-full border border-composer-line px-3.5 py-1.5 text-[12px] text-composer-soft hover:text-composer-ink"
      search={{ edit: true }}
      to="/onboarding"
    >
      {profile === null ? "Set your preferences" : "Update these answers"}
    </Link>
  </section>
);
