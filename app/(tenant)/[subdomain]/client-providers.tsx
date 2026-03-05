"use client"

import type React from "react"
import { useEffect } from "react"
import { TenantProvider, useTenant } from "@/lib/tenant-context"
import { SessionProvider } from "@/components/auth/session-provider"

function hexToOklchParts(hex: string): { L: number; C: number; H: number } | null {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return null

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

  return { L: okL, C, H }
}

function oklch(L: number, C: number, H: number) {
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(0)})`
}

function TenantThemeInjector() {
  const { tenant } = useTenant()

  useEffect(() => {
    if (!tenant?.primaryColor) return

    const primary = hexToOklchParts(tenant.primaryColor)
    if (!primary) return

    const bg = hexToOklchParts(tenant.backgroundColor ?? "#0a0a0a")
    const root = document.documentElement.style

    const bgL = bg?.L ?? 0.13
    const bgC = bg?.C ?? 0.01
    const bgH = bg?.H ?? 0

    const theme: Record<string, string> = {
      "--primary":                  oklch(primary.L, primary.C, primary.H),
      "--accent":                   oklch(primary.L, primary.C, primary.H),
      "--ring":                     oklch(primary.L, primary.C, primary.H),
      "--sidebar-primary":          oklch(primary.L, primary.C, primary.H),
      "--sidebar-ring":             oklch(primary.L, primary.C, primary.H),
      "--chart-1":                  oklch(primary.L, primary.C, primary.H),
      "--success":                  oklch(primary.L, primary.C, primary.H),

      "--background":               oklch(bgL, bgC, bgH),
      "--card":                     oklch(Math.min(bgL + 0.04, 0.25), bgC, bgH),
      "--popover":                  oklch(Math.min(bgL + 0.04, 0.25), bgC, bgH),
      "--secondary":                oklch(Math.min(bgL + 0.09, 0.30), bgC, bgH),
      "--muted":                    oklch(Math.min(bgL + 0.09, 0.30), bgC, bgH),
      "--border":                   oklch(Math.min(bgL + 0.15, 0.35), bgC, bgH),
      "--input":                    oklch(Math.min(bgL + 0.09, 0.30), bgC, bgH),
      "--sidebar":                  oklch(Math.min(bgL + 0.02, 0.20), bgC, bgH),
      "--sidebar-accent":           oklch(Math.min(bgL + 0.09, 0.30), bgC, bgH),
      "--sidebar-border":           oklch(Math.min(bgL + 0.15, 0.35), bgC, bgH),
    }

    Object.entries(theme).forEach(([k, v]) => root.setProperty(k, v))

    return () => {
      Object.keys(theme).forEach((k) => root.removeProperty(k))
    }
  }, [tenant?.primaryColor, tenant?.backgroundColor])

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
