import { useEffect, useState } from "react";

import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { supabase } from "@/shared/lib/supabase";

import { getMe } from "@/features/auth/api/get-me";
import { SigningIn } from "@/features/auth/components/signing-in";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        return;
      }

      getMe()
        .then(() => {
          void navigate({ replace: true, to: "/" });
        })
        .catch((cause: unknown) => {
          console.error("me request failed", cause);
          setFailure("Signed in, but the API did not accept the session.");
        });
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [navigate]);

  return <SigningIn failure={failure} />;
}
