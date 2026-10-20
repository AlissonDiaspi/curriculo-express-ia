
import type { ResumeTemplate } from '@/types/template'

/**
 * Registro central dos modelos disponíveis.
 *
 * Os IDs devem corresponder aos arquivos DOCX
 * utilizados pelo backend NestJS.
 *
 * As imagens ficam em:
 * apps/web/public/templates/
 */
export const TEMPLATES: ResumeTemplate[] = [
  {
    id: 'modelo-01',
    name: 'Clássico',
    thumbnailUrl: '/templates/modelo-01.png',
    previewUrl: '/templates/modelo-01.png',
    description:
      'Um currículo tradicional, elegante e organizado. Ideal para estudantes, recém-formados e profissionais que desejam destacar sua formação acadêmica.',
    category: 'outro',
  },
  {
    id: 'modelo-02',
    name: 'Profissional',
    thumbnailUrl: '/templates/modelo-02.png',
    previewUrl: '/templates/modelo-02.png',
    description:
      'Um modelo objetivo e profissional, com destaque para experiências anteriores, responsabilidades e trajetória de carreira.',
    category: 'outro',
  },
  {
    id: 'modelo-03',
    name: 'Técnico',
    thumbnailUrl: '/templates/modelo-03.png',
    previewUrl: '/templates/modelo-03.png',
    description:
      'Um currículo voltado para profissionais de tecnologia, desenvolvimento de software e áreas técnicas, valorizando experiências e competências.',
    category: 'outro',
  },
]

export function getTemplateById(
  id: string | null | undefined,
): ResumeTemplate | undefined {
  if (!id) return undefined

  return TEMPLATES.find(
    (template) => template.id === id,
  )
}
