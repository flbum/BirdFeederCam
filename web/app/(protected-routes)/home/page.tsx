'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

export default function HomePage() {
  const supabase = createClientComponentClient()
  const [images, setImages] = useState<{ name: string; url: string }[]>([])
  const [selected, setSelected] = useState<{ name: string; url: string } | null>(null)
  const [loading, setLoading] = useState(false)

  // Load 100 most recent images on mount
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true)
      // List images in "images" folder, sorted descending by name (newest first)
      const { data, error } = await supabase.storage
        .from('birdfeedercam')
        .list('images', { limit: 100, sortBy: { column: 'name', order: 'desc' } })

      if (error) {
        console.error('Error loading images:', error)
        setImages([])
        setLoading(false)
        return
      }

      const pics = data
        .filter(item => item.metadata !== null) // only files, not folders
        .map(file => ({
          name: file.name,
          url: supabase.storage.from('birdfeedercam').getPublicUrl(`images/${file.name}`).data.publicUrl,
        }))

      setImages(pics)
      setLoading(false)
    }

    loadImages()
  }, [supabase])

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gradient-to-b from-black via-zinc-900 to-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Latest Images</h1>

      {loading && <p className="text-center text-zinc-400">Loading images...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <button
            key={img.name}
            onClick={() => setSelected(img)}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-zinc-900 rounded-lg p-4 shadow-lg max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <h2 className="mb-4 text-white text-center font-semibold select-text max-w-[80vw] overflow-hidden whitespace-nowrap overflow-ellipsis">
              {selected.name.replace('.jpg', '').replace(/_/g, ' ')}
            </h2>

            <div
              className="relative"
              style={{
                width: '80vw',
                height: '80vh',
                maxWidth: '600px',
                maxHeight: '800px',
              }}
            >
              <Image
                src={selected.url}
                alt={selected.name}
                fill
                className="rounded object-contain"
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center center',
                }}
                sizes="(max-width: 640px) 80vw, 600px"
                priority
              />
            </div>

            <button
              className="absolute top-2 right-2 text-white text-4xl font-bold leading-none focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
              onClick={() => setSelected(null)}
              aria-label="Close modal"
              type="button"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
