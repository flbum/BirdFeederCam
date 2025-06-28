'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

export default function HomePage() {
  const supabase = createClientComponentClient()
  const [images, setImages] = useState<{ name: string; url: string }[]>([])
  const [selected, setSelected] = useState<{ name: string; url: string } | null>(null)

  useEffect(() => {
    const loadImages = async () => {
      const { data, error } = await supabase
        .storage
        .from('birdfeedercam')
        .list('images', { limit: 100, sortBy: { column: 'name', order: 'desc' } })

      if (error) {
        console.error('Home load error:', error)
        setImages([])
        return
      }

      const pics = data
        .filter(item => item.metadata !== null)
        .map(file => ({
          name: file.name,
          url: supabase
            .storage
            .from('birdfeedercam')
            .getPublicUrl(`images/${file.name}`).data.publicUrl || '',
        }))

      setImages(pics)
    }
    loadImages()
  }, [supabase])

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
      <h1 className="text-3xl font-bold mb-6">Latest Images</h1>

      {images.length > 0 ? (
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
      ) : (
        <p className="text-zinc-500 italic">No images found.</p>
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
            <img
              src={selected.url}
              alt={selected.name}
              className="-rotate-90 max-h-[80vh] mx-auto rounded"
            />
          </div>
        </div>
      )}
    </div>
  )
}
