'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password reset email sent. Please check your inbox.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-sm shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <Image src="/cardinal.png" width={50} height={50} alt="Logo" />
          <h1 className="text-2xl font-bold mt-2 text-white">Reset Password</h1>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 text-white"
            required
          />

          {message && <p className="text-green-500 text-sm text-center">{message}</p>}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 rounded bg-gradient-to-r from-cyan-500 to-green-500 hover:opacity-90 font-bold text-white"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </main>
  )
}
