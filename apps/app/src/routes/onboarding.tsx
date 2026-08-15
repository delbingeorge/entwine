import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-2 px-6">
      <h1 className="text-2xl text-ink">Let's build your profile</h1>
      <p className="text-sm text-ink-muted">
        A few questions about what you work on and what you want next.
      </p>
    </main>
  );
}
