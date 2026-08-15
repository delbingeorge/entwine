import { supabase } from "@/shared/lib/supabase";

export const signInWithLinkedIn = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "linkedin_oidc",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });

  if (error) {
    throw new Error(error.message);
  }
};
