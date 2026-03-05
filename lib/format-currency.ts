export function formatCurrency(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount)
  } catch {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }
}

export function getCurrencySymbol(currency = "USD"): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? "$"
  } catch {
    return "$"
  }
}
