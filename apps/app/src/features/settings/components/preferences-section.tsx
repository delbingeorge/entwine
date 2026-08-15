import { Link } from "@tanstack/react-router";

import type { Profile } from "@/shared/lib/profile-api";

const seniorityLabels: Record<string, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  staff: "Staff and above",
};

const remoteLabels: Record<string, string> = {
  remote: "Remote only",
  hybrid: "Hybrid",
  onsite: "On-site",
  any: "Open",
};

const money = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  maximumFractionDigits: 0,
  style: "currency",
});

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-composer-line py-2.5 last:border-b-0">
    <span className="shrink-0 text-[11px] tracking-widest text-composer-placeholder">{label}</span>
    <span className="min-w-0 text-right text-[13px] text-composer-ink">
      {value === "" ? "—" : value}
    </span>
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
      <div className="flex flex-col gap-4">
        <p className="text-[12.5px] leading-relaxed text-composer-soft">
          Ellie searches against these. You can change them whenever you like — updating them
          changes what she looks for next.
        </p>

        <div className="flex flex-col">
          <Row label="LEVEL" value={seniorityLabels[profile.seniority] ?? profile.seniority} />
          <Row label="STACK" value={profile.primaryStack.join(", ")} />
          <Row label="LOCATIONS" value={profile.locations.join(", ")} />
          <Row label="WORK STYLE" value={remoteLabels[profile.remotePref] ?? profile.remotePref} />
          <Row
            label="SALARY FLOOR"
            value={profile.salaryMin === 0 ? "" : money.format(profile.salaryMin)}
          />
          <Row label="WANTS TO BUILD" value={profile.wantsToBuild} />
        </div>
      </div>
    )}

    <Link
      className="mt-4 inline-flex items-center rounded-full border border-composer-line px-3.5 py-1.5 text-[12px] text-composer-soft hover:text-composer-ink"
      search={{ edit: true }}
      to="/onboarding"
    >
      {profile === null ? "Set your preferences" : "Update these answers"}
    </Link>
  </section>
);
