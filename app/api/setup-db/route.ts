import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return Response.json(
        { error: "Missing Supabase credentials" },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey)

    // Try to create the table using the Supabase Admin API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql: `
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
        `,
      }),
    })

    if (!response.ok) {
      // RPC might not exist, try alternative approach
      console.log("[v0] RPC endpoint not available, checking if table exists...")

      // Check if table exists
      const { error } = await supabase
        .from("contact_submissions")
        .select("id")
        .limit(1)

      if (error && error.code === "PGRST116") {
        return Response.json(
          { error: "Table does not exist and could not be created. Please create manually via Supabase SQL editor." },
          { status: 500 }
        )
      } else if (error) {
        return Response.json(
          { error: `Database error: ${error.message}` },
          { status: 500 }
        )
      } else {
        return Response.json({ success: true, message: "Table already exists" })
      }
    }

    return Response.json({ success: true, message: "Database setup completed" })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error("[v0] Setup DB error:", errorMessage)
    return Response.json(
      { error: `Setup failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
