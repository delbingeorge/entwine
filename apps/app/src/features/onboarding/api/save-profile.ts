import { putProfile } from "@/shared/lib/profile-api";

import type { ProfileDraft } from "../types";

const seniorityByLabel: Record<string, string> = {
  Junior: "junior",
  Mid: "mid",
  Senior: "senior",
  "Staff and above": "staff",
};

const remoteOnly = "Anywhere remote";

const toPayload = (draft: ProfileDraft) => ({
  seniority: seniorityByLabel[draft.seniority[0] ?? ""] ?? "",
  primaryStack: draft.stack,
  locations: draft.locations,
  remotePref: draft.locations.length === 1 && draft.locations[0] === remoteOnly ? "remote" : "any",
  salaryMin: Number(draft.salaryMin),
  salaryCurrency: "INR",
  wantsToBuild: draft.wantsToBuild,
});

export const saveProfile = (draft: ProfileDraft) => putProfile(toPayload(draft));
