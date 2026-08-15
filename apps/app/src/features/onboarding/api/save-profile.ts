import { z } from "zod";

import { apiRequest } from "@/shared/lib/api-client";

import type { ProfileDraft } from "../types";

const profileSchema = z.object({
  seniority: z.string(),
  primaryStack: z.array(z.string()),
  locations: z.array(z.string()),
  remotePref: z.string(),
  salaryMin: z.number(),
  salaryCurrency: z.string(),
  wantsToBuild: z.string(),
  status: z.string(),
});

export type Profile = z.infer<typeof profileSchema>;

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

export const saveProfile = (draft: ProfileDraft) =>
  apiRequest("/v1/profile", profileSchema, {
    method: "PUT",
    body: JSON.stringify(toPayload(draft)),
  });
