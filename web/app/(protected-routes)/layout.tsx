// app/(protected)/layout.tsx
'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import Image from 'next/image'

import { ReactNode } from 'react';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login')
      else setLoading(false)
    })
  }, [supabase, router])

  if (loading) return <div className="p-6">Loading…</div>

  return (
    <>
      <nav className="w-full bg-zinc-900 py-4 mb-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6">
          <Link href="/browse">
            <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 px-4 rounded-xl shadow-lg">
              Browse
            </button>
          </Link>
          <Link href="/home">
            <Image src="/cardinal.png" alt="Logo" width={55} height={55} />
          </Link>
          <Link href="/about">
            <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-xl shadow-lg">
              About
            </button>
          </Link>
        </div>
      </nav>
      <main>{children}</main>
    </>
  )
}
