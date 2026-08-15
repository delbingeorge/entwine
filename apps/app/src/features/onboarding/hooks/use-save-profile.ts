import { useState } from "react";

import { saveProfile } from "../api/save-profile";

import type { ProfileDraft } from "../types";

type SaveState = "idle" | "saving" | "failed";

export const useSaveProfile = () => {
  const [state, setState] = useState<SaveState>("idle");

  const save = async (draft: ProfileDraft) => {
    setState("saving");

    try {
      await saveProfile(draft);

      return true;
    } catch (cause) {
      console.error("save profile failed", cause);
      setState("failed");

      return false;
    }
  };

  return { hasFailed: state === "failed", isSaving: state === "saving", save };
};
