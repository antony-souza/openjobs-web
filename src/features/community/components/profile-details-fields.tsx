interface Details {
  headline: string
  bio: string
  location: string
  portfolioUrl: string
  linkedinUrl: string
}

export function ProfileDetailsFields({
  value,
  change,
  disabled,
}: {
  value: Details
  change: (value: Details) => void
  disabled: boolean
}) {
  const fields = [
    {
      key: 'headline',
      label: 'Título profissional',
      placeholder: 'Ex.: Desenvolvedor Java | Back-end',
      max: 120,
      type: 'text',
    },
    {
      key: 'location',
      label: 'Localização',
      placeholder: 'Ex.: São Paulo, SP',
      max: 120,
      type: 'text',
    },
    {
      key: 'portfolioUrl',
      label: 'Link do portfólio',
      placeholder: 'https://seuportfolio.com',
      max: 2048,
      type: 'url',
    },
    {
      key: 'linkedinUrl',
      label: 'Link do LinkedIn',
      placeholder: 'https://linkedin.com/in/seuusuario',
      max: 2048,
      type: 'url',
    },
  ] as const
  return (
    <section className="space-y-5 border-t border-[#e5ebf3] p-6 sm:p-8">
      <div>
        <h2 className="text-base font-bold">Seu perfil público</h2>
        <p className="mt-1 text-xs leading-relaxed text-[#8392a8]">
          Conte um pouco sobre sua trajetória. Estas informações ficam visíveis
          no seu perfil público.
        </p>
      </div>
      {fields.map((field) => (
        <div key={field.key}>
          <label
            className="mb-2 block text-sm font-semibold"
            htmlFor={`profile-${field.key}`}
          >
            {field.label}
          </label>
          <input
            id={`profile-${field.key}`}
            name={field.key}
            type={field.type}
            className="oj-input"
            placeholder={field.placeholder}
            value={value[field.key]}
            onChange={(event) =>
              change({ ...value, [field.key]: event.target.value })
            }
            maxLength={field.max}
            disabled={disabled}
          />
        </div>
      ))}
      <div>
        <label
          className="mb-2 block text-sm font-semibold"
          htmlFor="profile-bio"
        >
          Sobre você
        </label>
        <textarea
          id="profile-bio"
          name="bio"
          rows={5}
          className="oj-input resize-y"
          placeholder="Suas experiências, interesses, habilidades e o que você procura para seu próximo passo."
          value={value.bio}
          onChange={(event) => change({ ...value, bio: event.target.value })}
          maxLength={2000}
          disabled={disabled}
        />
        <p className="mt-1 text-right text-xs text-[#8392a8]">
          {value.bio.length.toLocaleString('pt-BR')} / 2.000 caracteres
        </p>
      </div>
    </section>
  )
}
