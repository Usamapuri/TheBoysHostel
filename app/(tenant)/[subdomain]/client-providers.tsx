"use client"

import type React from "react"
import { useEffect } from "react"
import { TenantProvider, useTenant } from "@/lib/tenant-context"
import { SessionProvider } from "@/components/auth/session-provider"

function hexToOklch(hex: string): string | null {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b)

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb

  const cbrtL = Math.cbrt(l), cbrtM = Math.cbrt(m), cbrtS = Math.cbrt(s)

  const okL = 0.2104542553 * cbrtL + 0.7936177850 * cbrtM - 0.0040720468 * cbrtS
  const okA = 1.9779984951 * cbrtL - 2.4285922050 * cbrtM + 0.4505937099 * cbrtS
  const okB = 0.0259040371 * cbrtL + 0.7827717662 * cbrtM - 0.8086757660 * cbrtS

  const C = Math.sqrt(okA * okA + okB * okB)
  let H = (Math.atan2(okB, okA) * 180) / Math.PI
  if (H < 0) H += 360

  return `oklch(${okL.toFixed(2)} ${C.toFixed(2)} ${H.toFixed(0)})`
}

function TenantThemeInjector() {
  const { tenant } = useTenant()

  useEffect(() => {
    if (!tenant?.primaryColor) return

    const oklch = hexToOklch(tenant.primaryColor)
    if (!oklch) return

    const root = document.documentElement.style
    const vars = [
      "--primary", "--accent", "--ring",
      "--sidebar-primary", "--sidebar-ring",
      "--chart-1", "--success",
    ]
    vars.forEach((v) => root.setProperty(v, oklch))

    return () => {
      vars.forEach((v) => root.removeProperty(v))
    }
  }, [tenant?.primaryColor])

  return null
}

export function ClientProviders({
  children,
  subdomain,
}: {
  children: React.ReactNode
  subdomain: string
}) {
  return (
    <SessionProvider>
      <TenantProvider subdomain={subdomain}>
        <TenantThemeInjector />
        {children}
      </TenantProvider>
    </SessionProvider>
  )
}
