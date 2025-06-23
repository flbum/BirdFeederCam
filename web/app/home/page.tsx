'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function HomePage() {
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    const fetchRecentImages = async () => {
      const today = new Date()
      const daysToLookBack = 7
      let allImageUrls: { path: string; url: string }[] = []

      for (let i = 0; i < daysToLookBack; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        const folderPath = `images/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`

        const { data: files, error } = await supabase.storage.from('birdfeedercam').list(folderPath)
        if (error) {
          console.warn(`Could not fetch from ${folderPath}:`, error.message)
          continue
        }

        if (files) {
          const urls = files
            .filter(file => file.name.endsWith('.jpg') || file.name.endsWith('.png'))
            .map(file => {
              const fullPath = `${folderPath}/${file.name}`
              const url = supabase.storage.from('birdfeedercam').getPublicUrl(fullPath).data.publicUrl
              return { path: fullPath, url }
            })
          allImageUrls = [...allImageUrls, ...urls]
        }
      }

      // Sort by path descending (newest dates/folder names/images last alphabetically)
      allImageUrls.sort((a, b) => b.path.localeCompare(a.path))
      const recent = allImageUrls.slice(0, 100).map(item => item.url)
      setImages(recent)
    }

    fetchRecentImages()
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
