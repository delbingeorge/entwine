import type { Profile } from "@/shared/lib/profile-api";

import { emptyDraft, type ProfileDraft } from "../types";

const labelBySeniority: Record<string, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  staff: "Staff and above",
};

export const draftFromProfile = (profile: Profile | null): ProfileDraft => {
  if (profile === null) {
    return emptyDraft;
  }

  const label = labelBySeniority[profile.seniority];

  return {
    seniority: label === undefined ? [] : [label],
    stack: profile.primaryStack,
    locations: profile.locations,
    salaryMin: profile.salaryMin === 0 ? "" : String(profile.salaryMin),
    wantsToBuild: profile.wantsToBuild,
  };
};
