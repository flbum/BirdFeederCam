// src/app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'Bird Feeder Cam',
  description: 'Live bird feeder camera with Supabase storage',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* You can add custom <meta>, <link> here if needed */}
      </head>
      <body className="bg-gray-100 text-gray-900">
        {children}
      </body>
    </html>
  );
}
