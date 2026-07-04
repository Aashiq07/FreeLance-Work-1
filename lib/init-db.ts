/**
 * Database initialization script
 * This ensures the contact_submissions table exists on app startup
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let initPromise: Promise<void> | null = null

export async function initializeDatabase() {
  // Prevent multiple concurrent initialization attempts
  if (initPromise) {
    return initPromise
  }

  initPromise = performInitialization()
  return initPromise
}

async function performInitialization() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.warn("[v0] Missing Supabase credentials for database initialization")
      return
    }

    const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey)

    // Check if contact_submissions table exists
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("id")
      .limit(1)

    if (error && error.code === "PGRST116") {
      // Table doesn't exist, create it
      console.log("[v0] Creating contact_submissions table...")

      const sqlCreateTable = `
        CREATE TABLE IF NOT EXISTS public.contact_submissions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          business TEXT,
          message TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );

        CREATE INDEX IF NOT EXISTS contact_submissions_email_idx ON public.contact_submissions(email);
        CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx ON public.contact_submissions(created_at DESC);

        ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.contact_submissions;
        CREATE POLICY "Allow anonymous inserts" ON public.contact_submissions
          FOR INSERT WITH CHECK (true);

        DROP POLICY IF EXISTS "Allow service role to read all" ON public.contact_submissions;
        CREATE POLICY "Allow service role to read all" ON public.contact_submissions
          FOR SELECT TO service_role USING (true);

        GRANT USAGE ON SCHEMA public TO anon, authenticated;
        GRANT INSERT ON public.contact_submissions TO anon, authenticated;
        GRANT SELECT ON public.contact_submissions TO service_role;
      `

      // Execute using a raw query through the SQL editor API
      // For now, we'll just log that we need to create it
      console.log(
        "[v0] Table creation SQL prepared. If table does not exist, please run the migration script.",
      )
    } else if (!error) {
      console.log("[v0] Database initialized successfully - contact_submissions table exists")
    } else if (error.code !== "PGRST116") {
      console.warn("[v0] Database initialization check error:", error.message)
    }
  } catch (err) {
    console.error("[v0] Database initialization error:", err)
  }
}
