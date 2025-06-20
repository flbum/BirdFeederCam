// src/app/layout.tsx
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = { title: 'Bird Feeder Cam' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-900 text-white min-h-screen flex flex-col`}>
        <header className="flex justify-between items-center px-6 py-4 bg-zinc-800 shadow-md">
          <Link href="/">
            <div className="flex items-center space-x-3">
              <img src="/cardinal.png" alt="Logo" className="h-10 w-10 rounded-full" />
              <span className="text-2xl font-bold">Bird Feeder Cam</span>
            </div>
          </Link>
          <nav className="flex space-x-4">
              {[
                { label: 'Home', href: '/' },
                { label: 'Browse', href: '/browse' },
                { label: 'About', href: '/about' },
                { label: 'Blog', href: '/blog' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="px-3 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm font-medium transition"
                >
                  {label}
                </Link>
              ))}
            </nav>

        </header>
        <main className="flex-grow p-6 max-w-4xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
