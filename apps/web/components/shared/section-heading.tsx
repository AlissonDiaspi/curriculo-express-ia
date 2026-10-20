import { cn } from '@/lib/utils'
import { AnimatedSection } from '@/components/shared/animated-section'

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
  id,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: 'center' | 'left'
  className?: string
  id?: string
}) {
  return (
    <AnimatedSection
      className={cn(
        'flex max-w-2xl flex-col gap-4',
        align === 'center' ? 'mx-auto items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-secondary px-3 py-1 font-mono text-xs font-medium tracking-wide text-secondary-foreground uppercase">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
          {eyebrow}
        </span>
      )}
      <h2 id={id} className="text-3xl font-semibold tracking-tight text-balance text-foreground md:text-5xl">
        {title}
      </h2>
      {description && <p className="text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">{description}</p>}
    </AnimatedSection>
  )
}
