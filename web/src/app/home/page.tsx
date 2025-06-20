import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: folders } = await supabase.storage.from('birdfeedercam').list('', {
    limit: 1,
    sortBy: { column: 'name', order: 'desc' },
  });

  const latest = folders?.[0]?.name;
  const { data: files } = await supabase.storage.from('birdfeedercam').list(latest, { limit: 100 });

  const urls = files?.map((f) =>
    supabase.storage
      .from('birdfeedercam')
      .getPublicUrl(`${latest}/${f.name}`).data.publicUrl
  ) || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">📸 {latest}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {urls.map((u) => (
          <img key={u} src={u} alt="" className="rounded shadow card" />
        ))}
      </div>
    </div>
  );
}
