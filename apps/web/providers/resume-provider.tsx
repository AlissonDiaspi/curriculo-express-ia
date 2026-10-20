
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import type {
  Education,
  Experience,
  PersonalInfo,
  ResumeContent,
} from '@/types/resume'

const EMPTY_RESUME: ResumeContent = {
  personal: {
    fullName: '',
    email: '',
    phone: '',
    city: '',
    linkedin: '',
    website: '',
  },
  summary: '',
  experiences: [],
  education: [],
  skills: [],
}

function createId(): string {
  return crypto.randomUUID()
}

export function createExperience(): Experience {
  return {
    id: createId(),
    company: '',
    role: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  }
}

export function createEducation(): Education {
  return {
    id: createId(),
    institution: '',
    course: '',
    startDate: '',
    endDate: '',
    inProgress: false,
  }
}

interface ResumeContextValue {
  resume: ResumeContent

  resumeId: string | null
  setResumeId: (id: string | null) => void

  templateId: string | null
  setTemplateId: (id: string | null) => void

  completedSteps: number
  setCompletedSteps: (count: number) => void

  loadResume: (
    id: string,
    content: ResumeContent,
    selectedTemplateId: string | null,
    progress: number,
  ) => void

  updatePersonal: (patch: Partial<PersonalInfo>) => void
  setSummary: (summary: string) => void

  addExperience: () => string
  updateExperience: (
    id: string,
    patch: Partial<Experience>,
  ) => void
  removeExperience: (id: string) => void

  addEducation: () => string
  updateEducation: (
    id: string,
    patch: Partial<Education>,
  ) => void
  removeEducation: (id: string) => void

  addSkill: (skill: string) => boolean
  removeSkill: (skill: string) => void
}

const ResumeContext =
  createContext<ResumeContextValue | null>(null)

export function ResumeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [resume, setResume] =
    useState<ResumeContent>(EMPTY_RESUME)

  const [resumeId, setResumeId] =
    useState<string | null>(null)

  const [templateId, setTemplateId] =
    useState<string | null>(null)

  const [completedSteps, setCompletedStepsState] =
    useState(0)

  const setCompletedSteps = useCallback(
    (count: number) => {
      setCompletedStepsState((current) =>
        Math.max(current, count),
      )
    },
    [],
  )

  const loadResume = useCallback(
    (
      id: string,
      content: ResumeContent,
      selectedTemplateId: string | null,
      progress: number,
    ) => {
      setResume(content)
      setResumeId(id)
      setTemplateId(selectedTemplateId)
      setCompletedStepsState(progress)
    },
    [],
  )

  const updatePersonal = useCallback(
    (patch: Partial<PersonalInfo>) => {
      setResume((current) => ({
        ...current,
        personal: {
          ...current.personal,
          ...patch,
        },
      }))
    },
    [],
  )

  const setSummary = useCallback((summary: string) => {
    setResume((current) => ({
      ...current,
      summary,
    }))
  }, [])

  const addExperience = useCallback(() => {
    const experience = createExperience()

    setResume((current) => ({
      ...current,
      experiences: [
        ...current.experiences,
        experience,
      ],
    }))

    return experience.id
  }, [])

  const updateExperience = useCallback(
    (id: string, patch: Partial<Experience>) => {
      setResume((current) => ({
        ...current,
        experiences: current.experiences.map((item) =>
          item.id === id
            ? { ...item, ...patch }
            : item,
        ),
      }))
    },
    [],
  )

  const removeExperience = useCallback((id: string) => {
    setResume((current) => ({
      ...current,
      experiences: current.experiences.filter(
        (item) => item.id !== id,
      ),
    }))
  }, [])

  const addEducation = useCallback(() => {
    const education = createEducation()

    setResume((current) => ({
      ...current,
      education: [
        ...current.education,
        education,
      ],
    }))

    return education.id
  }, [])

  const updateEducation = useCallback(
    (id: string, patch: Partial<Education>) => {
      setResume((current) => ({
        ...current,
        education: current.education.map((item) =>
          item.id === id
            ? { ...item, ...patch }
            : item,
        ),
      }))
    },
    [],
  )

  const removeEducation = useCallback((id: string) => {
    setResume((current) => ({
      ...current,
      education: current.education.filter(
        (item) => item.id !== id,
      ),
    }))
  }, [])

  const addSkill = useCallback((skill: string) => {
    const value = skill.trim()

    if (!value) return false

    const exists = resume.skills.some(
      (item) =>
        item.toLowerCase() === value.toLowerCase(),
    )

    if (exists) return false

    setResume((current) => ({
      ...current,
      skills: [...current.skills, value],
    }))

    return true
  }, [resume.skills])

  const removeSkill = useCallback((skill: string) => {
    setResume((current) => ({
      ...current,
      skills: current.skills.filter(
        (item) => item !== skill,
      ),
    }))
  }, [])

  const value = useMemo<ResumeContextValue>(
    () => ({
      resume,
      resumeId,
      setResumeId,
      templateId,
      setTemplateId,
      completedSteps,
      setCompletedSteps,
      loadResume,
      updatePersonal,
      setSummary,
      addExperience,
      updateExperience,
      removeExperience,
      addEducation,
      updateEducation,
      removeEducation,
      addSkill,
      removeSkill,
    }),
    [
      resume,
      resumeId,
      templateId,
      completedSteps,
      setCompletedSteps,
      loadResume,
      updatePersonal,
      setSummary,
      addExperience,
      updateExperience,
      removeExperience,
      addEducation,
      updateEducation,
      removeEducation,
      addSkill,
      removeSkill,
    ],
  )

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume() {
  const context = useContext(ResumeContext)

  if (!context) {
    throw new Error(
      'useResume deve ser usado dentro de <ResumeProvider>',
    )
  }

  return context
}

export const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isPersonalValid(
  personal: PersonalInfo,
): boolean {
  return (
    personal.fullName.trim().length >= 3 &&
    EMAIL_PATTERN.test(personal.email.trim())
  )
}
