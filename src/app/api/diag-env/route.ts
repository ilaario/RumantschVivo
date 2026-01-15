export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    // non stampiamo i valori, così non fai un disastro
  });
}