/**
 * Mirrors the backend resume content schema (sections: personal, summary,
 * experiences, education, skills). Keep field names stable for the NestJS API.
 */
export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  city: string
  linkedin: string
  website: string
}

export interface Experience {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string
  isCurrent: boolean
  description: string
}

export interface Education {
  id: string
  institution: string
  course: string
  startDate: string
  endDate: string
  inProgress: boolean
}

export interface ResumeContent {
  personal: PersonalInfo
  summary: string
  experiences: Experience[]
  education: Education[]
  skills: string[]
}

export type EditorStepId = 'personal' | 'summary' | 'experiences' | 'education' | 'skills' | 'review'

export interface EditorStep {
  id: EditorStepId
  title: string
  shortTitle: string
  description: string
}
