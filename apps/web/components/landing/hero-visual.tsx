'use client'

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { Check, PenLine, Sparkles } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const

function Line({ w, className = 'bg-input', delay = 0 }: { w: string; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      style={{ width: w, originX: 0 }}
      className={`h-1.5 rounded-full ${className}`}
    />
  )
}

/** Illustrative composition only — not a real generated resume. */
export function HeroVisual() {
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 20 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 20 })
  const fx = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 120, damping: 20 })
  const fy = useSpring(useTransform(my, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 20 })

  return (
    <div
      className="relative mx-auto w-full max-w-md [perspective:1200px] lg:max-w-none"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse') return
        const rect = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - rect.left) / rect.width - 0.5)
        my.set((e.clientY - rect.top) / rect.height - 0.5)
      }}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
      }}
      aria-hidden="true"
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
        className="relative mx-auto w-[78%] [transform-style:preserve-3d] sm:w-[70%]"
      >
        {/* Document */}
        <div className="relative aspect-[210/297] rounded-2xl border border-border bg-card p-[8%] shadow-[0_40px_80px_-32px_oklch(0.3_0.12_268/0.35),0_2px_6px_oklch(0.22_0.045_265/0.06)]">
          <div className="flex items-center gap-3">
            <div className="size-10 shrink-0 rounded-full bg-brand-gradient opacity-90 sm:size-12" />
            <div className="flex flex-1 flex-col gap-2">
              <Line w="70%" className="h-2.5 bg-foreground/80" delay={0.5} />
              <Line w="45%" className="bg-primary/40" delay={0.6} />
            </div>
          </div>

          <div className="mt-[10%] flex flex-col gap-2">
            <Line w="30%" className="h-2 bg-primary/70" delay={0.7} />
            <Line w="100%" delay={0.75} />
            <Line w="92%" delay={0.8} />
            <Line w="64%" delay={0.85} />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="relative mt-[8%] flex flex-col gap-2 rounded-lg p-2 ring-2 ring-primary/50 ring-offset-2 ring-offset-card"
          >
            <span className="absolute -top-2.5 left-2 rounded-sm bg-primary px-1.5 py-px font-mono text-[0.55rem] font-semibold text-primary-foreground">
              EDITANDO
            </span>
            <Line w="34%" className="h-2 bg-primary/70" delay={1.1} />
            <Line w="96%" delay={1.15} />
            <Line w="80%" delay={1.2} />
            <motion.div
              className="h-3 w-0.5 bg-primary"
              animate={reduce ? undefined : { opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>

          <div className="mt-[8%] flex flex-col gap-2">
            <Line w="28%" className="h-2 bg-primary/70" delay={1.3} />
            <div className="flex flex-wrap gap-1.5">
              {['w-12', 'w-16', 'w-10', 'w-14', 'w-11'].map((w, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 + i * 0.06, type: 'spring', stiffness: 300 }}
                  className={`h-4 ${w} rounded-full bg-secondary`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating: text review card */}
      <motion.div style={{ x: fx, y: fy }} className="absolute top-[14%] -left-1 w-[58%] sm:left-0 sm:w-[52%] lg:-left-6">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={reduce ? { opacity: 1, x: 0 } : { opacity: 1, x: 0, y: [0, -8, 0] }}
          transition={{
            opacity: { delay: 0.9, duration: 0.6 },
            x: { delay: 0.9, duration: 0.6, ease: EASE },
            y: { delay: 1.6, duration: 6, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="rounded-2xl border border-border bg-card/95 p-3.5 shadow-[0_20px_40px_-20px_oklch(0.3_0.12_268/0.35)] backdrop-blur-md"
        >
          <div className="mb-2.5 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-brand-gradient text-primary-foreground">
              <Sparkles className="size-3.5" />
            </span>
            <span className="text-xs font-semibold text-foreground">Revisão de texto</span>
          </div>
          <p className="text-[0.7rem] leading-relaxed text-muted-foreground line-through decoration-destructive/50">
            trabalhava atendendo clientes
          </p>
          <p className="mt-1 text-[0.7rem] leading-relaxed font-medium text-foreground">Atendimento ao cliente</p>
        </motion.div>
      </motion.div>

      {/* Floating: steps */}
      <motion.div style={{ x: useTransform(fx, (v) => -v), y: useTransform(fy, (v) => -v) }} className="absolute right-0 bottom-[10%] w-[50%] sm:w-[44%] lg:-right-4">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={reduce ? { opacity: 1, x: 0 } : { opacity: 1, x: 0, y: [0, 8, 0] }}
          transition={{
            opacity: { delay: 1.1, duration: 0.6 },
            x: { delay: 1.1, duration: 0.6, ease: EASE },
            y: { delay: 1.8, duration: 7, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="rounded-2xl border border-border bg-card/95 p-3.5 shadow-[0_20px_40px_-20px_oklch(0.3_0.12_268/0.35)] backdrop-blur-md"
        >
          <span className="font-mono text-[0.6rem] font-medium tracking-wide text-muted-foreground uppercase">Etapas</span>
          <ul className="mt-2 flex flex-col gap-1.5">
            {['Dados pessoais', 'Experiências', 'Habilidades'].map((label, i) => (
              <motion.li
                key={label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 + i * 0.25 }}
                className="flex items-center gap-2 text-[0.7rem] text-foreground"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5 + i * 0.25, type: 'spring', stiffness: 400 }}
                  className={`flex size-4 items-center justify-center rounded-full ${i < 2 ? 'bg-success text-success-foreground' : 'border border-primary bg-secondary'}`}
                >
                  {i < 2 && <Check className="size-2.5" strokeWidth={3} />}
                </motion.span>
                {label}
              </motion.li>
            ))}
          </ul>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-brand-gradient"
              initial={{ width: '0%' }}
              animate={{ width: '66%' }}
              transition={{ delay: 1.6, duration: 1.2, ease: EASE }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Floating: organized badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.1, type: 'spring', stiffness: 260, damping: 18 }}
        className="absolute top-[2%] right-[6%] flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[0.7rem] font-medium text-foreground shadow-md"
      >
        <PenLine className="size-3.5 text-primary" />
        Conteúdo organizado
      </motion.div>
    </div>
  )
}
