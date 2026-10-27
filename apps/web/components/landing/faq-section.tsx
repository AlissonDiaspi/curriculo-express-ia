
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import {
  SectionHeading,
} from '@/components/shared/section-heading'

import {
  AnimatedSection,
} from '@/components/shared/animated-section'

const FAQ = [
  {
    q: 'Como funciona o Currículo Express IA?',
    a: 'Você preenche suas informações em um formulário guiado, pode receber sugestões de melhoria com inteligência artificial, escolhe um dos três modelos disponíveis e visualiza o resultado. Depois, pode baixar gratuitamente o currículo em PDF ou Word.',
  },
  {
    q: 'O Currículo Express IA é gratuito?',
    a: 'Sim. O projeto disponibiliza gratuitamente a criação, a pré-visualização e o download do currículo em PDF e Word. Não existe checkout, assinatura ou cobrança.',
  },
  {
    q: 'Preciso ter um currículo pronto?',
    a: 'Não. Você pode começar do zero. O formulário orienta o preenchimento de informações pessoais, experiências profissionais, formação acadêmica e habilidades.',
  },
  {
    q: 'A inteligência artificial inventa informações?',
    a: 'A inteligência artificial é orientada a melhorar a organização e a redação dos textos sem acrescentar experiências, qualificações ou resultados que você não informou. Revise sempre as sugestões antes de aplicá-las.',
  },
  {
    q: 'A inteligência artificial é obrigatória?',
    a: 'Não. Você pode preencher todas as informações manualmente e criar seu currículo normalmente, mesmo sem utilizar as sugestões da IA.',
  },
  {
    q: 'Posso editar minhas informações?',
    a: 'Sim. Você pode retornar ao formulário para corrigir ou atualizar suas informações antes de baixar o documento.',
  },
  {
    q: 'Posso escolher e trocar o modelo?',
    a: 'Sim. Existem três modelos disponíveis, e você pode trocar o modelo escolhido na etapa de revisão.',
  },
  {
    q: 'Quais formatos posso baixar?',
    a: 'Você pode baixar o currículo em PDF, ideal para compartilhar, ou em Word (.docx), caso queira continuar editando o documento.',
  },
  {
    q: 'Preciso criar uma conta?',
    a: 'Não. O projeto utiliza sessões temporárias para associar o currículo ao navegador, sem exigir cadastro ou senha.',
  },
]

export function FaqSection() {
  return (
    <section
      id="duvidas"
      className="scroll-mt-20 py-20 md:py-28"
      aria-labelledby="duvidas-title"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-4 md:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <SectionHeading
          id="duvidas-title"
          align="left"
          eyebrow="Dúvidas frequentes"
          title="Perguntas comuns, respostas diretas."
          description="Entenda como funciona a criação de currículos, a inteligência artificial e o download dos documentos."
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
                <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline">
                  {item.q}
                </AccordionTrigger>

                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </div>
    </section>
  )
}
