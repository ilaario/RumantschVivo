import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMessages } from '@/lib/i18n/messages';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import '../../stylesheets/account.css';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // params è una Promise, quindi va awaited
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? (rawLocale as Locale) : DEFAULT_LOCALE;
  const t = getMessages(locale);

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) redirect(`/${locale}/login`);

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
        <h1 className="account-title">{t.account.overview.title}</h1>
        <p className="account-subtitle">
          {t.account.overview.subtitle}
        </p>

        <div className="account-grid">
          {/* PROFILO */}
          <section className="account-card">
            <h2 className="card-title">{t.account.overview.profile_title}</h2>

            <div className="kv">
              <div className="k">{t.account.overview.email}</div>
              <div className="v">{user.email}</div>

              <div className="k">{t.account.overview.name}</div>
              <div className="v">
                {profile?.display_name || (
                  <span className="v muted">{t.account.overview.name_missing}</span>
                )}
              </div>
            </div>

            <div className="account-actions">
              <Link href={`/${locale}/account/edit`} className="btn">
                {t.account.overview.edit_profile}
              </Link>

              <form action="/auth/signout" method="post">
                <button type="submit" className="btn btn-danger">
                  {t.account.overview.logout}
                </button>
              </form>
            </div>
          </section>

          {/* PROGRESSI */}
          <section className="account-card">
            <h2 className="card-title">{t.account.overview.progress_title}</h2>

            <div className="progress-row">
              <div className="progress-meta">
                {t.account.overview.progress_completed}{' '}
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
              {t.account.overview.recent_activity}
            </h3>

            {recent.length === 0 ? (
              <p className="empty">
                {t.account.overview.recent_empty}
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
                        href={`/${locale}/learn/${p.lesson_key}`}
                        className="recent-link"
                      >
                        {t.account.overview.open_lesson}
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