'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Info, Sparkles } from 'lucide-react'
import { SectionHeading } from '@/components/shared/section-heading'
import { AnimatedSection } from '@/components/shared/animated-section'
import { cn } from '@/lib/utils'

const VERSIONS = {
  antes: 'Trabalhava atendendo clientes e organizando produtos.',
  depois: 'Atendimento ao cliente e organização de produtos no ambiente de trabalho.',
} as const

type Version = keyof typeof VERSIONS

export function DemoSection() {
  const [version, setVersion] = useState<Version>('antes')

  return (
    <section className="py-20 md:py-28" aria-labelledby="demo-title">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
        <SectionHeading
          id="demo-title"
          align="left"
          eyebrow="Demonstração"
          title="Suas informações, apresentadas de um jeito melhor."
          description="A IA ajuda a deixar o texto mais claro e objetivo — mantendo exatamente o que você fez. Nada de experiências, cursos ou resultados inventados."
        />

        <AnimatedSection delay={0.1}>
          <div className="rounded-3xl border border-border bg-card p-2 shadow-[0_30px_60px_-30px_oklch(0.3_0.12_268/0.3)]">
            <div className="flex items-center justify-between gap-3 px-3 pt-2 pb-3">
              <span className="font-mono text-xs text-muted-foreground">Experiência · Descrição</span>
              <div role="radiogroup" aria-label="Alternar versão do texto" className="relative flex rounded-full bg-surface p-1">
                {(Object.keys(VERSIONS) as Version[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={version === key}
                    onClick={() => setVersion(key)}
                    className={cn(
                      'relative z-10 h-8 rounded-full px-4 text-sm font-medium capitalize transition-colors focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none',
                      version === key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {version === key && (
                      <motion.span
                        layoutId="demo-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-card shadow-sm"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative min-h-44 overflow-hidden rounded-2xl border border-border bg-background p-6 md:min-h-40 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={version}
                  initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col gap-4"
                >
                  <span
                    className={cn(
                      'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.7rem] font-medium uppercase',
                      version === 'depois' ? 'bg-secondary text-primary' : 'bg-surface text-muted-foreground',
                    )}
                  >
                    {version === 'depois' && <Sparkles className="size-3" aria-hidden="true" />}
                    {version === 'antes' ? 'Texto original' : 'Texto reorganizado'}
                  </span>
                  <p
                    aria-live="polite"
                    className={cn(
                      'text-xl leading-relaxed text-pretty md:text-2xl',
                      version === 'antes' ? 'text-muted-foreground' : 'font-medium text-foreground',
                    )}
                  >
                    {'"'}
                    {VERSIONS[version]}
                    {'"'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="flex items-start gap-2 px-3 pt-3 pb-2 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              Exemplo meramente ilustrativo. Não representa uma resposta gerada em tempo real.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
