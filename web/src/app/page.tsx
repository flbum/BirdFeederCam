// app/page.tsx
'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="flex items-center justify-center h-screen bg-black">
      <button
        onClick={() => router.push('/login')}
        className="focus:outline-none"
      >
        <Image
          src="/cardinal.png"
          alt="Cardinal Logo"
          width={288} // 3 inches at 96dpi = 288px
          height={288}
          priority
        />
      </button>
    </main>
  )
}
