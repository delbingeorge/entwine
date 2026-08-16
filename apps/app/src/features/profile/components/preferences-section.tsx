import { useState } from "react";

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
  any: "Open to any",
};

const money = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  maximumFractionDigits: 0,
  notation: "compact",
  style: "currency",
});

const longEnoughToClamp = 260;

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

export const PreferencesSection = ({ profile }: PreferencesSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const wants = profile?.wantsToBuild ?? "";
  const canClamp = wants.length > longEnoughToClamp;

  return (
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

          <div className="grid gap-3 sm:grid-cols-3">
            <Fact label="LEVEL" value={seniorityLabels[profile.seniority] ?? profile.seniority} />
            <Fact
              label="WORK STYLE"
              value={remoteLabels[profile.remotePref] ?? profile.remotePref}
            />
            <Fact
              label="SALARY FLOOR"
              value={profile.salaryMin === 0 ? "" : money.format(profile.salaryMin)}
            />
          </div>

          <div>
            <Label>STACK</Label>
            <Chips values={profile.primaryStack} />
          </div>

          <div>
            <Label>LOCATIONS</Label>
            <Chips values={profile.locations} />
          </div>

          {wants === "" ? null : (
            <div>
              <Label>WHAT YOU WANT TO BUILD</Label>
              <p
                className={`text-[13px] leading-relaxed text-composer-soft ${
                  canClamp && !isExpanded ? "line-clamp-3" : ""
                }`}
              >
                {wants}
              </p>
              {canClamp ? (
                <button
                  className="pt-2 text-[12px] text-composer-soft underline underline-offset-4 hover:text-composer-ink"
                  onClick={() => {
                    setIsExpanded(!isExpanded);
                  }}
                  type="button"
                >
                  {isExpanded ? "Show less" : "Show more"}
                </button>
              ) : null}
            </div>
          )}
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
};
