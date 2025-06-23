'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/home')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-sm bg-black border border-gray-700 rounded-lg p-6 flex flex-col items-center space-y-6 shadow-lg">
        <img
          src="/cardinal.png"
          alt="Cardinal Logo"
          style={{ width: '2in', height: 'auto' }}
          className="mt-2"
        />

        <h1 className="text-2xl font-semibold text-center">Sign in</h1>
        <p className="text-sm text-center text-gray-300">
          Don&apos;t have an account? <a href="/signup" className="underline">Sign up</a>
        </p>

        <form onSubmit={handleSignIn} className="w-full flex flex-col gap-4">
          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm mb-1 text-center">Email</label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full px-3 py-2 bg-black border border-gray-500 rounded text-white placeholder-gray-500 text-center"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password" className="text-sm mb-1 text-center">Password</label>
            <input
              id="password"
              type="password"
              required
              placeholder="Your password"
              className="w-full px-3 py-2 bg-black border border-gray-500 rounded text-white placeholder-gray-500 text-center"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <div className="text-sm text-right mt-1">
              <a href="/reset" className="underline text-gray-400">Forgot Password?</a>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-white text-black py-2 rounded hover:bg-gray-300 transition"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
