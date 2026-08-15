import { z } from "zod";

import { AppError, apiRequest } from "./api-client";

export const profileDetailSchema = z.object({
  experiences: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      employmentType: z.string().optional(),
      location: z.string().optional(),
      startDate: z.string(),
      endDate: z.string().optional(),
      isCurrent: z.boolean(),
      summary: z.string().optional(),
      highlights: z.array(z.string()),
      tech: z.array(z.string()),
    }),
  ),
  educations: z.array(
    z.object({
      institution: z.string(),
      area: z.string().optional(),
      studyType: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      score: z.string().optional(),
    }),
  ),
  skills: z.array(
    z.object({
      name: z.string(),
      years: z.number().optional(),
    }),
  ),
});

export type ProfileDetail = z.infer<typeof profileDetailSchema>;

export const emptyDetail: ProfileDetail = { experiences: [], educations: [], skills: [] };

export const getProfileDetail = async (): Promise<ProfileDetail> => {
  try {
    return await apiRequest("/v1/profile/detail", profileDetailSchema);
  } catch (cause) {
    if (cause instanceof AppError && cause.status === 404) {
      return emptyDetail;
    }

    throw cause;
  }
};
