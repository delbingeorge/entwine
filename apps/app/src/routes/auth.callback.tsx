import { useEffect, useState } from "react";

import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { supabase } from "@/shared/lib/supabase";

import { getMe } from "@/features/auth/api/get-me";

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

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-2 px-6">
      <p className="text-sm text-ink-muted" role={failure === null ? undefined : "alert"}>
        {failure ?? "Signing you in…"}
      </p>
    </main>
  );
}
