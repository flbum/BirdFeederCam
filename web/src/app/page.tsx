// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ImageInfo = { name: string };

export default function Page() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    if (user) loadImages();
  }, [user]);

  const loadImages = async () => {
    const { data, error } = await supabase.storage
      .from('birdfeedercam')
      .list('images', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });
    if (error || !data) return;

    const urls = await Promise.all(data.map(async (file: ImageInfo) => {
      const { data: { publicUrl } } = supabase
        .storage.from('birdfeedercam')
        .getPublicUrl(`images/${file.name}`);
      return publicUrl;
    }));
    setImageUrls(urls);
  };

  const signIn = () => supabase.auth.signInWithPassword({ email: '', password: '' });
  const signOut = () => supabase.auth.signOut();

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Bird Feeder Pictures</h1>
        {user
          ? <button onClick={signOut} className="px-5 py-2 bg-gradient-to-r from-brand-light to-brand-dark rounded-lg text-white shadow-md hover:opacity-90 transition">Logout</button>
          : <button onClick={signIn} className="px-5 py-2 bg-gradient-to-r from-brand-light to-brand-dark rounded-lg text-white shadow-md hover:opacity-90 transition">Sign In</button>}
      </header>

      {!user
        ? <section className="bg-zinc-800 rounded-lg p-6 shadow-lg text-center"><p className="text-lg mb-4">Please log in to view images</p></section>
        : <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {imageUrls.map((url,i) => (
              <div key={i} className="bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
                <img src={url} alt="" className="w-full h-64 object-cover"/>
              </div>
            ))}
          </section>
      }
    </main>
  );
}
