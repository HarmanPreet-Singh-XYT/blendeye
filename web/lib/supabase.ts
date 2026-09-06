import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase configuration with dual support for:
 * - Modern keys: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY & SUPABASE_SECRET_KEY
 * - Legacy keys: NEXT_PUBLIC_SUPABASE_ANON_KEY & SUPABASE_SERVICE_ROLE_KEY
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

/**
 * Check if the minimum required Supabase credentials are configured.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client for public/client-side access (RLS applied).
 * Uses NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: typeof window !== "undefined",
        autoRefreshToken: typeof window !== "undefined",
      },
    });
  }
  return cachedClient;
}

/**
 * Returns a Supabase admin client that bypasses Row Level Security.
 * Uses SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY).
 *
 * CAUTION: Server-only! Never call this from client-side code.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (typeof window !== "undefined") {
    throw new Error("getSupabaseAdminClient cannot be called from browser context");
  }

  if (!supabaseUrl || !supabaseSecretKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Returns a Supabase client configured with a specific user's Bearer token.
 * This ensures queries executed with this client are properly scoped to the user under RLS.
 */
export function getSupabaseClientForToken(token?: string | null): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!token) {
    return getSupabaseClient();
  }
  return createClient(supabaseUrl, supabasePublishableKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Validates a Bearer token on the server and returns the authenticated Supabase user profile.
 */
export async function getAuthUserFromHeader(
  authHeader?: string | null
): Promise<{ id: string; email?: string; fullName?: string } | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  if (!token) return null;

  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }
    return {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.user_metadata?.full_name,
    };
  } catch {
    return null;
  }
}
