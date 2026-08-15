import { useState } from "react";

import { signInWithLinkedIn } from "../api/sign-in-with-linkedin";

export const useLinkedInSignIn = () => {
  const [isPending, setIsPending] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const signIn = async () => {
    setIsPending(true);
    setHasFailed(false);

    try {
      await signInWithLinkedIn();
    } catch (cause) {
      console.error("linkedin sign-in failed", cause);
      setHasFailed(true);
      setIsPending(false);
    }
  };

  return { hasFailed, isPending, signIn };
};
