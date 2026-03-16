import { formatAmount } from '@/utils/currency'

interface CurrencyDisplayProps {
  amount: number | string | null | undefined
  className?: string
}

export function CurrencyDisplay({ amount, className = '' }: CurrencyDisplayProps) {
  const value = Number(amount ?? 0)
  return (
    <span className={className}>
      {formatAmount(value)}
    </span>
  )
}
