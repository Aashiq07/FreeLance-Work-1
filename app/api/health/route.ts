import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export async function GET() {
  const checks = {
    supabase: false,
    resend: false,
    database: false,
    timestamp: new Date().toISOString(),
  }

  try {
    // Check Supabase connection
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && serviceRoleKey) {
      const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey)

      // Test Supabase connection
      const { data, error } = await supabase.from("contact_submissions").select("id").limit(1)

      checks.supabase = true

      if (!error || error.code === "PGRST116") {
        checks.database = true
      }
    }

    // Check Resend API key
    if (process.env.RESEND_API_KEY) {
      checks.resend = true
    }
  } catch (error) {
    console.error("[v0] Health check error:", error)
  }

  const allHealthy = checks.supabase && checks.resend && checks.database
  const status = allHealthy ? 200 : 503

  return Response.json(checks, { status })
}
