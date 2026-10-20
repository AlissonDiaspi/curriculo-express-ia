'use client'

import { SkillTagInput } from '@/components/resume-editor/skill-tag-input'
import { useResume } from '@/providers/resume-provider'

export function SkillsStep() {
  const { resume, addSkill, removeSkill } = useResume()
  return <SkillTagInput skills={resume.skills} onAdd={addSkill} onRemove={removeSkill} />
}
