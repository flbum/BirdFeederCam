// app/layout.tsx
import './globals.css'
import { Metadata } from 'next'
import { Orbitron } from 'next/font/google'
import Link from 'next/link'
import Image from 'next/image'

const orbitron = Orbitron({ subsets: ['latin'], weight: ['500', '700'] })

export const metadata: Metadata = {
  title: "Em and M's Bird Feeder",
  description: 'See birds visiting the feeder in real time',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={orbitron.className}>
        <nav className="w-full bg-zinc-900 py-4 mb-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-6">
            <Link href="/browse">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 px-4 rounded-xl font-semibold shadow-lg">
                Browse
              </button>
            </Link>
            <Link href="/">
              <Image src="/cardinal.png" alt="Logo" width={55} height={55} />
            </Link>
            <Link href="/about">
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-xl font-semibold shadow-lg">
                About
              </button>
            </Link>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
