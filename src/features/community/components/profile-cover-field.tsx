import { ImagePlus, Trash2 } from 'lucide-react'
import { ProfileCover } from './profile-cover'

export function ProfileCoverField({
  url,
  disabled,
  onSelect,
  onRemove,
}: {
  url: string | null
  disabled: boolean
  onSelect: (file: File | null) => void
  onRemove: () => void
}) {
  return (
    <section className="space-y-4 border-b border-[#e5ebf3] p-6 sm:p-8">
      <div>
        <h2 className="text-base font-bold">Capa do perfil</h2>
        <p className="mt-1 text-xs text-[#8392a8]">
          Personalize seu perfil público com uma imagem de capa.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl">
        <ProfileCover url={url} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label
          className={`inline-flex items-center gap-2 rounded-lg border border-[#cbdcf3] bg-[#f7faff] px-4 py-2.5 text-xs font-semibold text-[#1769d5] ${disabled ? 'opacity-50' : 'cursor-pointer hover:bg-[#edf5ff]'}`}
        >
          <ImagePlus className="size-4" /> Escolher capa
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            className="sr-only"
            disabled={disabled}
            onChange={(event) => {
              onSelect(event.target.files?.[0] ?? null)
              event.target.value = ''
            }}
          />
        </label>
        {url && (
          <button
            type="button"
            disabled={disabled}
            className="inline-flex cursor-pointer items-center gap-1 text-xs text-[#bd3845]"
            onClick={onRemove}
          >
            <Trash2 className="size-3" /> Remover capa
          </button>
        )}
      </div>
      <p className="text-[11px] text-[#8392a8]">
        JPG, PNG ou GIF · até 5 MB. Prefira uma imagem horizontal (ex.: 1600 ×
        400 px).
      </p>
    </section>
  )
}
