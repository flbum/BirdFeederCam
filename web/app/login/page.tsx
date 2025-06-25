'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/home')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-sm shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <Image src="/cardinal.png" width={50} height={50} alt="Logo" />
          <h1 className="text-2xl font-bold mt-2 text-white">Login</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 text-white"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 text-white"
            required
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 rounded bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 font-bold text-white"
          >
            Log In
          </button>
          <p className="mt-2 text-sm text-center text-zinc-400">
            <Link href="/reset-password" className="text-blue-400 hover:underline">
             Forgot your password?
           </Link>
          </p>

        </form>

        <p className="mt-4 text-sm text-center text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-pink-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
