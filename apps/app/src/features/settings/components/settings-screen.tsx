import { useEffect, useState } from "react";

import { useNavigate, useSearch } from "@tanstack/react-router";

import { LucideIcon } from "@/shared/components/lucide-icon";
import { TabBar } from "@/shared/components/tab-bar";
import { getProfile, type Profile } from "@/shared/lib/profile-api";
import { getSession } from "@/shared/lib/session";
import { settingsTabs, type SettingsTab } from "@/shared/lib/settings-tabs";
import { supabase } from "@/shared/lib/supabase";

import { AboutPanel } from "./about-panel";
import { AccountPanel } from "./account-panel";
import { ProfilePanel } from "./profile-panel";

const readName = (metadata: Record<string, unknown>) => {
  const raw = metadata.name ?? metadata.full_name;

  return typeof raw === "string" ? raw : "";
};

export const SettingsScreen = () => {
  const navigate = useNavigate();
  const { tab } = useSearch({ from: "/settings" });
  const [account, setAccount] = useState({ email: "", name: "" });
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    void getSession().then((session) => {
      if (session !== null) {
        setAccount({
          email: session.user.email ?? "",
          name: readName(session.user.user_metadata),
        });
      }
    });
  }, []);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch((cause: unknown) => {
        console.error("could not load your preferences", cause);
      });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    await navigate({ replace: true, search: { thread: "" }, to: "/" });
  };

  return (
    <div className="flex h-screen flex-col bg-surface">
      <header className="flex h-12 shrink-0 items-center gap-2 px-8" />
      <div className="min-h-0 flex-1 overflow-y-auto px-8">
        <div className="mx-auto w-full max-w-3xl font-ui">
          <div className="sticky top-0 z-10 bg-surface pt-5">
            <button
              className="-ml-2 flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] text-composer-soft hover:bg-composer-track hover:text-composer-ink"
              onClick={() => {
                void navigate({ search: { thread: "" }, to: "/" });
              }}
              type="button"
            >
              <LucideIcon className="size-3.5 shrink-0" name="chevron-left" />
              Back
            </button>
            <h1 className="pt-3 text-[32px] leading-tight font-semibold tracking-tight text-composer-ink">
              Settings
            </h1>
            <TabBar
              current={tab}
              onChange={(next: SettingsTab) => {
                void navigate({ replace: true, search: { tab: next }, to: "/settings" });
              }}
              tabs={settingsTabs}
            />
          </div>

          <div className="pt-7 pb-16">
            {tab === "Account" ? (
              <AccountPanel
                email={account.email}
                name={account.name}
                onSignOut={() => {
                  void signOut();
                }}
                profile={profile}
              />
            ) : null}
            {tab === "Profile" ? <ProfilePanel /> : null}
            {tab === "About" ? <AboutPanel /> : null}
          </div>
        </div>
      </div>
    </div>
  );
};
