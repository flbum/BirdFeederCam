'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const router = useRouter()
  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <button
        onClick={() => router.push('/login')}
        className="flex flex-col items-center space-y-4 p-8 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl hover:scale-105 shadow-lg"
      >
        <Image src="/cardinal.png" alt="Logo" width={80} height={80} />
        <span className="text-2xl font-bold text-white">Enter Em and M&apos;s Bird Feeder</span>
      </button>
    </main>
  )
}
