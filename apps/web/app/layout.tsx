
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AppProviders } from '@/providers/app-providers'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: {
    default:
      'Currículo Express IA — Crie um currículo profissional em poucos passos',
    template: '%s | Currículo Express IA',
  },

  description:
    'Organize suas experiências, melhore a apresentação das suas informações com ajuda da inteligência artificial e crie um currículo profissional gratuitamente, em poucos passos.',

  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f8f9fc',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <AppProviders>{children}</AppProviders>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
