// web/src/app/browse/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Item = {
  name: string;
  id: string;
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
        console.error(error);
      } else {
        setItems(data || []);
      }
    };
    load();
  }, [path]);

  const enterFolder = (folder: string) => {
    setHistory([...history, path]);
    setPath(`${path}/${folder}`);
  };

  const goBack = () => {
    const prev = history.pop();
    if (prev) {
      setPath(prev);
      setHistory([...history]);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">📂 Browse Feed</h1>

      {history.length > 0 && (
        <button onClick={goBack} className="mb-4 text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">
          ← Back
        </button>
      )}

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            {item.name.endsWith('.jpg') ? (
              <img
                src={
                  supabase.storage
                    .from('birdfeedercam')
                    .getPublicUrl(`${path}/${item.name}`).data.publicUrl
                }
                alt={item.name}
                className="rounded w-64"
              />
            ) : (
              <button
                onClick={() => enterFolder(item.name)}
                className="text-blue-400 hover:underline"
              >
                📁 {item.name}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
