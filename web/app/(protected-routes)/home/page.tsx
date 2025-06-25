'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function HomePage() {
  const supabase = createClientComponentClient()
  const [urls, setUrls] = useState<string[]>([])

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .storage
        .from('birdfeedercam')
        .list('images', {
          limit: 100,
          sortBy: { column: 'name', order: 'desc' },
        })

      if (data) {
        const all = data
          .filter(item => item.metadata !== null)
          .map(item =>
            supabase
              .storage
              .from('birdfeedercam')
              .getPublicUrl(`images/${item.name}`).data.publicUrl
          )
        setUrls(all)
      }
    }
    fetch()
  }, [supabase])

  return (
    <main className="max-w-6xl mx-auto p-6 bg-gradient-to-b from-black via-zinc-900 to-black text-white">
      <h1 className="text-2xl mb-6">🐦 Latest Feeder Visitors</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {urls.map((url, idx) => (
          <Image
            key={idx}
            src={url!}
            alt={`Bird ${idx + 1}`}
            width={400}
            height={300}
            className="rounded shadow border object-cover"
          />
        ))}
      </div>
    </main>
  )
}
