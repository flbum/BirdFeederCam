'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  return (
    <div className="flex justify-center items-center h-screen">
      <button onClick={() => router.push('/login')}>
        <Image src="/cardinal.png" alt="Logo" width={300} height={300} />
      </button>
    </div>
  );
}
