'use client'

import { MotionConfig } from 'motion/react'
import { Toaster } from '@/components/ui/sonner'
import { ResumeProvider } from '@/providers/resume-provider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ResumeProvider>{children}</ResumeProvider>
      <Toaster position="top-center" richColors={false} />
    </MotionConfig>
  )
}
