'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type ImageInfo = {
  name: string;
};

export default function Page() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const bucket = 'birdfeedercam';
  const folder = 'images';

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const loadImages = async () => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (error || !data) {
        console.error('Failed to list images:', error);
        return;
      }

      const urls = await Promise.all(
        data
          .filter((file: ImageInfo) =>
            file.name.match(/\.(jpg|jpeg|png)$/i)
          )
          .map(async (file: ImageInfo) => {
            const { data: urlData } = supabase.storage
              .from(bucket)
              .getPublicUrl(`${folder}/${file.name}`);
            return urlData.publicUrl;
          })
      );

      setImageUrls(urls);
    };

    loadImages();
  }, [user]);

  const signUp = async () => {
    setIsLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthError(error.message);
    }
    setIsLoading(false);
  };

  const signIn = async () => {
    setIsLoading(true);
    setAuthError('');
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
    } else {
      setUser(data.user);
    }
    setIsLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <main className="min-h-screen bg-zinc-900 text-white px-4 py-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🐦 Bird Feeder Cam</h1>
        {user && (
          <button
            onClick={signOut}
            className="bg-red-600 hover:bg-red-700 text-sm px-4 py-2 rounded"
          >
            Logout
          </button>
        )}
      </header>

      {!user ? (
        <div className="bg-zinc-800 p-6 rounded shadow max-w-sm mx-auto mt-10 text-center">
          <h2 className="text-xl font-semibold mb-4">Login or Sign Up</h2>
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-2 px-3 py-2 rounded bg-zinc-700 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 px-3 py-2 rounded bg-zinc-700 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-between gap-2">
            <button
              onClick={signIn}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded w-full"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <button
              onClick={signUp}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded w-full"
            >
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>
          {authError && <p className="text-red-400 mt-4">{authError}</p>}
        </div>
      ) : imageUrls.length === 0 ? (
        <p className="text-gray-400">No images found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="rounded overflow-hidden shadow bg-zinc-800">
              <img
                src={url}
                alt={`Bird Feeder ${index}`}
                className="w-full h-64 object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
