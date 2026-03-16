/**
 * Pad a number with leading zeros.
 */
export function padStart(value: number, length: number, fill = '0'): string {
  return String(value).padStart(length, fill)
}

/**
 * Generate a sequential document number with prefix and datetime stamp.
 * e.g. genDocNo('POS') → 'POS20260314143022'
 */
export function genDocNo(prefix: string): string {
  const now = new Date()
  return `${prefix}${now.getFullYear()}${padStart(now.getMonth() + 1, 2)}${padStart(now.getDate(), 2)}${padStart(now.getHours(), 2)}${padStart(now.getMinutes(), 2)}${padStart(now.getSeconds(), 2)}`
}

/**
 * Truncate a string to maxLength, appending ellipsis if needed.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength)}…`
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
