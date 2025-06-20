import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function BrowsePage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Fetch image list from 'images' folder in Supabase bucket
  const { data: files, error } = await supabase.storage
    .from('birdfeedercam')
    .list('images', { limit: 100, sortBy: { column: 'name', order: 'asc' } });

  if (error) {
    console.error('Storage list error:', error.message);
  }

  // Generate public URLs for each image
  const imageUrls =
    files?.map((file) =>
      supabase.storage.from('birdfeedercam').getPublicUrl(`images/${file.name}`).data.publicUrl
    ) || [];

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">📂 Browse Feed</h1>

      {imageUrls.length === 0 && <p>No images found.</p>}

      <div className="grid grid-cols-3 gap-4">
        {imageUrls.map((url) => (
          <img key={url} src={url} alt="Bird feeder" className="rounded shadow" />
        ))}
      </div>
    </div>
  );
}
