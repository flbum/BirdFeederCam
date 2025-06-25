'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '../../lib/supabase'

export default function HomePage() {
  const [urls, setUrls] = useState<string[]>([])

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .storage
        .from('birdfeedercam')
        .list('images', { limit: 100, sortBy: { column: 'name', order: 'desc' } })
      const arr: string[] = []
      if (data) {
        data.forEach(folder => {
          // nested folders not handled here – you may pull all recent as before
        })
      }
      setUrls(arr)
    }
    fetch()
  }, [])

  return (
    <section className="max-w-6xl mx-auto px-4 pb-10">
      {/* your current grid layout of Image tags */}
    </section>
  )
}
