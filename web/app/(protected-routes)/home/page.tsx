'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

export default function HomePage() {
  const supabase = createClientComponentClient()
  const [images, setImages] = useState<{ name: string; url: string; fullPath: string }[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // Recursive function to list all images
  async function listAllImages(folder: string): Promise<{ name: string; fullPath: string }[]> {
    let allFiles: { name: string; fullPath: string }[] = []
    const { data, error } = await supabase.storage.from('birdfeedercam').list(folder, {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    })

    if (error || !data) return allFiles

    const folders = data.filter(item => item.metadata === null)
    const files = data.filter(item => item.metadata !== null)
    files.forEach(f => allFiles.push({ name: f.name, fullPath: `${folder}/${f.name}` }))
    for (const f of folders) {
      const nested = await listAllImages(`${folder}/${f.name}`)
      allFiles = allFiles.concat(nested)
    }

    return allFiles
  }

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true)
      const allFiles = await listAllImages('images')
      allFiles.sort((a, b) => (a.fullPath < b.fullPath ? -1 : 1))
      const latest = allFiles.slice(0, 100)
      const pics = latest.map(file => ({
        name: file.name,
        fullPath: file.fullPath,
        url: supabase.storage.from('birdfeedercam').getPublicUrl(file.fullPath).data.publicUrl,
      }))
      setImages(pics)
      setLoading(false)
    }

    loadImages()
  }, [supabase])

  // Swipe & keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedIndex === null) return
    if (e.key === 'Escape') setSelectedIndex(null)
    else if (e.key === 'ArrowLeft') setSelectedIndex(i => (i !== null && i > 0 ? i - 1 : i))
    else if (e.key === 'ArrowRight') setSelectedIndex(i => (i !== null && i < images.length - 1 ? i + 1 : i))
  }, [selectedIndex, images.length])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

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
            className="relative bg-zinc-900 rounded-lg p-4 shadow-lg w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col items-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-white text-center font-semibold select-text max-w-[90vw] overflow-hidden whitespace-nowrap overflow-ellipsis">
              {selected.name.replace('.jpg', '').replace(/_/g, ' ')}
            </h2>

            <div className="relative flex-grow w-full h-full">
              <Image
                src={selected.url}
                alt={selected.name}
                fill
                className="rounded object-contain"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center center' }}
                sizes="(max-width: 768px) 100vw, 90vw"
                priority
              />
            </div>

            {/* Nav buttons */}
            <button
              className="absolute top-2 right-2 text-white text-4xl font-bold leading-none focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
              onClick={() => setSelectedIndex(null)}
              aria-label="Close modal"
              type="button"
            >
              &times;
            </button>

            {selectedIndex > 0 && (
              <button
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white text-5xl font-bold px-2"
                onClick={() => setSelectedIndex(selectedIndex - 1)}
              >
                ‹
              </button>
            )}
            {selectedIndex < images.length - 1 && (
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-5xl font-bold px-2"
                onClick={() => setSelectedIndex(selectedIndex + 1)}
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
