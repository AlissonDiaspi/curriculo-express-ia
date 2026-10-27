
import Link from 'next/link'
import { Check } from 'lucide-react'

import { Logo } from '@/components/layout/logo'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

/**
 * Etapas do processo de criação do currículo.
  */
const FLOW = [
  {
    key: 'editor',
    label: 'Informações',
    href: ROUTES.editor,
  },
  {
    key: 'templates',
    label: 'Modelo',
    href: ROUTES.templates,
  },
  {
    key: 'review',
    label: 'Revisão e Download',
    href: ROUTES.review,
  },
] as const

export type FlowStage = (typeof FLOW)[number]['key']

interface FlowHeaderProps {
  stage: FlowStage
  children?: React.ReactNode
}

export function FlowHeader({
  stage,
  children,
}: FlowHeaderProps) {
  const currentIndex = FLOW.findIndex(
    (item) => item.key === stage,
  )

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        {/* Logo */}
        <Logo />

        {/* Navegação das etapas */}
        <nav
          aria-label="Etapas da criação"
          className="hidden lg:block"
        >
          <ol className="flex items-center gap-1">
            {FLOW.map((item, i) => {
              const done = i < currentIndex
              const active = i === currentIndex

              return (
                <li
                  key={item.key}
                  className="flex items-center gap-1"
                >
                  {i > 0 && (
                    <span
                      className={cn(
                        'h-px w-6',
                        done || active
                          ? 'bg-primary/40'
                          : 'bg-border',
                      )}
                      aria-hidden="true"
                    />
                  )}

                  <Link
                    href={item.href}
                    aria-current={
                      active ? 'step' : undefined
                    }
                    className={cn(
                      'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors',
                      active &&
                        'bg-secondary font-medium text-secondary-foreground',
                      done &&
                        'text-foreground hover:bg-accent',
                      !done &&
                        !active &&
                        'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {/* Número da etapa */}
                    <span
                      className={cn(
                        'flex size-5 items-center justify-center rounded-full font-mono text-[0.65rem]',
                        done &&
                          'bg-success text-success-foreground',
                        active &&
                          'bg-primary text-primary-foreground',
                        !done &&
                          !active &&
                          'border border-border',
                      )}
                    >
                      {done ? (
                        <Check
                          className="size-3"
                          aria-hidden="true"
                        />
                      ) : (
                        i + 1
                      )}
                    </span>

                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ol>
        </nav>

        {/* Ações adicionais do cabeçalho */}
        <div className="flex items-center gap-2">
          {children}
        </div>
      </div>
    </header>
  )
}
