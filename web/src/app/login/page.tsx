'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email for the login link!');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl text-white font-semibold mb-6 text-center">Sign in to Bird Feeder Cam</h1>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full px-4 py-3 mb-4 rounded bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-light"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading || !email}
          className="w-full py-3 bg-gradient-to-r from-brand-light to-brand-dark rounded-lg text-white font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Sending magic link...' : 'Send Magic Link'}
        </button>

        {message && <p className="text-green-400 mt-4 text-center">{message}</p>}
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
}
