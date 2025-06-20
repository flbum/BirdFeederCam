'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function LoginPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [email, setEmail] = useState('');
  
  const handleSignUp = async () => await supabase.auth.signUp({ email, password: '' });
  const handleSignIn = async () => await supabase.auth.signInWithPassword({ email, password: '' });

  return (
    <div className="bg-zinc-800 p-8 rounded-lg shadow-lg max-w-sm mx-auto mt-16">
      <h1 className="text-2xl mb-4 text-center">Sign Up / Sign In</h1>
      <input type="email" placeholder="Email" className="w-full mb-3 p-2 rounded" onChange={e => setEmail(e.target.value)} />
      {/* Add password input if desired */}
      <button onClick={handleSignUp} className="w-full bg-brand-light mb-2 py-2 rounded-lg">Sign Up</button>
      <button onClick={handleSignIn} className="w-full bg-brand-dark py-2 rounded-lg">Sign In</button>
      <p className="mt-4 text-center">Or <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })} className="text-blue-400">Login with GitHub</button></p>
    </div>
  );
}
