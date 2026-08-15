import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .startsWith("sb_publishable_", "Use the publishable key, never a secret or legacy anon key"),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
}

export const env = parsed.data;
