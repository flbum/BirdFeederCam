import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function BrowsePage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: folders } = await supabase.storage.from('birdfeedercam').list('');

  const folderContent = await Promise.all(
    folders?.map(async (f) => {
      const { data: files } = await supabase.storage.from('birdfeedercam').list(f.name);
      return {
        folder: f.name,
        urls: files?.map((fi) =>
          supabase.storage
            .from('birdfeedercam')
            .getPublicUrl(`${f.name}/${fi.name}`).data.publicUrl
        ) || [],
      };
    }) || []
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">📂 Browse</h1>
      {folderContent.map(({ folder, urls }) => (
        <div key={folder} className="mb-6">
          <h2 className="font-semibold mb-2">{folder}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {urls.map((u) => (
              <img key={u} src={u} alt={folder} className="rounded shadow card" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
