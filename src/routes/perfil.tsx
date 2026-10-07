import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AtSign,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  ImagePlus,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react'
import { AppShell } from '../features/community/components/app-shell'
import { Avatar } from '../features/community/components/avatar'
import { Feed } from '../features/community/components/feed'
import { JobManager } from '../features/community/components/job-manager'
import { ProfileCover } from '../features/community/components/profile-cover'
import { ProfileCoverField } from '../features/community/components/profile-cover-field'
import { ProfileDetailsFields } from '../features/community/components/profile-details-fields'
import { useSession } from '../features/community/hooks/use-session'
import {
  getJobCapabilities,
  updateProfile,
} from '../features/community/services/community-service'
import type { Profile } from '../features/community/services/community-service'

export const Route = createFileRoute('/perfil')({
  component: ProfilePage,
  validateSearch: (
    search: Record<string, unknown>,
  ): { section?: 'editar' | 'publico' | 'vagas' } => ({
    section:
      search.section === 'editar' ||
        search.section === 'publico' ||
        search.section === 'vagas'
        ? search.section
        : undefined,
  }),
  head: () => ({ meta: [{ title: 'Open Jobs | Meu perfil' }] }),
})

function ProfilePage() {
  const session = useSession()
  return (
    <AppShell session={session}>
      {session.profile && <ProfileEditor profile={session.profile} />}
    </AppShell>
  )
}

