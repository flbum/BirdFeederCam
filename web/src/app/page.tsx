'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center h-screen bg-zinc-900">
      <button onClick={() => router.push('/login')}>
        <Image src="/cardinal.png" alt="Logo" width={200} height={200} />
      </button>
    </div>
  );
}
