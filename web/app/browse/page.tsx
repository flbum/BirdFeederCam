// app/browse/page.tsx
import { Suspense } from 'react'
import BrowseClient from './BrowseClient'

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="p-6 text-zinc-400">Loading folder contents…</div>}>
      <BrowseClient />
    </Suspense>
  )
}
