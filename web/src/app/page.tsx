import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getImages() {
  const { data, error } = await supabase.storage
  .from('birdfeedercam')
  .list('images', { limit: 100, sortBy: { column: 'name', order: 'desc' } });

  console.log('Supabase list data:', data);
  console.log('Supabase list error:', error);

  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
}

export default async function Home() {
  const images = await getImages();

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">🐦 Bird Feeder Cam Gallery</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.length === 0 && (
          <p className="col-span-full text-center text-gray-500">No images found.</p>
        )}
        {images
          .filter((img) => !!img.name)
          .map((img) => {
            const url = supabase.storage
              .from('birdfeedercam')
              .getPublicUrl(`images/${img.name}`).data.publicUrl;
            console.log('Image URL:', url);
            return (
              <img
                key={img.name}
                className="rounded shadow"
                src={url}
                alt={img.name}
              />
            );
          })}
      </div>
    </main>
  );
}