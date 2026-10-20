'use client'

import { ArrowLeft, Check, Lock } from 'lucide-react'
import { ActionButton } from '@/components/shared/action-button'
import { PendingIntegrationNotice } from '@/components/shared/states'
import { INCLUDED_BENEFITS } from '@/components/landing/pricing-section'
import { useResume } from '@/providers/resume-provider'
import { getTemplateById } from '@/lib/templates'
import { PRODUCT_NAME, PRODUCT_PRICE, ROUTES, formatPrice } from '@/lib/constants'

export function CheckoutView() {
  const { resume, templateId } = useResume()
  const template = getTemplateById(templateId)
  const price = formatPrice(PRODUCT_PRICE)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pt-10 pb-20 md:px-6 md:pt-14">
      <ActionButton variant="ghost" size="sm" href={ROUTES.review} className="w-fit">
        <ArrowLeft aria-hidden="true" />
        Voltar à revisão
      </ActionButton>

      <header className="flex flex-col gap-3">
        <span className="font-mono text-xs font-medium tracking-wide text-primary uppercase">Etapa 4 de 4</span>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-balance text-foreground md:text-4xl">
          Finalize seu currículo
        </h1>
      </header>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start">
        <section aria-labelledby="order-title" className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 id="order-title" className="font-display text-lg font-semibold text-foreground">
            Resumo do pedido
          </h2>

          <dl className="flex flex-col divide-y divide-border text-sm">
            <div className="flex items-center justify-between gap-4 pb-3">
              <dt className="text-muted-foreground">Produto</dt>
              <dd className="font-medium text-foreground">{PRODUCT_NAME}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-muted-foreground">Currículo de</dt>
              <dd className="truncate font-medium text-foreground">{resume.personal.fullName}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 pt-3">
              <dt className="text-muted-foreground">Modelo</dt>
              <dd className="font-medium text-foreground">{template?.name ?? '—'}</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Incluído</h3>
            <ul className="flex flex-col gap-2.5">
              {INCLUDED_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
                  <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="payment-title" className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 md:p-8">
          <div className="flex flex-col gap-1">
            <h2 id="payment-title" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Pagamento único
            </h2>
            <p className="font-display text-3xl font-semibold tracking-tight text-foreground">{price}</p>
            <p className="text-sm text-muted-foreground">Sem assinatura e sem cobranças recorrentes.</p>
          </div>

          <div
            id="payment-provider-slot"
            className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface/60 p-6 text-center"
          >
            <Lock className="size-5 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">Área reservada para o checkout</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              O formulário do provedor de pagamento será exibido aqui.
            </p>
          </div>

          <ActionButton size="lg" disabled aria-describedby="payment-pending" className="w-full">
            Integração de pagamento pendente
          </ActionButton>

          <div id="payment-pending">
            <PendingIntegrationNotice title="Pagamento ainda não disponível">
              O pagamento será processado por um provedor externo seguro assim que a integração for concluída. Nenhuma
              cobrança é feita nesta versão.
            </PendingIntegrationNotice>
          </div>
        </section>
      </div>
    </div>
  )
}
