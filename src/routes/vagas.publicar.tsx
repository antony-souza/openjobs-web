import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  LoaderCircle,
  Send,
} from 'lucide-react'
import { AppShell } from '../features/community/components/app-shell'
import { Avatar } from '../features/community/components/avatar'
import { useSession } from '../features/community/hooks/use-session'
import {
  getJobCapabilities,
  publishJob,
} from '../features/community/services/community-service'

export const Route = createFileRoute('/vagas/publicar')({
  component: PublishJobPage,
  head: () => ({ meta: [{ title: 'Publicar vaga | OpenJobs' }] }),
})

function PublishJobPage() {
  const session = useSession()
  const navigate = Route.useNavigate()
  const client = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const capabilities = useQuery({
    queryKey: ['job-capabilities', session.profile?.id],
    queryFn: getJobCapabilities,
    enabled: !!session.profile,
  })
  const publish = useMutation({
    mutationFn: publishJob,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['jobs'] }),
        client.invalidateQueries({ queryKey: ['latest-jobs'] }),
      ])
      void navigate({ to: '/vagas', search: { busca: '', publicada: true } })
    },
  })
  const allowed = capabilities.data?.canPublish
  return (
    <AppShell session={session}>
      {session.profile && (
        <div className="min-w-0">
          <Link
            to="/vagas"
            search={{ busca: '', publicada: false }}
            className="mb-6 inline-flex items-center gap-2 text-sm text-[#61738c] hover:text-[#1769d5]"
          >
            <ArrowLeft className="size-4" />
            Voltar às vagas
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            Publique uma oportunidade
          </h1>
          <p className="mt-2 mb-7 text-sm leading-6 text-[#71819a]">
            Conecte sua próxima vaga com as pessoas certas na comunidade.
          </p>
          {capabilities.isPending && (
            <p className="text-sm text-[#71819a]">Carregando...</p>
          )}
          {capabilities.isError && (
            <div className="oj-card p-6">
              <p role="alert" className="text-sm text-[#bd3845]">
                {capabilities.error.message}
              </p>
              <button
                className="oj-button mt-4"
                onClick={() => void capabilities.refetch()}
              >
                Tentar novamente
              </button>
            </div>
          )}
          {capabilities.isSuccess && !allowed && (
            <div className="oj-card p-7">
              <BriefcaseBusiness className="mb-4 size-8 text-[#1769d5]" />
              <h2 className="font-bold">
                Sua conta ainda não tem permissão para publicar vagas.
              </h2>
              <p className="mt-2 text-sm text-[#71819a]">
                Você pode explorar as oportunidades disponíveis e se candidatar.
              </p>
              <Link
                to="/vagas"
                search={{ busca: '', publicada: false }}
                className="oj-button mt-5"
              >
                Explorar vagas
              </Link>
            </div>
          )}
          {allowed && (
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
              <form
                className="oj-card overflow-hidden"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!publish.isPending && title.trim() && description.trim())
                    publish.mutate({
                      title: title.trim(),
                      description: description.trim(),
                    })
                }}
              >
                <div className="border-b border-[#e5ebf3] p-6">
                  <h2 className="font-bold">Informações da vaga</h2>
                  <p className="mt-1 text-xs text-[#71819a]">
                    Preencha os campos abaixo para publicar sua oportunidade.
                  </p>
                </div>
                <fieldset
                  disabled={publish.isPending}
                  className="space-y-6 p-6"
                >
                  <div>
                    <label
                      htmlFor="job-title"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Título da vaga <span className="text-[#71819a]">*</span>
                    </label>
                    <input
                      id="job-title"
                      className="oj-input"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      maxLength={255}
                      required
                      placeholder="Ex.: Desenvolvedor(a) Front-end Pleno"
                    />
                    <p className="mt-2 text-xs text-[#8392a8]">
                      Use um título claro, com o cargo e o nível da
                      oportunidade.
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="job-description"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Descrição da oportunidade{' '}
                      <span className="text-[#71819a]">*</span>
                    </label>
                    <textarea
                      id="job-description"
                      className="oj-input min-h-72 resize-y leading-6"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      maxLength={1000}
                      required
                      placeholder={
                        'Conte sobre a oportunidade.\n\n• Responsabilidades\n• Requisitos\n• Benefícios\n• Local e modelo de trabalho'
                      }
                      aria-describedby="job-description-help"
                    />
                    <div
                      id="job-description-help"
                      className="mt-2 flex justify-between gap-3 text-xs text-[#8392a8]"
                    >
                      <span>
                        Inclua as informações que ajudam a pessoa a decidir.
                      </span>
                      <span className="shrink-0">
                        {description.length}/1000
                      </span>
                    </div>
                  </div>
                </fieldset>
                {publish.error && (
                  <p
                    role="alert"
                    className="mx-6 mb-5 rounded-lg bg-red-50 p-3 text-sm text-[#bd3845]"
                  >
                    {publish.error.message}
                  </p>
                )}
                <div className="flex justify-end border-t border-[#e5ebf3] bg-[#fafbfe] p-6">
                  <button
                    type="submit"
                    className="oj-button"
                    disabled={
                      publish.isPending || !title.trim() || !description.trim()
                    }
                  >
                    {publish.isPending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    {publish.isPending ? 'Publicando...' : 'Publicar vaga'}
                  </button>
                </div>
              </form>
              <aside className="space-y-4">
                <section className="oj-card p-5">
                  <p className="mb-4 text-xs font-semibold tracking-wide text-[#8392a8]">
                    PRÉVIA DA PUBLICAÇÃO
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={session.profile.name}
                      url={session.profile.avatarUrl}
                      className="size-10 rounded-xl"
                    />
                    <p className="text-sm font-semibold">
                      {session.profile.name}
                    </p>
                  </div>
                  <h3 className="mt-5 break-words text-lg font-bold">
                    {title.trim() || 'Título da sua vaga'}
                  </h3>
                  <p className="mt-3 line-clamp-6 whitespace-pre-wrap break-words text-sm leading-6 text-[#61738c]">
                    {description.trim() ||
                      'A descrição da oportunidade aparecerá aqui.'}
                  </p>
                  <p className="mt-5 border-t border-[#edf0f6] pt-3 text-xs text-[#8392a8]">
                    Visível para a comunidade após publicar
                  </p>
                </section>
                <section className="rounded-xl border border-[#dce9fb] bg-[#edf5ff] p-5">
                  <h2 className="mb-3 text-sm font-bold">
                    Uma boa vaga faz a diferença
                  </h2>
                  {[
                    'Seja claro sobre as responsabilidades.',
                    'Destaque os requisitos essenciais.',
                    'Informe local, modalidade e benefícios.',
                  ].map((tip) => (
                    <p
                      key={tip}
                      className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#61738c]"
                    >
                      <Check className="mt-1 size-3.5 shrink-0 text-[#1769d5]" />
                      {tip}
                    </p>
                  ))}
                </section>
              </aside>
            </div>
          )}
        </div>
      )}
    </AppShell>
  )
}
