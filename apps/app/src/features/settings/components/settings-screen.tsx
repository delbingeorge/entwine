import { useEffect, useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import { LucideIcon } from "@/shared/components/lucide-icon";
import { getSession } from "@/shared/lib/session";
import { supabase } from "@/shared/lib/supabase";

import { AccountPanel } from "./account-panel";
import { SettingsTabs } from "./settings-tabs";

import type { SettingsTab } from "../tabs";

const readName = (metadata: Record<string, unknown>) => {
  const raw = metadata.name ?? metadata.full_name;

  return typeof raw === "string" ? raw : "";
};

export const SettingsScreen = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<SettingsTab>("Account");
  const [account, setAccount] = useState({ email: "", name: "" });

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

  const signOut = async () => {
    await supabase.auth.signOut();
    await navigate({ replace: true, to: "/" });
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
                void navigate({ to: "/" });
              }}
              type="button"
            >
              <LucideIcon className="size-3.5 shrink-0" name="chevron-left" />
              Back
            </button>
            <h1 className="pt-3 text-[32px] leading-tight font-semibold tracking-tight text-composer-ink">
              Settings
            </h1>
            <SettingsTabs current={tab} onChange={setTab} />
          </div>

          <div className="pt-7 pb-16">
            {tab === "Account" ? (
              <AccountPanel
                email={account.email}
                name={account.name}
                onSignOut={() => {
                  void signOut();
                }}
              />
            ) : (
              <p className="text-[12.5px] leading-relaxed text-composer-soft">Not built yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
