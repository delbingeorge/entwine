import { z } from "zod";

import { AppError, apiRequest } from "./api-client";
import { env } from "./env";
import { getSession } from "./session";

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

export const importResume = async (file: File): Promise<ProfileDetail> => {
  const session = await getSession();

  if (session === null) {
    throw new AppError("unauthorized", "You are signed out.", 401);
  }

  const body = new FormData();
  body.append("resume", file);

  const response = await fetch(`${env.VITE_API_URL}/v1/profile/resume`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}` },
    body,
  });

  if (!response.ok) {
    throw new AppError("resume_failed", "Could not read that resume.", response.status);
  }

  return profileDetailSchema.parse(await response.json());
};
