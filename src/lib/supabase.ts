import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export type SupabaseConnectionStatus = "missing" | "checking" | "connected" | "failed";

/** Env tanımlıysa Supabase API'ye gerçek istek atarak bağlantıyı doğrular. */
export async function checkSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  if (!hasSupabaseConfig || !supabase) return "missing";

  const timeoutMs = 8000;
  const timeout = new Promise<SupabaseConnectionStatus>((resolve) => {
    setTimeout(() => resolve("failed"), timeoutMs);
  });

  const probe = (async (): Promise<SupabaseConnectionStatus> => {
    try {
      const { error } = await supabase.auth.getSession();
      if (!error) return "connected";

      const msg = (error.message ?? "").toLowerCase();
      if (
        msg.includes("fetch") ||
        msg.includes("network") ||
        msg.includes("failed to fetch") ||
        msg.includes("timeout") ||
        msg.includes("econnrefused")
      ) {
        return "failed";
      }
      // Oturum/refresh hataları API'nin erişilebilir olduğunu gösterir
      return "connected";
    } catch {
      return "failed";
    }
  })();

  return Promise.race([probe, timeout]);
}
