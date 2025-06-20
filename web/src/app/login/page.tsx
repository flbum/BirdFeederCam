'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push('/browse');
    }
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push('/browse');
    }
  };

  return (
    <div className="bg-zinc-800 p-8 rounded-lg shadow-lg max-w-sm mx-auto mt-16 text-white">
      <h1 className="text-2xl mb-4 text-center font-bold">Sign In / Sign Up</h1>

      <input
        type="email"
        placeholder="Email"
        className="w-full mb-3 p-2 rounded bg-zinc-700"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full mb-3 p-2 rounded bg-zinc-700"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSignIn}
        className="w-full bg-blue-600 hover:bg-blue-700 mb-2 py-2 rounded-lg"
      >
        Sign In
      </button>

      <button
        onClick={handleSignUp}
        className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg"
      >
        Sign Up
      </button>

      {error && <p className="mt-4 text-red-400 text-sm text-center">{error}</p>}
    </div>
  );
}
