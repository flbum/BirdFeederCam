// app/layout.tsx
import './globals.css'
import { Orbitron } from 'next/font/google'
const orbitron = Orbitron({ subsets: ['latin'], weight: ['500','700'] })

import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${orbitron.className} bg-black text-white`}>
        {children}
      </body>
    </html>
  )
}
