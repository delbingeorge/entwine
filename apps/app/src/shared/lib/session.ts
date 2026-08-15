import { supabase } from "./supabase";

export const getSession = async () => {
  const { data } = await supabase.auth.getSession();

  return data.session;
};
