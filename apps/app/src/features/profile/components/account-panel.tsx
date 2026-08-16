import { LinkedInIcon } from "@/shared/components/linkedin-icon";
import { LucideIcon } from "@/shared/components/lucide-icon";
import type { Profile } from "@/shared/lib/profile-api";

import { PreferencesSection } from "./preferences-section";

interface AccountPanelProps {
  email: string;
  name: string;
  onSignOut: () => void;
  profile: Profile | null;
}

export const AccountPanel = ({ email, name, onSignOut, profile }: AccountPanelProps) => (
  <div className="flex flex-col gap-7">
    <section>
      <h2 className="pb-4 text-[11px] tracking-widest text-composer-placeholder">PROFILE</h2>
      <div className="flex flex-col gap-3">
        <p className="text-[12.5px] leading-relaxed text-composer-soft">
          This is how you show up to companies Ellie introduces you to.
        </p>
        <div className="flex max-w-md items-end gap-2">
          <label className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-[11px] tracking-widest text-composer-placeholder">NAME</span>
            <input
              className="w-full rounded-lg border border-composer-line bg-composer-shell px-3 py-2 text-[13px] text-composer-ink outline-none focus:border-composer-soft"
              readOnly
              value={name}
            />
          </label>
        </div>
        <p className="text-[12px] text-composer-placeholder">Taken from your LinkedIn profile.</p>
      </div>
    </section>

    <PreferencesSection profile={profile} />

    <section className="border-t border-composer-line pt-7">
      <h2 className="pb-4 text-[11px] tracking-widest text-composer-placeholder">
        SIGN-IN &amp; CONNECTIONS
      </h2>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 rounded-xl border border-composer-line bg-composer-surface px-3.5 py-3">
          <span className="shrink-0 text-composer-ink">
            <LinkedInIcon />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] text-composer-ink">
              Signed in with LinkedIn
            </span>
            <span className="block truncate text-[12px] text-composer-placeholder">{email}</span>
          </span>
          <button
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-composer-line px-3 py-1.5 text-[12px] text-composer-soft hover:text-composer-ink"
            onClick={onSignOut}
            type="button"
          >
            <LucideIcon className="size-3.5" name="log-out" />
            Sign out
          </button>
        </div>
      </div>
    </section>
  </div>
);
