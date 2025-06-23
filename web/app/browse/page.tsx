'use client'
import Link from 'next/link'

export default function BrowsePage() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <nav className="max-w-6xl mx-auto mb-6">
        <Link href="/home" className="underline">← Back to Home</Link>
      </nav>
      <h1 className="text-3xl font-bold">Browse</h1>
      <p className="mt-2 text-zinc-400">File explorer for bird images coming soon.</p>
    </main>
  )
}
