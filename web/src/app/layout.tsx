import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Bird Feeder Cam',
  description: 'Watch backyard bird snapshots.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-900 text-white min-h-screen`}>
        {session && (
          <nav className="bg-zinc-800 px-4 py-3 flex gap-4 items-center">
            <Link href="/home" className="hover:text-brand-light">Home</Link>
            <Link href="/browse" className="hover:text-brand-light">Browse</Link>
            <Link href="/about" className="hover:text-brand-light">About</Link>
            <button
              onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
              className="ml-auto text-red-500 hover:text-red-400"
            >
              Sign Out
            </button>
          </nav>
        )}

        <main className="pt-4">{children}</main>
      </body>
    </html>
  );
}
