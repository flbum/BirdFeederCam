'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      alert('Check your email to confirm your account.')
      router.push('/login')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-sm shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <Image src="/cardinal.png" width={50} height={50} alt="Logo" />
          <h1 className="text-2xl font-bold mt-2 text-white">Sign Up</h1>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
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
            className="w-full py-2 rounded bg-gradient-to-r from-pink-500 to-yellow-500 hover:opacity-90 font-bold text-white"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}
