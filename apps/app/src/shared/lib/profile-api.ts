import { z } from "zod";

import { AppError, apiRequest } from "./api-client";

export const profileSchema = z.object({
  seniority: z.string(),
  locations: z.array(z.string()),
  salaryMin: z.number(),
  salaryCurrency: z.string(),
  status: z.string(),
});

export type Profile = z.infer<typeof profileSchema>;

export type ProfilePayload = Omit<Profile, "status">;

export const getProfile = async (): Promise<Profile | null> => {
  try {
    return await apiRequest("/v1/profile", profileSchema);
  } catch (cause) {
    if (cause instanceof AppError && cause.status === 404) {
      return null;
    }

    throw cause;
  }
};

export const putProfile = (payload: ProfilePayload) =>
  apiRequest("/v1/profile", profileSchema, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
