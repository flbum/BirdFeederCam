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

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">📂 Browse Feed</h1>
      {/* Your existing browse UI here */}
    </div>
  );
}
