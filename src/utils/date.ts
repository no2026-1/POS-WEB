/**
 * Get today's date as YYYY-MM-DD string.
 */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Get current time as HH:MM:SS string.
 */
export function nowTimeString(): string {
  return new Date().toTimeString().slice(0, 8)
}

/**
 * Format a date string or Date object as a locale date string.
 */
export function formatDate(date: string | Date, locale = 'en-US'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a date string or Date object as YYYY-MM-DD.
 */
export function toDateString(date: string | Date): string {
  return new Date(date).toISOString().slice(0, 10)
}
