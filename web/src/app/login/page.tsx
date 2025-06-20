'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) setError(error.message);
    else router.push('/home');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
      <div className="w-full max-w-sm bg-zinc-800 p-6 rounded-lg shadow-lg text-white text-center">
        <img src="/cardinal.png" alt="Logo" className="mx-auto mb-6 w-16 h-16" />
        <h1 className="text-2xl font-bold mb-4">Welcome Back</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 rounded bg-zinc-700 mb-4 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded transition"
        >
          Continue
        </button>
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  );
}
