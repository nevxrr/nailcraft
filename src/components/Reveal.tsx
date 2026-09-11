import type { CSSProperties, ReactNode } from 'react'
import { useReveal } from '../hooks/useMotion'

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const { ref, shown } = useReveal<HTMLDivElement>()
  const style = { '--reveal-delay': `${delay}ms` } as CSSProperties

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'is-in' : ''} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  )
}
