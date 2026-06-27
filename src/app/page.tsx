import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { HomeClient } from './HomeClient';
import { Dork } from '@/lib/mock-data';

export const dynamic = "force-dynamic";


// Create a static, cookie-free Supabase client for caching public data
const supabaseStatic = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cache the public data for 30 seconds to prevent database overloading and enable instantaneous page loads
const getCachedData = unstable_cache(
  async () => {
    const [dorksRes, platformsRes, categoriesRes] = await Promise.all([
      supabaseStatic
        .from('dorks')
        .select('*, profiles(username), categories(name)')
        .eq('status', 'approved'),
      supabaseStatic.from('platforms').select('*').eq('is_active', true),
      supabaseStatic.from('categories').select('name, description, icon, platform')
    ]);

    const mappedDorks: Dork[] = (dorksRes.data || []).map((d: any) => ({
      id: d.id,
      query: d.query,
      description: d.description,
      category: d.categories?.name || "Sensitive Files",
      platform: d.platform || "google",
      successRate: d.success_rate || 0,
      author: d.profiles?.username || "Unknown",
      created_at: d.created_at
    }));

    return {
      dorks: mappedDorks,
      platforms: (platformsRes.data || []) as any[],
      categories: (categoriesRes.data || []) as any[]
    };
  },
  ['dorkhub-homepage-data'],
  { revalidate: 30, tags: ['homepage-data'] }
);

export default async function Page() {
  // Fetch cached public data from the database/cache on the server
  const { dorks, platforms, categories } = await getCachedData();

  // Get current user session (requires cookies, so this part is dynamic)
  let user = null;
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      user = {
        id: supabaseUser.id,
        email: supabaseUser.email
      };
    }
  } catch (error) {
    console.error('Failed to get user session on server:', error);
  }

  return (
    <HomeClient
      initialDorks={dorks}
      initialPlatforms={platforms}
      initialCategories={categories}
      initialUser={user}
    />
  );
}