"use server"

import { createClient as createServerClient } from "@supabase/ssr"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const OWNER_EMAIL = "raredrop007@gmail.com"

export type ContactState = {
  success: boolean
  error: string | null
}

export async function submitContact(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = (formData.get("name") as string)?.trim()
  const email = (formData.get("email") as string)?.trim()
  const phone = (formData.get("phone") as string)?.trim() || null
  const business = (formData.get("business") as string)?.trim() || null
  const message = (formData.get("message") as string)?.trim()

  if (!name || !email || !message) {
    return { success: false, error: "Please fill in all required fields." }
  }

  try {
    // Create Supabase client with service role key for full permissions
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
        },
      },
    )

    // Store in Supabase
    const { error: dbError } = await supabase.from("contact_submissions").insert({
      name,
      email,
      phone,
      business,
      message,
    })

    if (dbError) {
      console.log("[v0] Supabase insert error:", dbError.message, dbError)
      console.log("[v0] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log("[v0] Service role key present:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)
      return {
        success: false,
        error: `Database error: ${dbError.message}`,
      }
    }

    // Send email notification to owner
    const emailContent = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Business Type: ${business || "Not provided"}

Message:
${message}

---
This message was sent from your website contact form.
    `

    const { error: emailError } = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: OWNER_EMAIL,
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <p><strong>Business Type:</strong> ${business || "Not provided"}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; color: #555;">${message}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">This message was sent from your website contact form.</p>
        </div>
      `,
    })

    if (emailError) {
      console.log("[v0] Email sending error:", emailError.message)
      // Don't fail if email fails - data is saved in DB
      return { success: true, error: null }
    }

    return { success: true, error: null }
  } catch (err) {
    console.log("[v0] Contact submission error:", err)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
