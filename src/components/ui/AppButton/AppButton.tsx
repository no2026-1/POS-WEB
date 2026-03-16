import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  children: ReactNode
  fullWidth?: boolean
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-medium',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-medium',
  danger: 'bg-red-500 hover:bg-red-600 text-white font-medium',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 font-medium',
}

export function AppButton({
  variant = 'primary',
  loading,
  children,
  fullWidth,
  disabled,
  className = '',
  ...props
}: AppButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        px-4 py-2 rounded-lg text-sm transition-all
        ${VARIANT_CLASSES[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `.trim()}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
