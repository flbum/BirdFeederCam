'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

const supabase = createClientComponentClient()

// 🔁 Move this outside the component to avoid ESLint warning
async function listAllImages(folder: string): Promise<{ name: string; fullPath: string }[]> {
  let allFiles: { name: string; fullPath: string }[] = []

  const { data, error } = await supabase.storage.from('birdfeedercam').list(folder, {
    limit: 1000,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  })

  if (error || !data) {
    console.error('Error listing folder:', folder, error)
    return allFiles
  }

  const folders = data.filter((item) => item.metadata === null)
  const files = data.filter((item) => item.metadata !== null)

  files.forEach((f) => {
    allFiles.push({ name: f.name, fullPath: `${folder}/${f.name}` })
  })

  for (const f of folders) {
    const nestedFiles = await listAllImages(`${folder}/${f.name}`)
    allFiles = allFiles.concat(nestedFiles)
  }

  return allFiles
}

export default function HomePage() {
  const [images, setImages] = useState<{ name: string; url: string; fullPath: string }[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true)

      const allFiles = await listAllImages('images')
      allFiles.sort((a, b) => (a.fullPath < b.fullPath ? -1 : 1))
      const latest = allFiles.slice(0, 100)

      const pics = latest.map((file) => ({
        name: file.name,
        fullPath: file.fullPath,
        url: supabase.storage.from('birdfeedercam').getPublicUrl(file.fullPath).data.publicUrl,
      }))

      setImages(pics)
      setLoading(false)
    }

    loadImages()
  }, [])

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


  const selected = selectedIndex !== null ? images[selectedIndex] : null

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gradient-to-b from-black via-zinc-900 to-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Latest Images</h1>

      {loading && <p className="text-center text-zinc-400">Loading images...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <button
            key={img.fullPath}
            onClick={() => setSelectedIndex(index)}
            className="rounded shadow border overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label={`View image ${img.name}`}
          >
            <Image
              src={img.url!}
              alt={img.name}
              width={300}
              height={400}
              className="object-cover rotate-[-90deg] transition-transform hover:scale-105"
              loading="lazy"
              style={{ display: 'block' }}
            />
          </button>
        ))}
      </div>

      {images.length === 0 && !loading && (
        <p className="text-center text-zinc-500 italic mt-10">No images found.</p>
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
