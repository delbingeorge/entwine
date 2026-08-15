import { z } from "zod";

import { env } from "./env";
import { supabase } from "./supabase";

export class AppError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

const errorBodySchema = z.object({ code: z.string(), message: z.string() });

const toAppError = async (response: Response) => {
  const body: unknown = await response.json().catch(() => null);
  const parsed = errorBodySchema.safeParse(body);

  if (!parsed.success) {
    return new AppError("unknown", "Something went wrong.", response.status);
  }

  return new AppError(parsed.data.code, parsed.data.message, response.status);
};

export const apiRequest = async <T>(
  path: string,
  schema: z.ZodType<T>,
  init: RequestInit = {},
): Promise<T> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const response = await fetch(`${env.VITE_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token === undefined ? {} : { Authorization: `Bearer ${token}` }),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw await toAppError(response);
  }

  if (response.status === 204) {
    return schema.parse(undefined);
  }

  return schema.parse(await response.json());
};
