import './globals.css'
import { Metadata } from 'next'
import { Orbitron } from 'next/font/google'

const orbitron = Orbitron({ subsets: ['latin'], weight: ['500', '700'] })

export const metadata: Metadata = {
  title: "Em and M's Bird Feeder",
  description: 'Watch birds visiting the feeder in real time',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={orbitron.className}>{children}</body>
    </html>
  )
}
