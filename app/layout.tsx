import type { Metadata, Viewport } from "next"
import "./globals.css"

// ============================================================================
// ABSOLUTE ROOT LAYOUT DETOX (Zero-Tolerance Build-Safe Zone)
// ============================================================================
// ZERO imports from @/components
// ZERO imports from @/lib
// ZERO context providers
// ZERO client components
// ZERO UI components
// 
// This is a PURE server component with minimal HTML structure
// Tenant-specific layouts with providers: app/(tenant)/[subdomain]/layout.tsx
// ============================================================================

export const metadata: Metadata = {
  title: "HostelFlow - Multi-Tenant Hostel Management",
  description: "Multi-tenant SaaS platform for hostel management",
  icons: {
    icon: "/icon.svg",
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
}

// ABSOLUTE BARE-BONES ROOT LAYOUT - NO REACT TYPES, MINIMAL STRUCTURE
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
