// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fn = isSigningUp ? 'signUp' : 'signInWithPassword';
    const { error } = await supabase.auth[fn]({ email, password });
    if (error) setError(error.message);
    else router.push('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-sm bg-black border border-gray-700 rounded-lg p-6 flex flex-col items-center space-y-6 shadow-lg">
        <img src="/cardinal.png" alt="Cardinal Logo" className="w-24 h-auto mt-2" />
        <h1 className="text-2xl font-semibold text-center">
          {isSigningUp ? 'Sign up' : 'Sign in'}
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="text-center px-3 py-2 bg-black border border-gray-500 rounded placeholder-gray-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="text-center px-3 py-2 bg-black border border-gray-500 rounded placeholder-gray-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" className="bg-white text-black py-2 rounded hover:bg-gray-300 transition">
            {isSigningUp ? 'Create Account' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-300">
          {isSigningUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSigningUp(!isSigningUp)}
            className="underline text-orange-400"
          >
            {isSigningUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
