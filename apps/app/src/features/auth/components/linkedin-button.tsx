import { LinkedInIcon } from "./linkedin-icon";

export const LinkedInButton = () => (
  <button
    className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-ink px-5 py-3.5 text-sm text-surface transition-opacity hover:opacity-90"
    type="button"
  >
    <LinkedInIcon />
    Continue with LinkedIn
  </button>
);
