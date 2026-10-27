
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'

import { ArrowRight, Menu, X } from 'lucide-react'

import { Logo } from '@/components/layout/logo'
import { PrimaryButton } from '@/components/shared/action-button'
import { LANDING_NAV, ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12)
    }

    onScroll()

    window.addEventListener('scroll', onScroll, {
      passive: true,
    })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        scrolled || open
          ? 'border-b border-border/70 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/70'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Logo />

        {/* Navegação desktop */}
        <nav
          aria-label="Navegação principal"
          className="hidden md:block"
        >
          <ul className="flex items-center gap-1">
            {LANDING_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Botão desktop */}
        <div className="hidden md:block">
          <PrimaryButton
            href={ROUTES.editor}
            size="sm"
          >
            Criar grátis

            <ArrowRight
              className="transition-transform group-hover/action:translate-x-0.5"
              aria-hidden="true"
            />
          </PrimaryButton>
        </div>

        {/* Botão menu mobile */}
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-full text-foreground hover:bg-accent focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={
            open ? 'Fechar menu' : 'Abrir menu'
          }
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Navegação mobile"
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: 'auto',
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="overflow-hidden md:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 pt-2 pb-4">
              {LANDING_NAV.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{
                    opacity: 0,
                    x: -8,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.04 * i,
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex h-12 items-center rounded-xl px-3 text-base text-foreground hover:bg-accent"
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}

              <li className="pt-2">
                <PrimaryButton
                  href={ROUTES.editor}
                  size="lg"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  Criar currículo grátis
                  <ArrowRight aria-hidden="true" />
                </PrimaryButton>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
