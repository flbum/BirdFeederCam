'use client'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/home` },
    })
    if (error) setError(error.message)
    else router.push('/login')
  }

  return (
    <form onSubmit={handleSignUp} className="…">
      {/* Email + Password fields */}
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">Sign Up</button>
    </form>
  )
}
