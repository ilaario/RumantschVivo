import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import '../stylesheets/account.css';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, created_at')
    .eq('id', user.id)
    .single();

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_key, status, progress, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  const total = progress?.length ?? 0;
  const completed = progress?.filter((p) => p.status === 'completed').length ?? 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const recent = (progress ?? []).slice(0, 5);

  return (
    <main className="account-page">
      <div className="account-container">
        <h1 className="account-title">Account</h1>
        <p className="account-subtitle">
          Gestisci il tuo profilo e monitora i progressi
        </p>

        <div className="account-grid">
          {/* PROFILO */}
          <section className="account-card">
            <h2 className="card-title">Profilo</h2>

            <div className="kv">
              <div className="k">Email</div>
              <div className="v">{user.email}</div>

              <div className="k">Nome</div>
              <div className="v">
                {profile?.display_name || (
                  <span className="v muted">Non impostato</span>
                )}
              </div>
            </div>

            <div className="account-actions">
              <Link href="/account/edit" className="btn">
                Modifica profilo
              </Link>

              <form action="/auth/signout" method="post">
                <button type="submit" className="btn btn-danger">
                  Logout
                </button>
              </form>
            </div>
          </section>

          {/* PROGRESSI */}
          <section className="account-card">
            <h2 className="card-title">Progressi</h2>

            <div className="progress-row">
              <div className="progress-meta">
                Completate{' '}
                <strong>
                  {completed} / {total}
                </strong>
              </div>
              <span className="badge">{percent}%</span>
            </div>

            <div className="progress-bar">
              <span style={{ width: `${percent}%` }} />
            </div>

            <h3 className="card-title" style={{ marginTop: '18px' }}>
              Attività recente
            </h3>

            {recent.length === 0 ? (
              <p className="empty">
                Ancora zero progressi. Tempo di iniziare.
              </p>
            ) : (
              <ul className="recent-list">
                {recent.map((p) => (
                  <li key={p.lesson_key} className="recent-item">
                    <div className="recent-top">
                      <div>
                        <div className="lesson-key">{p.lesson_key}</div>
                        <div className="lesson-sub">
                          {p.status} · {p.progress}%
                        </div>
                      </div>

                      <Link
                        href={`/learn/${p.lesson_key}`}
                        className="recent-link"
                      >
                        Apri
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}