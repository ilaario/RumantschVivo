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

  // 1) Scambiamo il code per la sessione
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error', {
      message: error.message,
      code: (error as any).code,
      details: (error as any).details,
    });
    return NextResponse.redirect(origin + '/login');
  }

  // 2) Recuperiamo l'utente appena loggato
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error('[auth/callback] getUser error', {
      message: userError.message,
      code: (userError as any).code,
      details: (userError as any).details,
    });
  }

  // 3) Se c'è un utente, proviamo a copiare il nome nel profilo
  if (user) {
    const displayName =
      (user.user_metadata as any)?.full_name ||
      (user.user_metadata as any)?.name ||
      null;

    if (displayName) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user.id)
        // NON sovrascrivere se l'utente l'ha già cambiato
        .is('display_name', null);

      if (profileError) {
        console.error('[auth/callback] update profile display_name error', {
          message: profileError.message,
          code: (profileError as any).code,
          details: (profileError as any).details,
        });
      }
    }
  }

  // 4) Redirect finale dove avevamo promesso
  return NextResponse.redirect(origin + redirectTo);
}