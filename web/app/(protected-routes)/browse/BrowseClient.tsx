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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

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
            .getPublicUrl(`${path}/${file.name}`).data.publicUrl,
        }))

      setFolders(f)
      setImages(pics)
    }
    load()
  }, [path, supabase])
  
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (selectedIndex === null) return

        if (e.key === 'ArrowLeft' && selectedIndex > 0) {
          setSelectedIndex(selectedIndex - 1)
        } else if (e.key === 'ArrowRight' && selectedIndex < images.length - 1) {
          setSelectedIndex(selectedIndex + 1)
        } else if (e.key === 'Escape') {
          setSelectedIndex(null)
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedIndex, images.length])

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

  const selected = selectedIndex !== null ? images[selectedIndex] : null

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gradient-to-b from-black via-zinc-900 to-black text-white min-h-screen">
      <nav className="text-zinc-400 text-sm mb-4 select-none">
        {path.split('/').map((segment, i, arr) => {
          const subPath = arr.slice(0, i + 1).join('/')
          return (
            <span key={subPath}>
              <button onClick={() => router.push(`/browse?path=${encodeURIComponent(subPath)}`)}
                className="hover:underline focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded px-1">
                {segment}
              </button>
              {i < arr.length - 1 && ' / '}
            </span>
          )
        })}
      </nav>

      {path !== 'images' && (
        <button onClick={goUp}
          className="mb-4 px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500">
          ← Up
        </button>
      )}

      {folders.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">
          {folders.map(f => (
            <button key={f} onClick={() => goTo(f)}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500">
              📁 {f}
            </button>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <>
          <h2 className="text-xl mb-3">Images</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <button
                key={img.name}
                onClick={() => setSelectedIndex(index)}
                className="rounded shadow border overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-500"
                aria-label={`View image ${img.name}`}
              >
                <Image
                  src={img.url}
                  alt={img.name}
                  width={300}
                  height={400}
                  className="object-cover rotate-[-90deg] transition-transform hover:scale-105"
                  style={{ display: 'block' }}
                />
              </button>
            ))}
          </div>
        </>
      )}

      {folders.length === 0 && images.length === 0 && (
        <p className="text-zinc-500 italic">No folders or images found here.</p>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selected.url}
              alt={selected.name}
              fill
              className="object-contain"
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: 'center center',
              }}
              priority
            />

            {selectedIndex !== null && selectedIndex > 0 && (
              <button
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white text-5xl font-bold px-2"
                onClick={() => setSelectedIndex(selectedIndex - 1)}
              >
                ‹
              </button>
            )}

            {selectedIndex !== null && selectedIndex < images.length - 1 && (
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-5xl font-bold px-2"
                onClick={() => setSelectedIndex(selectedIndex + 1)}
              >
                ›
              </button>
            )}

            <button
              className="absolute top-4 right-4 text-white text-4xl font-bold leading-none focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
              onClick={() => setSelectedIndex(null)}
              aria-label="Close modal"
              type="button"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
