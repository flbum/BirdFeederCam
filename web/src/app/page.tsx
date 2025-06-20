'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
      <img
        src="/cardinal.png"
        alt="Bird Logo"
        className="w-40 h-40 hover:scale-110 transition-all cursor-pointer"
        onClick={() => router.push('/login')}
      />
    </div>
  );
}
