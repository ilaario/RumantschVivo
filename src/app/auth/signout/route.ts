import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // redirect alla home usando l'origin della request (funziona su Vercel e in locale)
  const url = new URL(request.url);
  url.pathname = '/';
  url.search = '';
  return NextResponse.redirect(url, { status: 303 });
}