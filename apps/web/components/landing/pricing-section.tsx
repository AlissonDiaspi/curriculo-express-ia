import { ArrowRight, Check } from 'lucide-react'
import { SectionHeading } from '@/components/shared/section-heading'
import { AnimatedSection } from '@/components/shared/animated-section'
import { PrimaryButton } from '@/components/shared/action-button'
import { PRODUCT_PRICE, ROUTES, formatPrice } from '@/lib/constants'

export const INCLUDED_BENEFITS = [
  'Auxílio da IA na organização dos textos',
  'Escolha de modelo profissional',
  'Revisão antes da finalização',
  'Pagamento único, sem assinatura',
  'Liberação do currículo após confirmação do pagamento',
]

export function PricingSection() {
  return (
    <section id="preco" className="scroll-mt-20 py-20 md:py-28" aria-labelledby="preco-title">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 md:px-6">
        <SectionHeading
          id="preco-title"
          eyebrow="Preço"
          title="Pague uma vez. Sem mensalidade."
          description="Você só paga quando estiver satisfeito com as informações e quiser liberar seu currículo."
        />
        <AnimatedSection delay={0.1} className="mx-auto w-full max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-px shadow-[0_40px_80px_-40px_oklch(0.5_0.21_268/0.5)]">
            <div className="grid gap-8 rounded-[calc(1.5rem-1px)] bg-card p-6 md:grid-cols-[1fr_1.1fr] md:p-10">
              <div className="flex flex-col gap-4">
                <span className="w-fit rounded-full bg-secondary px-3 py-1 font-mono text-xs font-medium text-primary uppercase">
                  Pagamento único
                </span>
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">Currículo Express IA</h3>
                <p
                  className={
                    PRODUCT_PRICE === null
                      ? 'text-lg font-medium text-muted-foreground'
                      : 'text-4xl font-semibold tracking-tight text-foreground'
                  }
                >
                  {formatPrice(PRODUCT_PRICE)}
                </p>
                <PrimaryButton href={ROUTES.editor} size="lg" className="mt-2 w-full md:w-fit">
                  Começar meu currículo
                  <ArrowRight className="transition-transform group-hover/action:translate-x-0.5" />
                </PrimaryButton>
              </div>
              <ul className="flex flex-col gap-3.5 md:border-l md:border-border md:pl-8">
                {INCLUDED_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/12 text-success">
                      <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
