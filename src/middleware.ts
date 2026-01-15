import { updateSession } from '@/lib/supabase/middleware';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
      Esegui middleware su tutte le pagine tranne asset statici.
    */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};