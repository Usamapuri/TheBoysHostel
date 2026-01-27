import type React from "react"
import { TenantProvider } from "@/lib/tenant-context"
import { SessionProvider } from "@/components/auth/session-provider"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "../../globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params
  
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <SessionProvider>
          <TenantProvider subdomain={subdomain}>
            {children}
          </TenantProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
