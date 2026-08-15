import { LinkedInIcon } from "@/shared/components/linkedin-icon";

import { useLinkedInSignIn } from "../hooks/use-linkedin-sign-in";

export const LinkedInButton = () => {
  const { hasFailed, isPending, signIn } = useLinkedInSignIn();

  return (
    <div>
      <button
        className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-ink px-5 py-3.5 text-sm text-surface transition-opacity hover:opacity-90 disabled:opacity-60"
        disabled={isPending}
        onClick={() => void signIn()}
        type="button"
      >
        <LinkedInIcon />
        {isPending ? "Taking you to LinkedIn…" : "Continue with LinkedIn"}
      </button>
      {hasFailed ? (
        <p className="mt-3 text-sm text-ink-muted" role="alert">
          We couldn&apos;t reach LinkedIn. Try again.
        </p>
      ) : null}
    </div>
  );
};
