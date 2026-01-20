// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const redirectTo = url.searchParams.get('redirectTo') ?? '/';

  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(origin + redirectTo);
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error', {
      message: error.message,
      code: (error as any).code,
      details: (error as any).details,
    });
    return NextResponse.redirect(origin + '/login');
  }

  return NextResponse.redirect(origin + redirectTo);
}
