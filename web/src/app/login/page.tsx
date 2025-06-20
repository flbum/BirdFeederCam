'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setError(error.message);
    else {
      setMessage('Magic link sent! Check your inbox.');
      setTimeout(() => router.push('/home'), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl mb-6">Magic Link Login</h1>
      <input
        type="email"
        value={email}
        placeholder="Your email"
        onChange={(e) => setEmail(e.target.value)}
        className="w-full max-w-sm p-3 mb-4 rounded bg-zinc-700"
      />
      <button
        onClick={handleLogin}
        className="btn-accent text-white px-6 py-2 rounded"
      >
        Send Link
      </button>
      {error && <p className="text-red-400 mt-4">{error}</p>}
      {message && <p className="text-green-400 mt-4">{message}</p>}
    </div>
  );
}
