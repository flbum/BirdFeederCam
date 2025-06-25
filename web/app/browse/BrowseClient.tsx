'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function BrowseClient() {
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPath = searchParams.get('path') || 'images';

  const [folders, setFolders] = useState<string[]>([]);
  const [images, setImages] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => {
    const loadFolderContents = async () => {
      const { data, error } = await supabase
        .storage
        .from('birdfeedercam')
        .list(currentPath, {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (!data || error) return;

      const foundFolders = data
        .filter(item => item.name && item.metadata === null)
        .map(f => f.name);

      const foundFiles = data
        .filter(item => item.name && item.metadata !== null)
        .map(file => ({
          name: file.name,
          url: supabase.storage
            .from('birdfeedercam')
            .getPublicUrl(`${currentPath}/${file.name}`).data.publicUrl,
        }));

      setFolders(foundFolders);
      setImages(foundFiles);
    };

    loadFolderContents();
  }, [currentPath, supabase]);

  const navigateTo = (subfolder: string) => {
    const newPath = `${currentPath}/${subfolder}`;
    router.push(`/browse?path=${encodeURIComponent(newPath)}`);
  };

  const navigateUp = () => {
    const parts = currentPath.split('/');
    if (parts.length > 1) {
      const newPath = parts.slice(0, -1).join('/');
      router.push(`/browse?path=${encodeURIComponent(newPath)}`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        📁 Browse: <span className="text-orange-400">{currentPath}</span>
      </h1>

      {currentPath !== 'images' && (
        <button
          onClick={navigateUp}
          className="mb-4 px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm"
        >
          ⬅️ Back
        </button>
      )}

      {folders.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">
          {folders.map(folder => (
            <button
              key={folder}
              onClick={() => navigateTo(folder)}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-sm"
            >
              📁 {folder}
            </button>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <>
          <h2 className="text-xl mb-3">🖼️ Images</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map(img => (
              <img
                key={img.name}
                src={img.url}
                alt={img.name}
                className="rounded shadow border"
              />
            ))}
          </div>
        </>
      )}

      {folders.length === 0 && images.length === 0 && (
        <p className="text-gray-400 text-sm italic">No folders or images found in this path.</p>
      )}
    </div>
  );
}
