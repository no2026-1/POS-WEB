type Status =
  | 'DRAFT'
  | 'APPROVED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'OPEN'
  | 'CLOSED'
  | 'RECEIVED'
  | 'ACTIVE'
  | 'INACTIVE'
  | string

const STATUS_CLASSES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  APPROVED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  RECEIVED: 'bg-teal-100 text-teal-700',
  CANCELLED: 'bg-red-100 text-red-600',
  OPEN: 'bg-green-100 text-green-700',
  CLOSED: 'bg-slate-100 text-slate-600',
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-red-100 text-red-500',
}

interface StatusBadgeProps {
  status: Status
  label?: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const classes = STATUS_CLASSES[status] ?? 'bg-gray-100 text-gray-500'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {label ?? status}
    </span>
  )
}