function ProfileEditor({ profile }: { profile: Profile }) {
  const client = useQueryClient()
  const { section } = Route.useSearch()
  const navigate = Route.useNavigate()
  const capabilities = useQuery({
    queryKey: ['job-capabilities', profile.id],
    queryFn: getJobCapabilities,
  })
  const tab =
    section === 'editar'
      ? 'information'
      : section === 'publico'
        ? 'public'
        : section === 'vagas'
          ? 'jobs'
          : 'posts'
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [username, setUsername] = useState(profile.username)
  const [details, setDetails] = useState({
    headline: profile.headline ?? '',
    bio: profile.bio ?? '',
    location: profile.location ?? '',
    portfolioUrl: profile.portfolioUrl ?? '',
    linkedinUrl: profile.linkedinUrl ?? '',
  })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [removeCover, setRemoveCover] = useState(false)
  const [coverError, setCoverError] = useState<string | null>(null)
  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(null)
      return
    }
    const url = URL.createObjectURL(coverFile)
    setCoverPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [coverFile])
  const cover = coverPreview ?? (removeCover ? null : profile.coverUrl)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  const photo = preview ?? (removeAvatar ? null : profile.avatarUrl)
  const save = useMutation({
    mutationFn: () => {
      const form = new FormData()
      form.set('name', name.trim())
      form.set('email', email.trim())
      form.set('username', username.trim())
      form.set('removeAvatar', String(removeAvatar))
      form.set('removeCover', String(removeCover))
      if (coverFile) form.set('cover', coverFile)
      for (const [key, value] of Object.entries(details))
        form.set(key, value.trim())
      if (password.trim()) form.set('password', password)
      if (file) form.set('avatar', file)
      return updateProfile(form)
    },
    onSuccess: (updated) => {
      client.setQueryData(['profile'], updated)
      void client.invalidateQueries({ queryKey: ['feed'] })
      void client.invalidateQueries({ queryKey: ['comments'] })
      void client.invalidateQueries({ queryKey: ['replies'] })
      void client.invalidateQueries({ queryKey: ['public-profile'] })
      setName(updated.name)
      setEmail(updated.email)
      setUsername(updated.username)
      setDetails({
        headline: updated.headline ?? '',
        bio: updated.bio ?? '',
        location: updated.location ?? '',
        portfolioUrl: updated.portfolioUrl ?? '',
        linkedinUrl: updated.linkedinUrl ?? '',
      })
      setPassword('')
      setShowPassword(false)
      setFile(null)
      setCoverFile(null)
      setRemoveCover(false)
      setCoverError(null)
      setRemoveAvatar(false)
      if (fileInput.current) fileInput.current.value = ''
    },
  })

  return (
    <main className="min-w-0">
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold tracking-[.14em] text-[#1769d5] uppercase">
          Do seu jeito
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Meu perfil</h1>
        <p className="mt-2 text-sm text-[#71819a]">
          Atualize suas informações e mostre quem está por trás do @.
        </p>
      </div>
      <section className="oj-card mb-6 overflow-hidden">
        <ProfileCover url={profile.coverUrl} className="h-40 sm:h-52" />
        <div className="px-6 pb-5 sm:px-8">
          <Avatar
            name={profile.name}
            url={profile.avatarUrl}
            className="relative z-10 -mt-10 size-20 text-2xl ring-4"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold">{profile.name}</h2>
              <p className="mt-1 text-sm text-[#71819a]">@{profile.username}</p>
            </div>
            <span className="rounded-full bg-[#edf5ff] px-3 py-1 text-xs font-semibold text-[#1769d5]">
              {profile.role}
            </span>
          </div>
        </div>
        <div
          className="flex gap-5 overflow-x-auto border-t border-[#e5ebf3] px-6 sm:px-8"
          aria-label="Seções do perfil"
        >
          <button
            type="button"
            aria-pressed={tab === 'posts'}
            onClick={() => void navigate({ search: {} })}
            className={`shrink-0 cursor-pointer border-b-2 py-4 text-sm font-semibold ${tab === 'posts' ? 'border-[#1769d5] text-[#1769d5]' : 'border-transparent text-[#71819a]'}`}
          >
            Publicações
          </button>
          <button
            type="button"
            aria-pressed={tab === 'information'}
            onClick={() => void navigate({ search: { section: 'editar' } })}
            className={`shrink-0 cursor-pointer border-b-2 py-4 text-sm font-semibold ${tab === 'information' ? 'border-[#1769d5] text-[#1769d5]' : 'border-transparent text-[#71819a]'}`}
          >
            Editar perfil
          </button>
          <button
            type="button"
            aria-pressed={tab === 'public'}
            onClick={() => void navigate({ search: { section: 'publico' } })}
            className={`shrink-0 cursor-pointer border-b-2 py-4 text-sm font-semibold ${tab === 'public' ? 'border-[#1769d5] text-[#1769d5]' : 'border-transparent text-[#71819a]'}`}
          >
            Seu perfil público
          </button>
          {capabilities.data?.canManage && (
            <button
              type="button"
              aria-pressed={tab === 'jobs'}
              onClick={() => void navigate({ search: { section: 'vagas' } })}
              className={`shrink-0 cursor-pointer border-b-2 py-4 text-sm font-semibold ${tab === 'jobs' ? 'border-[#1769d5] text-[#1769d5]' : 'border-transparent text-[#71819a]'}`}
            >
              Gerenciador de vagas
            </button>
          )}
          <Link
            to="/p/$username"
            params={{ username: profile.username }}
            className="ml-auto shrink-0 py-4 text-sm font-semibold text-[#1769d5] hover:underline"
          >
            Ver perfil público ↗
          </Link>
        </div>
      </section>
      {tab === 'jobs' &&
        (capabilities.isPending ? (
          <p className="text-sm text-[#71819a]">Carregando...</p>
        ) : capabilities.isError ? (
          <div className="oj-card p-6">
            <p role="alert">{capabilities.error.message}</p>
            <button
              className="oj-button mt-4"
              onClick={() => void capabilities.refetch()}
            >
              Tentar novamente
            </button>
          </div>
        ) : capabilities.data.canManage ? (
          <JobManager
            userId={profile.id}
            canPublish={capabilities.data.canPublish}
            canEdit={capabilities.data.canEdit}
          />
        ) : (
          <p className="oj-card p-6">
            Sua conta não tem permissão para gerenciar vagas.
          </p>
        ))}
      {tab === 'posts' && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <Feed profile={profile} scope="profile" />
          <aside className="rounded-xl border border-[#dce9fb] bg-[#edf5ff] p-5">
            <h3 className="text-sm font-semibold">Sua voz na comunidade</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#61738c]">
              Compartilhe experiências, ideias e oportunidades. Suas publicações
              também aparecem no feed da comunidade.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[#61738c]">
              Use as opções de cada publicação para editar o texto, trocar a
              foto ou excluir.
            </p>
          </aside>
        </div>
      )}
      {(tab === 'information' || tab === 'public') && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <form
            method="post"
            encType="multipart/form-data"
            className="oj-card overflow-hidden"
            onSubmit={(event) => {
              event.preventDefault()
              if (!fileError && !coverError) save.mutate()
            }}
          >
            {tab === 'information' && (
              <ProfileCoverField
                url={cover}
                disabled={save.isPending}
                onSelect={(selected) => {
                  if (!selected) return
                  setCoverError(null)
                  save.reset()
                  if (
                    !['image/jpeg', 'image/png', 'image/gif'].includes(
                      selected.type,
                    ) ||
                    selected.size > 5 * 1024 * 1024
                  ) {
                    setCoverError(
                      'Escolha uma capa JPG, PNG ou GIF de até 5 MB.',
                    )
                    return
                  }
                  setCoverFile(selected)
                  setRemoveCover(false)
                }}
                onRemove={() => {
                  setCoverFile(null)
                  setRemoveCover(true)
                  setCoverError(null)
                  save.reset()
                }}
              />
            )}
            {tab === 'information' && (
              <>
                <section className="border-b border-[#e5ebf3] p-6 sm:p-8">
                  <h2 className="text-base font-bold">Foto de perfil</h2>
                  <p className="mt-1 text-xs text-[#8392a8]">
                    Essa foto aparece na comunidade e no seu perfil.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-5">
                    <div className="relative">
                      <Avatar
                        name={name || profile.name}
                        url={photo}
                        className="size-24 text-3xl"
                      />
                      <span className="absolute right-0 bottom-0 grid size-8 place-items-center rounded-full border-2 border-white bg-[#1769d5] text-white">
                        <Camera className="size-4" />
                      </span>
                    </div>
                    <div>
                      <label
                        htmlFor="avatar-file"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#cbdcf3] bg-[#f7faff] px-4 py-2.5 text-xs font-semibold text-[#1769d5] hover:bg-[#edf5ff]"
                      >
                        <ImagePlus className="size-4" />
                        Escolher uma foto
                      </label>
                      <input
                        ref={fileInput}
                        id="avatar-file"
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        className="sr-only"
                        disabled={save.isPending}
                        onChange={(event) => {
                          const selected = event.target.files?.[0]
                          setFileError(null)
                          save.reset()
                          if (!selected) return
                          if (
                            !['image/jpeg', 'image/png', 'image/gif'].includes(
                              selected.type,
                            ) ||
                            selected.size > 5 * 1024 * 1024
                          ) {
                            setFileError(
                              'Escolha uma imagem JPG, PNG ou GIF de até 5 MB.',
                            )
                            event.target.value = ''
                            return
                          }
                          setFile(selected)
                          setRemoveAvatar(false)
                        }}
                      />
                      <p className="mt-2 text-[11px] text-[#8392a8]">
                        JPG, PNG ou GIF · até 5 MB
                      </p>
                      {photo && (
                        <button
                          className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs text-[#bd3845]"
                          type="button"
                          disabled={save.isPending}
                          onClick={() => {
                            setFile(null)
                            setRemoveAvatar(true)
                            setFileError(null)
                            save.reset()
                            if (fileInput.current) fileInput.current.value = ''
                          }}
                        >
                          <Trash2 className="size-3" />
                          Remover foto
                        </button>
                      )}
                    </div>
                  </div>
                </section>
                <section className="space-y-5 p-6 sm:p-8">
                  <div>
                    <h2 className="text-base font-bold">
                      Informações pessoais
                    </h2>
                    <p className="mt-1 text-xs text-[#8392a8]">
                      Mantenha seus dados de contato atualizados.
                    </p>
                  </div>
                  <div>
                    <label
                      className="mb-2 block text-sm font-semibold"
                      htmlFor="profile-name"
                    >
                      Nome completo
                    </label>
                    <div className="relative">
                      <UserRound className="absolute top-3.5 left-4 size-[18px] text-[#8392a8]" />
                      <input
                        id="profile-name"
                        name="name"
                        autoComplete="name"
                        className="oj-input !pl-11"
                        value={name}
                        onChange={(event) => {
                          setName(event.target.value)
                          save.reset()
                        }}
                        required
                        maxLength={255}
                        disabled={save.isPending}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className="mb-2 block text-sm font-semibold"
                      htmlFor="profile-username"
                    >
                      Seu @usuário
                    </label>
                    <div className="relative">
                      <AtSign className="absolute top-3.5 left-4 size-[18px] text-[#8392a8]" />
                      <input
                        id="profile-username"
                        name="username"
                        className="oj-input !pl-11"
                        value={username}
                        onChange={(event) => {
                          setUsername(
                            event.target.value.replace(/^@/, '').toLowerCase(),
                          )
                          save.reset()
                        }}
                        autoComplete="username"
                        autoCapitalize="none"
                        spellCheck={false}
                        required
                        minLength={3}
                        maxLength={30}
                        pattern="[a-zA-Z0-9._]{3,30}"
                        title="De 3 a 30 letras, números, ponto ou _"
                        disabled={save.isPending}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-[#8392a8]">
                      Seu identificador na comunidade. Use letras, números,
                      ponto ou _.
                    </p>
                  </div>
                  <div>
                    <label
                      className="mb-2 block text-sm font-semibold"
                      htmlFor="profile-email"
                    >
                      E-mail
                    </label>
                    <div className="relative">
                      <Mail className="absolute top-3.5 left-4 size-[18px] text-[#8392a8]" />
                      <input
                        id="profile-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className="oj-input !pl-11"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value)
                          save.reset()
                        }}
                        required
                        maxLength={255}
                        disabled={save.isPending}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-[#8392a8]">
                      Você usa esse e-mail para entrar na sua conta.
                    </p>
                  </div>
                  <div>
                    <label
                      className="mb-2 block text-sm font-semibold"
                      htmlFor="profile-password"
                    >
                      Nova senha{' '}
                      <span className="font-normal text-[#8392a8]">
                        (opcional)
                      </span>
                    </label>
                    <div className="relative">
                      <LockKeyhole className="absolute top-3.5 left-4 size-[18px] text-[#8392a8]" />
                      <input
                        id="profile-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        className="oj-input !pr-12 !pl-11"
                        placeholder="Digite uma nova senha"
                        value={password}
                        onChange={(event) => {
                          setPassword(event.target.value)
                          save.reset()
                        }}
                        minLength={6}
                        maxLength={72}
                        aria-describedby="profile-password-help"
                        disabled={save.isPending}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center rounded-r-lg text-[#8392a8] hover:text-[#1769d5]"
                        aria-label={
                          showPassword ? 'Ocultar senha' : 'Mostrar senha'
                        }
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={save.isPending}
                      >
                        {showPassword ? (
                          <EyeOff className="size-[18px]" />
                        ) : (
                          <Eye className="size-[18px]" />
                        )}
                      </button>
                    </div>
                    <p
                      id="profile-password-help"
                      className="mt-1.5 text-[11px] text-[#8392a8]"
                    >
                      Deixe este campo vazio para manter sua senha atual. Para
                      alterar, use de 6 a 72 caracteres.
                    </p>
                  </div>
                </section>
              </>
            )}
            {tab === 'public' && (
              <ProfileDetailsFields
                value={details}
                change={(value) => {
                  setDetails(value)
                  save.reset()
                }}
                disabled={save.isPending}
              />
            )}
            <footer className="flex flex-col items-end border-t border-[#e5ebf3] bg-[#fafbfd] p-6 sm:px-8">
              {(save.error || fileError || coverError) && (
                <p role="alert" className="mb-4 text-sm text-[#bd3845]">
                  {coverError ?? fileError ?? save.error?.message}
                </p>
              )}
              {save.isSuccess && (
                <p
                  role="status"
                  className="mb-4 flex items-center gap-2 text-sm text-[#18794e]"
                >
                  <CheckCircle2 className="size-4" />
                  Perfil atualizado com sucesso.
                </p>
              )}
              <button
                className="oj-button"
                disabled={save.isPending || !!fileError || !!coverError}
                type="submit"
              >
                {save.isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                {save.isPending ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </footer>
          </form>
          <aside className="space-y-4">
            <section className="oj-card overflow-hidden">
              <ProfileCover url={cover} className="h-32" />
              <div className="px-6 pb-6 text-center">
                <Avatar
                  name={name || profile.name}
                  url={photo}
                  className="relative z-10 -mt-12 size-24 text-3xl ring-4"
                />
                <h2 className="mt-4 break-words text-lg font-bold">
                  {name || 'Seu nome'}
                </h2>
                <p className="mt-1 text-sm text-[#71819a]">
                  @{username || 'seuusuario'}
                </p>
                <span className="mt-4 inline-flex rounded-full bg-[#edf5ff] px-3 py-1 text-xs font-semibold text-[#1769d5]">
                  {profile.role}
                </span>
                <p className="mt-5 border-t border-[#e5ebf3] pt-4 text-xs leading-relaxed text-[#8392a8]">
                  Prévia de como seu perfil aparece para a comunidade.
                </p>
              </div>
            </section>
            <div className="rounded-xl border border-[#dce9fb] bg-[#edf5ff] p-5">
              <ShieldCheck className="mb-3 size-6 text-[#1769d5]" />
              <h3 className="text-sm font-semibold">
                Suas informações, seu controle
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#61738c]">
                Seu e-mail é privado. Na comunidade, mostramos apenas seu nome,
                @usuário e foto.
              </p>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}
