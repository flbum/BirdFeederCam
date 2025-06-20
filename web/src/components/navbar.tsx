'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function NavBar() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="fixed top-0 w-full bg-zinc-800 py-4 shadow-lg z-50">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        <Link href="/home" className="text-xl font-bold text-white">
          🐦 BirdFeederCam
        </Link>
        <div className="space-x-4">
          <Link href="/home">Home</Link>
          <Link href="/browse">Browse</Link>
          <Link href="/about">About</Link>
          <button onClick={handleLogout} className="text-red-400 hover:underline">Logout</button>
        </div>
      </div>
    </nav>
  );
}
