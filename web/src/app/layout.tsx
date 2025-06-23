// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import NavBar from '@/components/navbar';
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
        {session && <NavBar />}
        <main className="pt-4">{children}</main>
      </body>
    </html>
  );
}
