'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Item = {
  name: string;
  id: string;
  metadata: Record<string, unknown>;
};

export default function BrowsePage() {
  const [path, setPath] = useState<string>('images');
  const [items, setItems] = useState<Item[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.storage
        .from('birdfeedercam')
        .list(path, { limit: 100, sortBy: { column: 'name', order: 'asc' } });

      if (error) {
        console.error('Supabase list error:', error);
        setItems([]);
      } else {
        setItems(data || []);
      }
    };

    load();
  }, [path]);

  const enterFolder = (folder: string) => {
    setHistory((h) => [...h, path]);
    setPath(`${path}/${folder}`);
  };

  const goBack = () => {
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    if (prev) setPath(prev);
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">📂 Browse Feed</h1>

      {history.length > 0 && (
        <button
          onClick={goBack}
          className="mb-4 text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
        >
          ← Back
        </button>
      )}

      <ul className="space-y-2">
        {items.map((item) =>
          item.name.endsWith('.jpg') ? (
            <li key={item.id}>
              <Image
                src={`https://${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(
                  'https://',
                  ''
                )}/storage/v1/object/public/birdfeedercam/${path}/${item.name}`}
                alt={item.name}
                width={320}
                height={240}
                className="rounded"
              />
            </li>
          ) : (
            <li key={item.id}>
              <button
                onClick={() => enterFolder(item.name)}
                className="text-blue-400 hover:underline"
              >
                📁 {item.name}
              </button>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
