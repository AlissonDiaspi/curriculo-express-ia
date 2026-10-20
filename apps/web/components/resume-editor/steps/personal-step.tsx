'use client'

import { AtSign, Globe, Mail, MapPin, Phone, User } from 'lucide-react'
import { FormField } from '@/components/shared/form-field'
import { useResume } from '@/providers/resume-provider'
import { validatePersonal } from '@/lib/resume-validation'

function maskPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function PersonalStep({ showErrors }: { showErrors: boolean }) {
  const { resume, updatePersonal } = useResume()
  const p = resume.personal
  const errors = showErrors ? validatePersonal(p) : {}

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <FormField
        label="Nome completo"
        required
        fieldClassName="md:col-span-2"
        icon={<User />}
        value={p.fullName}
        onChange={(e) => updatePersonal({ fullName: e.target.value })}
        placeholder="Como você quer ser chamado no currículo"
        autoComplete="name"
        error={errors.fullName}
      />
      <FormField
        label="E-mail"
        required
        type="email"
        inputMode="email"
        icon={<Mail />}
        value={p.email}
        onChange={(e) => updatePersonal({ email: e.target.value })}
        placeholder="voce@email.com"
        autoComplete="email"
        error={errors.email}
      />
      <FormField
        label="Telefone"
        type="tel"
        inputMode="tel"
        icon={<Phone />}
        value={p.phone}
        onChange={(e) => updatePersonal({ phone: maskPhone(e.target.value) })}
        placeholder="(11) 91234-5678"
        autoComplete="tel-national"
        error={errors.phone}
      />
      <FormField
        label="Cidade"
        fieldClassName="md:col-span-2"
        icon={<MapPin />}
        value={p.city}
        onChange={(e) => updatePersonal({ city: e.target.value })}
        placeholder="Ex.: Belo Horizonte, MG"
        autoComplete="address-level2"
        hint="Basta a cidade e o estado. Não é preciso informar endereço completo."
      />
      <FormField
        label="LinkedIn"
        type="url"
        inputMode="url"
        icon={<AtSign />}
        value={p.linkedin}
        onChange={(e) => updatePersonal({ linkedin: e.target.value })}
        placeholder="linkedin.com/in/seu-nome"
        error={errors.linkedin}
      />
      <FormField
        label="Portfólio ou site"
        type="url"
        inputMode="url"
        icon={<Globe />}
        value={p.website}
        onChange={(e) => updatePersonal({ website: e.target.value })}
        placeholder="seusite.com.br"
        autoComplete="url"
        error={errors.website}
      />
    </div>
  )
}
