/**
 * Auto-generate document numbers
 * Pattern: PREFIX + YYYYMMDD + HHmmss
 * Example: PO20260316143022
 */
export function genDocNo(prefix: string): string {
  const now = new Date()
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  const y = now.getFullYear()
  const mo = pad(now.getMonth() + 1)
  const d = pad(now.getDate())
  const h = pad(now.getHours())
  const mi = pad(now.getMinutes())
  const s = pad(now.getSeconds())
  return `${prefix}${y}${mo}${d}${h}${mi}${s}`
}

export const today = () => new Date().toISOString().slice(0, 10)
