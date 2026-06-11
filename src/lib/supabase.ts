import { createClient } from "@supabase/supabase-js";

export type SupabaseEnv = {
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
};

export const getSupabse = (env?: SupabaseEnv) => {
  const supabaseUrl = env?.SUPABASE_URL || process.env.SUPABASE_URL!;
  const supabaseKey =
    env?.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(supabaseUrl, supabaseKey);
};
