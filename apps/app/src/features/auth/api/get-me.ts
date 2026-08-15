import { z } from "zod";

import { apiRequest } from "@/shared/lib/api-client";

const meSchema = z.object({
  id: z.string(),
  email: z.string(),
  createdAt: z.string(),
  isNew: z.boolean(),
});

export type Me = z.infer<typeof meSchema>;

export const getMe = () => apiRequest("/v1/me", meSchema);
