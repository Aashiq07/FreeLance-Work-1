import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { initializeDatabase } from "@/lib/init-db"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

// Initialize database on startup
initializeDatabase().catch((err) => {
  console.error("[v0] Failed to initialize database:", err)
})

export const metadata: Metadata = {
  title: "Rare Drop | Creative Social Media & Digital Marketing Agency",
  description:
    "Rare Drop is a creative social media and digital marketing agency helping brands grow through content creation, branding, paid ads, influencer marketing, and strategic digital experiences.",
  keywords: [
    "social media agency",
    "digital marketing",
    "content creation",
    "branding",
    "influencer marketing",
    "paid ads",
    "Chennai",
  ],
  authors: [{ name: "Rare Drop" }],
  creator: "Rare Drop",
  icons: {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/raredrop-A5T4qhmQeGMY9N1qRjVmvw0CYUR6GL.jpg",
    apple: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/raredrop-A5T4qhmQeGMY9N1qRjVmvw0CYUR6GL.jpg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Rare Drop",
    title: "Rare Drop | Creative Social Media & Digital Marketing Agency",
    description:
      "We build digital brands that create impact. Content creation, branding, paid ads & more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rare Drop | Creative Social Media & Digital Marketing Agency",
    description:
      "We build digital brands that create impact. Content creation, branding, paid ads & more.",
  },
}

export const viewport: Viewport = {
  themeColor: "#ff5a00",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
