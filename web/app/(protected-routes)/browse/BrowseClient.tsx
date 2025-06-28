'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

export default function BrowseClient() {
  const supabase = createClientComponentClient()
  const searchParams = useSearchParams()
  const router = useRouter()
  const path = searchParams.get('path') || 'images'

  const [folders, setFolders] = useState<string[]>([])
  const [images, setImages] = useState<{ name: string; url: string }[]>([])
  const [selected, setSelected] = useState<{ name: string; url: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .storage
        .from('birdfeedercam')
        .list(path, { limit: 100, sortBy: { column: 'name', order: 'asc' } })

      if (error) {
        console.error('Browse load error:', error)
        setFolders([])
        setImages([])
        return
      }

      const f = data.filter(item => item.metadata === null).map(item => item.name)
      const pics = data
        .filter(item => item.metadata !== null)
        .map(file => ({
          name: file.name,
          url: supabase
            .storage
            .from('birdfeedercam')
            .getPublicUrl(`${path}/${file.name}`).data.publicUrl || '',
        }))

      setFolders(f)
      setImages(pics)
    }
    load()
  }, [path, supabase])

  const goTo = (sub: string) => {
    const newPath = `${path}/${sub}`
    router.push(`/browse?path=${encodeURIComponent(newPath)}`)
  }

  const goUp = () => {
    const parts = path.split('/')
    if (parts.length > 1) {
      const parent = parts.slice(0, -1).join('/')
      router.push(`/browse?path=${encodeURIComponent(parent)}`)
    }
  }

  function getTitleFromFilename(name: string): string {
    const match = name.match(/(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/)
    if (match) {
      const [, y, m, d, h, min, s] = match
      return `${y}-${m}-${d} ${h}:${min}:${s}`
    }
    return name
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gradient-to-b from-black via-zinc-900 to-black text-white min-h-screen">
      <nav className="text-zinc-400 text-sm mb-4">
        {path.split('/').map((segment, i, arr) => {
          const subPath = arr.slice(0, i + 1).join('/')
          return (
            <span key={subPath}>
              <button onClick={() => router.push(`/browse?path=${encodeURIComponent(subPath)}`)}
                className="hover:underline">
                {segment}
              </button>
              {i < arr.length - 1 && ' / '}
            </span>
          )
        })}
      </nav>

      {path !== 'images' && (
        <button onClick={goUp}
          className="mb-4 px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm">
          ← Up
        </button>
      )}

      {folders.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">
          {folders.map(f => (
            <button key={f} onClick={() => goTo(f)}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-sm">
              📁 {f}
            </button>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <>
          <h2 className="text-xl mb-3">Images</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map(img => (
              <div key={img.name} onClick={() => setSelected(img)} className="cursor-pointer">
                <Image
                  src={img.url}
                  alt={img.name}
                  width={400}
                  height={300}
                  className="-rotate-90 rounded shadow border object-cover transition hover:scale-105"
                />
              </div>
            ))}
          </div>
        </>
      )}

      {folders.length === 0 && images.length === 0 && (
        <p className="text-zinc-500 italic">No folders or images found here.</p>
      )}

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-zinc-900 rounded-lg shadow-xl p-4 max-w-screen-md w-full relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 text-white text-xl"
              aria-label="Close modal"
            >
              ✕
            </button>
            <h3 className="text-white text-center text-lg mb-4">
              {getTitleFromFilename(selected.name)}
            </h3>
            <Image
              src={selected.url}
              alt={selected.name}
              width={800}
              height={600}
              className="-rotate-90 max-h-[80vh] mx-auto rounded object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
