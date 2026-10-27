
import type { EditorStep } from '@/types/resume'

export const PRODUCT_NAME = 'Currículo Express IA'

/**
 * Base URL da API NestJS.
 *
 * As requisições autenticadas por sessão devem usar:
 * credentials: 'include'
 *
 * A sessão é identificada pelo cookie HttpOnly ce_session.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? ''

/**
 * Rotas ativas do fluxo gratuito.
 */
export const ROUTES = {
  home: '/',
  editor: '/criar',
  templates: '/modelos',
  review: '/revisao',
  privacy: '/privacidade',
  terms: '/termos',
  contact: '/contato',
} as const

/**
 * Navegação da landing page.
 */
export const LANDING_NAV = [
  {
    label: 'Como funciona',
    href: '/#como-funciona',
  },
  {
    label: 'Benefícios',
    href: '/#beneficios',
  },
  {
    label: 'Modelos',
    href: '/#modelos',
  },
  {
    label: 'Dúvidas frequentes',
    href: '/#duvidas',
  },
] as const

/**
 * Etapas do editor de currículo.
 */
export const EDITOR_STEPS: EditorStep[] = [
  {
    id: 'personal',
    title: 'Informações pessoais',
    shortTitle: 'Dados',
    description: 'Como os recrutadores vão falar com você.',
  },
  {
    id: 'summary',
    title: 'Objetivo e resumo',
    shortTitle: 'Resumo',
    description: 'Uma apresentação curta da sua trajetória.',
  },
  {
    id: 'experiences',
    title: 'Experiências profissionais',
    shortTitle: 'Experiências',
    description: 'Onde você trabalhou e o que fazia.',
  },
  {
    id: 'education',
    title: 'Formação acadêmica',
    shortTitle: 'Formação',
    description: 'Cursos e instituições de ensino.',
  },
  {
    id: 'skills',
    title: 'Habilidades',
    shortTitle: 'Habilidades',
    description: 'O que você sabe fazer bem.',
  },
  {
    id: 'review',
    title: 'Revisão das informações',
    shortTitle: 'Revisão',
    description: 'Confira seus dados antes de baixar o currículo.',
  },
]

export const SUMMARY_MAX_LENGTH = 600

export const MAX_SKILLS = 30
