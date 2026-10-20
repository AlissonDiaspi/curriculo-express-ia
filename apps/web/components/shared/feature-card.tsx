'use client'

import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { staggerItem } from '@/components/shared/animated-section'
import { cn } from '@/lib/utils'

export function FeatureCard({
  icon: Icon,
  title,
  description,
  highlight,
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  highlight?: boolean
  className?: string
}) {
  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_oklch(0.22_0.045_265/0.04)] transition-shadow duration-300 hover:shadow-[0_20px_40px_-20px_oklch(0.5_0.21_268/0.25)]',
        highlight && 'border-primary/20',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brand-gradient opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
      <span
        className={cn(
          'flex size-11 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-105',
          highlight
            ? 'border-transparent bg-brand-gradient text-primary-foreground'
            : 'border-border bg-secondary text-primary group-hover:border-primary/20',
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.article>
  )
}
