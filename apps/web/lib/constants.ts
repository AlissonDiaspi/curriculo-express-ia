import type { EditorStep } from '@/types/resume'

export const PRODUCT_NAME = 'Currículo Express IA'

/** Price in BRL. Keep `null` until the real value is defined — the UI shows "Preço informado na finalização". */
export const PRODUCT_PRICE: number | null = null

export const PRICE_PENDING_LABEL = 'Preço informado na finalização'

export function formatPrice(price: number | null): string {
  if (price === null) return PRICE_PENDING_LABEL
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
}

/** Base URL of the NestJS backend. Requests must use `credentials: 'include'` (ce_session HttpOnly cookie). */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export const ROUTES = {
  home: '/',
  editor: '/criar',
  templates: '/modelos',
  review: '/revisao',
  checkout: '/checkout',
  success: '/sucesso',
  privacy: '/privacidade',
  terms: '/termos',
  contact: '/contato',
} as const

export const LANDING_NAV = [
  { label: 'Como funciona', href: '/#como-funciona' },
  { label: 'Benefícios', href: '/#beneficios' },
  { label: 'Modelos', href: '/#modelos' },
  { label: 'Dúvidas frequentes', href: '/#duvidas' },
] as const

export const EDITOR_STEPS: EditorStep[] = [
  { id: 'personal', title: 'Informações pessoais', shortTitle: 'Dados', description: 'Como os recrutadores vão falar com você.' },
  { id: 'summary', title: 'Objetivo e resumo', shortTitle: 'Resumo', description: 'Uma apresentação curta da sua trajetória.' },
  { id: 'experiences', title: 'Experiências profissionais', shortTitle: 'Experiências', description: 'Onde você trabalhou e o que fazia.' },
  { id: 'education', title: 'Formação acadêmica', shortTitle: 'Formação', description: 'Cursos e instituições de ensino.' },
  { id: 'skills', title: 'Habilidades', shortTitle: 'Habilidades', description: 'O que você sabe fazer bem.' },
  { id: 'review', title: 'Revisão das informações', shortTitle: 'Revisão', description: 'Confira tudo antes de seguir.' },
]

export const SUMMARY_MAX_LENGTH = 600
export const MAX_SKILLS = 30
