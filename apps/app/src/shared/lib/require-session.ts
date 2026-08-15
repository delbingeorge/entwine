import { redirect } from "@tanstack/react-router";

import { supabase } from "./supabase";

export const requireSession = async () => {
  const { data } = await supabase.auth.getSession();

  if (data.session === null) {
    throw redirect({ replace: true, to: "/" });
  }

  return { session: data.session };
};
