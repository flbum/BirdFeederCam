import './globals.css';

export const metadata = {
  title: 'Bird Feeder Cam',
  description: 'Watch nature, one frame at a time.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
