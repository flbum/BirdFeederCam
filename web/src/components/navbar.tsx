// components/navbar.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function NavBar() {
  return (
    <nav className="bg-zinc-800 px-4 py-3 flex items-center shadow-md">
      <Image src="/cardinal.png" alt="Logo" width={48} height={48} className="mr-4" />
      <Link href="/home" className="mr-4 hover:text-orange-300">Home</Link>
      <Link href="/browse" className="mr-4 hover:text-orange-300">Browse</Link>
      <Link href="/about" className="mr-4 hover:text-orange-300">About</Link>
    </nav>
  );
}
