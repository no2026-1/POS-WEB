export type Currency = 'LAK' | 'THB' | 'USD'

const CURRENCY_LOCALES: Record<Currency, string> = {
  LAK: 'lo-LA',
  THB: 'th-TH',
  USD: 'en-US',
}

/**
 * Format a numeric amount as a currency string.
 * e.g. formatCurrency(1500.5, 'LAK') → '₭1,500.50'
 */
export function formatCurrency(amount: number, currency: Currency = 'LAK'): string {
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format amount with 2 decimal places, no currency symbol.
 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
