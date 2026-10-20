import type { Education, EditorStepId, Experience, PersonalInfo, ResumeContent } from '@/types/resume'
import { EMAIL_PATTERN } from '@/providers/resume-provider'
import { SUMMARY_MAX_LENGTH } from '@/lib/constants'

export type FieldErrors<T> = Partial<Record<keyof T, string>>

const URL_PATTERN = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#].*)?$/i

export function validatePersonal(p: PersonalInfo): FieldErrors<PersonalInfo> {
  const errors: FieldErrors<PersonalInfo> = {}
  if (p.fullName.trim().length < 3) errors.fullName = 'Informe seu nome completo.'
  if (!p.email.trim()) errors.email = 'Informe um e-mail para contato.'
  else if (!EMAIL_PATTERN.test(p.email.trim())) errors.email = 'Esse e-mail parece incompleto. Confira, por favor.'
  if (p.phone.trim() && p.phone.replace(/\D/g, '').length < 10) errors.phone = 'Inclua o DDD. Ex.: (11) 91234-5678'
  if (p.linkedin.trim() && !URL_PATTERN.test(p.linkedin.trim())) errors.linkedin = 'Cole o endereço completo do seu perfil.'
  if (p.website.trim() && !URL_PATTERN.test(p.website.trim())) errors.website = 'Informe um endereço válido.'
  return errors
}

function validatePeriod(start: string, end: string, ongoing: boolean) {
  const errors: { startDate?: string; endDate?: string } = {}
  if (!start) errors.startDate = 'Informe o mês de início.'
  if (!ongoing && !end) errors.endDate = 'Informe o mês de término.'
  if (start && end && !ongoing && end < start) errors.endDate = 'O término deve ser depois do início.'
  return errors
}

export function validateExperience(e: Experience): FieldErrors<Experience> {
  return {
    ...(e.company.trim() ? {} : { company: 'Informe a empresa.' }),
    ...(e.role.trim() ? {} : { role: 'Informe o cargo.' }),
    ...validatePeriod(e.startDate, e.endDate, e.isCurrent),
  }
}

export function validateEducation(e: Education): FieldErrors<Education> {
  return {
    ...(e.institution.trim() ? {} : { institution: 'Informe a instituição.' }),
    ...(e.course.trim() ? {} : { course: 'Informe o curso.' }),
    ...validatePeriod(e.startDate, e.endDate, e.inProgress),
  }
}

const hasErrors = (errors: object) => Object.keys(errors).length > 0

export function isStepValid(step: EditorStepId, resume: ResumeContent): boolean {
  switch (step) {
    case 'personal':
      return !hasErrors(validatePersonal(resume.personal))
    case 'summary':
      return resume.summary.length <= SUMMARY_MAX_LENGTH
    case 'experiences':
      return resume.experiences.every((e) => !hasErrors(validateExperience(e)))
    case 'education':
      return resume.education.every((e) => !hasErrors(validateEducation(e)))
    default:
      return true
  }
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function formatMonth(value: string): string {
  const [year, month] = value.split('-')
  if (!year || !month) return ''
  return `${MONTHS[Number(month) - 1]}/${year}`
}

export function formatPeriod(start: string, end: string, ongoing: boolean, ongoingLabel: string): string {
  const s = formatMonth(start)
  const e = ongoing ? ongoingLabel : formatMonth(end)
  if (!s && !e) return 'Período não informado'
  return `${s || '—'} – ${e || '—'}`
}
