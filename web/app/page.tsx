// app/page.tsx
import Link from 'next/link'
import Image from 'next/image'

export default function SplashPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black">
      <Image src="/cardinal.png" alt="Logo" width={150} height={150} />
      <h1 className="text-4xl font-bold mt-4 mb-8">Em and M’s Bird Feeder</h1>
      <div className="flex gap-4">
        <Link href="/login" className="btn">
          Login
        </Link>
        <Link href="/signup" className="btn">
          Sign up
        </Link>
      </div>
    </main>
  )
}
