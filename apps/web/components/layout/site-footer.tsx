import Link from 'next/link'
import { Logo } from '@/components/layout/logo'
import { ROUTES } from '@/lib/constants'

const GROUPS = [
  {
    title: 'Produto',
    links: [
      { label: 'Como funciona', href: '/#como-funciona' },
      { label: 'Modelos', href: '/#modelos' },
      { label: 'Dúvidas frequentes', href: '/#duvidas' },
      { label: 'Criar currículo', href: ROUTES.editor },
    ],
  },
  {
    title: 'Institucional',
    links: [
      { label: 'Política de Privacidade', href: ROUTES.privacy },
      { label: 'Termos de Uso', href: ROUTES.terms },
      { label: 'Contato', href: ROUTES.contact },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-14 md:flex-row md:justify-between md:px-6">
        <div className="flex max-w-sm flex-col gap-4">
          <Logo />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Você conta sua história. Nós ajudamos a apresentá-la. Organize suas informações reais em um currículo claro e
            profissional, com auxílio de inteligência artificial.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:gap-16">
          {GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title} className="flex flex-col gap-3">
              <h3 className="font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">{group.title}</h3>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-foreground/80 transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground md:px-6">
          © {new Date().getFullYear()} Currículo Express IA. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
