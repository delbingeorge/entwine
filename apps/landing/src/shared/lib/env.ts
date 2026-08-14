import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
});

// Next.js inlines NEXT_PUBLIC_* at build time, so the keys must be read literally.
const parsed = envSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!parsed.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
}

export const env = parsed.data;
