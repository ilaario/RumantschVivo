// src/lib/supabase/server.ts (o come l'hai chiamato tu)
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createSupabaseServerClient() {
  // in Next 16 cookies() è ASYNC -> Promise<ReadonlyRequestCookies>
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // o ...PUBLISHABLE_KEY se l'hai rinominata
    {
      cookies: {
        // pattern NUOVO: solo getAll / setAll
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // lato server component: aggiorna i cookie
              cookieStore.set(name, value, options);
            });
          } catch {
            // chiamato in un contesto dove non si possono settare cookie (es. RSC):
            // Supabase dice esplicitamente di ignorare l'errore
          }
        },
      },
    },
  );

  return supabase;
}

export { createSupabaseServerClient as createClient };
