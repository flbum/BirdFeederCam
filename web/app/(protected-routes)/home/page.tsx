'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function HomePage() {
  const supabase = createClientComponentClient()
  const [allUrls, setAllUrls] = useState<string[]>([])
  const [visibleUrls, setVisibleUrls] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const loaderRef = useRef(null)

  // Recursive function to fetch all images in nested folders
  const fetchAllImages = useCallback(async () => {
    const listFolders = async (path: string): Promise<string[]> => {
      const { data: items, error } = await supabase.storage
        .from('birdfeedercam')
        .list(path, { limit: 100, offset: 0 })
      if (error) {
        console.error(`Failed to list ${path}`, error)
        return []
      }

      const folders = items.filter(i => i.name && i.metadata === null)
      const files = items
        .filter(i => i.name && i.metadata !== null)
        .map(i => `${path}/${i.name}`)

      for (const folder of folders) {
        const nestedFiles = await listFolders(`${path}/${folder.name}`)
        files.push(...nestedFiles)
      }

      return files
    }

    const allPaths = await listFolders('images')
    const sortedPaths = allPaths
      .sort((a, b) => b.localeCompare(a)) // Reverse sort
      .map(p => supabase.storage.from('birdfeedercam').getPublicUrl(p).data.publicUrl)

    setAllUrls(sortedPaths)
    setVisibleUrls(sortedPaths.slice(0, 20))
  }, [supabase])

  // Load next batch when scrolling
  const loadMore = () => {
    const next = page + 1
    const nextBatch = allUrls.slice(0, next * 20)
    setVisibleUrls(nextBatch)
    setPage(next)
  }

  // Observer to detect scroll near bottom
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    }, {
      rootMargin: '100px',
    })

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current)
    }
  }, [loaderRef.current, loadMore])

  useEffect(() => {
    fetchAllImages()
  }, [fetchAllImages])

  return (
    <main className="max-w-6xl mx-auto p-6 bg-gradient-to-b from-black via-zinc-900 to-black text-white min-h-screen">
      <h1 className="text-2xl mb-6">🐦 Latest Feeder Visitors</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleUrls.map((url, idx) => (
          <Image
            key={idx}
            src={url}
            alt={`Bird ${idx + 1}`}
            width={400}
            height={300}
            loading="lazy"
            className="rounded shadow border object-cover"
          />
        ))}
      </div>
      <div ref={loaderRef} className="h-10 w-full" />
    </main>
  )
}
