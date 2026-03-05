const CURRENCY_CONFIG: Record<string, { locale: string; code: string }> = {
  USD: { locale: "en-US", code: "USD" },
  INR: { locale: "en-IN", code: "INR" },
  NGN: { locale: "en-NG", code: "NGN" },
  EUR: { locale: "de-DE", code: "EUR" },
  GBP: { locale: "en-GB", code: "GBP" },
}

export function formatCurrency(amount: number, currency = "USD"): string {
  const config = CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.USD
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
  }).format(amount)
}

export function getCurrencySymbol(currency = "USD"): string {
  const config = CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.USD
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
  })
    .formatToParts(0)
    .find((p) => p.type === "currency")?.value ?? "$"
}
