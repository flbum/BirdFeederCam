import './globals.css';

export const metadata = {
  title: 'Bird Feeder Cam',
  description: 'Watch nature, one frame at a time.',
};


import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });


import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-900 text-white`}>{children}</body>
    </html>
  );
}
