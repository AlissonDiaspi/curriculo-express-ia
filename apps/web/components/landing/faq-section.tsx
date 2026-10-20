import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { SectionHeading } from '@/components/shared/section-heading'
import { AnimatedSection } from '@/components/shared/animated-section'

const FAQ = [
  {
    q: 'Como funciona o Currículo Express IA?',
    a: 'Você preenche suas informações em um formulário guiado, revisa sugestões de melhoria para os textos, escolhe um modelo profissional e confere tudo antes de finalizar. Depois da confirmação do pagamento, o currículo é liberado.',
  },
  {
    q: 'Preciso ter um currículo pronto?',
    a: 'Não. Você pode começar do zero — o formulário pede cada informação por etapas. Se já tiver um currículo, ele pode servir como referência para preencher os campos.',
  },
  {
    q: 'A inteligência artificial inventa informações?',
    a: 'Não. A IA apenas reorganiza, corrige e melhora a redação do que você informou. Ela não cria experiências, qualificações, cursos, certificados ou resultados, e não altera os fatos fornecidos.',
  },
  {
    q: 'Posso editar minhas informações?',
    a: 'Sim. Durante todo o processo você pode voltar a qualquer etapa e ajustar os dados antes de finalizar.',
  },
  {
    q: 'Posso escolher o modelo?',
    a: 'Sim. Você escolhe entre os modelos profissionais disponíveis e pode trocar de modelo na etapa de revisão.',
  },
  {
    q: 'É necessário pagar uma assinatura?',
    a: 'Não. O pagamento é único, feito na finalização do currículo. Não há cobrança recorrente.',
  },
  {
    q: 'Quando consigo baixar meu currículo?',
    a: 'O currículo é liberado para download após a confirmação do pagamento.',
  },
]

export function FaqSection() {
  return (
    <section id="duvidas" className="scroll-mt-20 py-20 md:py-28" aria-labelledby="duvidas-title">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 md:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <SectionHeading
          id="duvidas-title"
          align="left"
          eyebrow="Dúvidas frequentes"
          title="Perguntas comuns, respostas diretas."
          description="Não encontrou o que procurava? Fale com a gente pela página de contato."
          className="lg:sticky lg:top-24 lg:self-start"
        />
        <AnimatedSection delay={0.1}>
          <Accordion className="flex flex-col gap-3">
            {FAQ.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`item-${i}`}
                className="rounded-2xl border border-border bg-card px-5 transition-colors last:border-b data-open:border-primary/25 data-open:shadow-[0_12px_32px_-20px_oklch(0.5_0.21_268/0.3)]"
              >
                <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline">{item.q}</AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </div>
    </section>
  )
}
