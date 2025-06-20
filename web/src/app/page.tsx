// web/src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);


export default function Home() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.storage
        .from('birdfeedercam')
        .list('images', { limit: 100 });

      if (data) {
        const urls = await Promise.all(
          data.map(async (file) => {
            const { data: urlData } = await supabase.storage
              .from('birdfeedercam')
              .getPublicUrl(file.name);
            return urlData.publicUrl;
          })
        );
        setImages(urls);
      }
    };

    fetchImages();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold text-gray-800">Bird Feeder Cam</h1>
        {/* Auth buttons will go here */}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {images.map((url, i) => (
          <div key={i} className="bg-white rounded shadow p-2">
            <img src={url} alt={`Bird photo ${i}`} className="w-full h-auto rounded" />
          </div>
        ))}
      </div>
    </main>
  );
}