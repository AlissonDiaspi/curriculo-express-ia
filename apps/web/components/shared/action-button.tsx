import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const actionButtonVariants = cva(
  'group/action relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-gradient text-primary-foreground shadow-[0_8px_24px_-8px_oklch(0.5_0.21_268/0.6)] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-10px_oklch(0.5_0.21_268/0.7)] active:translate-y-0',
        secondary:
          'border border-border bg-card text-foreground shadow-sm hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent active:translate-y-0',
        ghost: 'text-foreground hover:bg-accent',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-13 px-7 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type Variants = VariantProps<typeof actionButtonVariants>

type LinkProps = Variants & { href: string; className?: string; children: React.ReactNode } & Omit<
    React.ComponentProps<typeof Link>,
    'href' | 'className'
  >
type ButtonProps = Variants & { href?: undefined } & React.ComponentProps<'button'>

export function ActionButton(props: LinkProps | ButtonProps) {
  const { variant, size, className } = props
  const classes = cn(actionButtonVariants({ variant, size }), className)

  if (props.href !== undefined) {
    const { variant: _v, size: _s, className: _c, href, ...rest } = props
    return <Link href={href} className={classes} {...rest} />
  }
  const { variant: _v, size: _s, className: _c, type = 'button', ...rest } = props
  return <button type={type} className={classes} {...rest} />
}

export function PrimaryButton(props: (LinkProps | ButtonProps) & { variant?: never }) {
  return <ActionButton {...props} variant="primary" />
}

export function SecondaryButton(props: (LinkProps | ButtonProps) & { variant?: never }) {
  return <ActionButton {...props} variant="secondary" />
}
