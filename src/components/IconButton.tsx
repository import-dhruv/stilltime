import type { ReactNode } from 'react'

interface IconButtonProps {
  label: string
  icon: ReactNode
  onClick: () => void
  active?: boolean
  primary?: boolean
  className?: string
}

export default function IconButton({
  label,
  icon,
  onClick,
  active = false,
  primary = false,
  className = '',
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={`icon-btn ${primary ? 'primary' : ''} ${className}`}
      data-active={active}
      aria-label={label}
      aria-pressed={active || undefined}
      onClick={onClick}
    >
      {icon}
    </button>
  )
}
