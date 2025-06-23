'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-sm shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <Image src="/cardinal.png" width={50} height={50} alt="Logo" />
          <h1 className="text-2xl font-bold mt-2">Sign Up</h1>
        </div>
        <form className="space-y-4">
          <input type="text" placeholder="Username" className="w-full p-2 rounded bg-zinc-800 text-white" />
          <input type="email" placeholder="Email" className="w-full p-2 rounded bg-zinc-800 text-white" />
          <input type="password" placeholder="Password" className="w-full p-2 rounded bg-zinc-800 text-white" />
          <button className="w-full py-2 rounded bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 font-bold">
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}
