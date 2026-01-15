export const runtime = 'nodejs';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AccountPage() {
  const supabase = await createClient();

  // 1) controllo rapido: sessione esiste?
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) redirect('/login');

  // 2) dati “verificati”: chiamata al server Supabase
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) redirect('/login');

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Account</h1>
      <p className="mt-2 text-gray-700">Loggato come: {userData.user.email}</p>
    </main>
  );
}