'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Info, Lightbulb } from 'lucide-react'
import type { EditorStepId } from '@/types/resume'
import { ResumeProgress } from '@/components/resume-editor/resume-progress'
import { useResume } from '@/providers/resume-provider'

const GUIDANCE: Record<EditorStepId, { title: string; tips: string[] }> = {
  personal: {
    title: 'Contato fácil, sem excessos',
    tips: [
      'Use um e-mail que você confere com frequência e que tenha um nome profissional.',
      'Não é necessário informar CPF, RG, estado civil ou endereço completo.',
    ],
  },
  summary: {
    title: 'Sua apresentação em poucas linhas',
    tips: [
      'Pense no resumo como a resposta para "fale um pouco sobre você".',
      'Adapte o texto para o tipo de vaga que você procura.',
    ],
  },
  experiences: {
    title: 'Comece pela mais recente',
    tips: [
      'Descreva atividades e resultados reais, de forma simples.',
      'Trabalhos informais, estágios e voluntariado também contam.',
    ],
  },
  education: {
    title: 'Formação que soma',
    tips: [
      'Inclua a formação mais alta concluída ou em andamento.',
      'Cursos livres relacionados à vaga podem fazer diferença.',
    ],
  },
  skills: {
    title: 'Habilidades verdadeiras',
    tips: [
      'Prefira de 5 a 12 habilidades relevantes para a vaga.',
      'Adicione apenas o que você conseguiria demonstrar em uma entrevista.',
    ],
  },
  review: {
    title: 'Última conferência',
    tips: ['Verifique nomes, datas e contatos com atenção.', 'Você ainda poderá voltar e ajustar depois de escolher o modelo.'],
  },
}

export function GuidancePanel({ step }: { step: EditorStepId }) {
  const { resume } = useResume()
  const guidance = GUIDANCE[step]

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence mode="wait">
        <motion.section
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          aria-label="Orientações da etapa"
          className="flex flex-col gap-4 rounded-2xl border border-primary/15 bg-secondary/60 p-5"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-card text-primary shadow-sm">
              <Lightbulb className="size-4" aria-hidden="true" />
            </span>
            <h2 className="text-sm font-semibold text-foreground">{guidance.title}</h2>
          </div>
          <ul className="flex flex-col gap-2.5">
            {guidance.tips.map((tip) => (
              <li key={tip} className="flex gap-2.5 text-sm leading-relaxed text-secondary-foreground/85">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/50" aria-hidden="true" />
                {tip}
              </li>
            ))}
          </ul>
        </motion.section>
      </AnimatePresence>

      <div className="rounded-2xl border border-border bg-card p-5">
        <ResumeProgress resume={resume} />
      </div>

      <p className="flex gap-2 px-1 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        Seus dados ficam apenas nesta aba do navegador e ainda não são salvos em servidor. Evite recarregar a página.
      </p>
    </div>
  )
}
