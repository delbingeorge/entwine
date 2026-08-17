import { putProfile } from "@/shared/lib/profile-api";

import type { ProfileDraft } from "../types";

const seniorityByLabel: Record<string, string> = {
  Junior: "junior",
  Mid: "mid",
  Senior: "senior",
  "Staff and above": "staff",
};

const toPayload = (draft: ProfileDraft) => ({
  seniority: seniorityByLabel[draft.seniority[0] ?? ""] ?? "",
  locations: draft.locations,
  salaryMin: Number(draft.salaryMin),
  salaryCurrency: draft.salaryCurrency,
});

export const saveProfile = (draft: ProfileDraft) => putProfile(toPayload(draft));
