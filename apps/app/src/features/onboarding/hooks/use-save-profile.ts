import { useState } from "react";

import { saveProfile } from "../api/save-profile";

import type { ProfileDraft } from "../types";

type SaveState = "idle" | "saving" | "saved" | "failed";

export const useSaveProfile = () => {
  const [state, setState] = useState<SaveState>("idle");

  const save = async (draft: ProfileDraft) => {
    setState("saving");

    try {
      await saveProfile(draft);
      setState("saved");
    } catch (cause) {
      console.error("save profile failed", cause);
      setState("failed");
    }
  };

  return { save, state };
};
