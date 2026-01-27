import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"

// STRICT ISOLATION: NO IMPORTS FROM @/components OR @/lib
// This root layout ONLY serves the landing page and must be build-safe
// Tenant-specific layouts with context are in app/(tenant)/[subdomain]/layout.tsx

export const metadata: Metadata = {
  title: "HostelFlow - Multi-Tenant Hostel Management",
  description: "Multi-tenant SaaS platform for hostel management - rooms, students, finance, and maintenance",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
}

// BARE-BONES ROOT LAYOUT - Build-Safe
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
