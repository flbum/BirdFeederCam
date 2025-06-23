'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function HomePage() {
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .storage
        .from('birdfeedercam')
        .list('images', {
          limit: 100,
          sortBy: { column: 'name', order: 'desc' },
        })

      if (error) {
        console.error('Error fetching images:', error)
        return
      }

      if (data) {
        const urls = data
          .filter(file => file.name.endsWith('.jpg') || file.name.endsWith('.png'))
          .map(file =>
            supabase.storage.from('birdfeedercam').getPublicUrl(`images/${file.name}`).data.publicUrl
          )
        setImages(urls)
      }
    }

    fetchImages()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white">
      <nav className="w-full max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <Link href="/browse">
          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 px-4 rounded-xl font-semibold shadow-lg">
            Browse
          </button>
        </Link>
        <Link href="/home">
          <Image src="/cardinal.png" alt="Logo" width={55} height={55} />
        </Link>
        <Link href="/about">
          <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-xl font-semibold shadow-lg">
            About
          </button>
        </Link>
      </nav>

      <section className="max-w-6xl mx-auto px-4 pb-10">
        <h2 className="text-3xl font-bold text-center mb-6">Latest Visitors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url, i) => (
            <div key={i} className="rounded-lg overflow-hidden shadow-lg bg-zinc-800">
              <img
                src={url}
                alt={`Bird ${i + 1}`}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
