import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

export function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function getDefaultKey(envName: string): string {
  const raw = Deno.env.get(envName);
  if (!raw) throw new Error(`Missing ${envName}`);

  const parsed = JSON.parse(raw);
  const key = parsed.default ?? Object.values(parsed)[0];

  if (!key || typeof key !== "string") {
    throw new Error(`No usable key in ${envName}`);
  }
  return key;
}

export function adminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  if (!url) throw new Error("Missing SUPABASE_URL");

  const secretKey = getDefaultKey("SUPABASE_SECRET_KEYS");

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function requireAdmin(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/, "");
  if (!token) return null;

  const url = Deno.env.get("SUPABASE_URL");
  if (!url) return null;

  const publishableKey = getDefaultKey("SUPABASE_PUBLISHABLE_KEYS");

  const client = createClient(url, publishableKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;

  const allowed = (Deno.env.get("ADMIN_EMAIL") || "").toLowerCase();
  if (!allowed || data.user.email?.toLowerCase() !== allowed) return null;

  return data.user;
}

export function parseAnswer(raw: string) {
  let s = String(raw ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace("٪", "%")
    .replace(",", ".");

  if (!s) return null;

  const pct = s.endsWith("%");
  if (pct) s = s.slice(0, -1);

  const n = Number(s);
  if (!Number.isFinite(n)) return null;

  return pct ? n / 100 : n;
}
