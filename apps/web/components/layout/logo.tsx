import Link from 'next/link'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-flex size-8 items-center justify-center overflow-hidden rounded-lg bg-brand-gradient shadow-[0_4px_12px_-4px_oklch(0.5_0.21_268/0.6)]',
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <rect x="5" y="3.5" width="14" height="17" rx="2.5" className="stroke-primary-foreground" strokeWidth="1.6" />
        <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4" className="stroke-primary-foreground" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M17.5 2.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" className="fill-primary-foreground" />
      </svg>
    </span>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('inline-flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-ring/30', className)}
      aria-label="Currículo Express IA — página inicial"
    >
      <LogoMark />
      <span className="flex items-baseline gap-1 text-base font-semibold tracking-tight text-foreground">
        Currículo Express
        <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[0.7rem] font-semibold text-primary">IA</span>
      </span>
    </Link>
  )
}
