import { z } from "zod";

const supabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

/**
 * Reads the Supabase settings from the environment and fails loudly if they're missing.
 *
 * Both values are public (they're bundled into the browser JavaScript), which is fine:
 * the publishable key only grants what row-level security allows. Each variable is
 * referenced in full (`process.env.NEXT_PUBLIC_…`) because that's what lets Next.js
 * inline it into the client bundle at build time.
 */
export function getSupabaseEnv() {
  const result = supabaseEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  if (!result.success) {
    throw new Error(
      "Missing or invalid Supabase environment variables. Copy .env.example to .env.local and fill it in.",
    );
  }
  return {
    url: result.data.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: result.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}
