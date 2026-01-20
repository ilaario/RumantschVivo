import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMessages } from '@/lib/i18n/messages';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import '../../stylesheets/account.css';

// Sanity
import { sanityClient } from '@/sanity/lib/client';
import { groq } from 'next-sanity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LessonProgressRow = {
  lesson_key: string;
  completed: boolean | null;
  updated_at: string | null;
};

type LessonMeta = {
  lessonKey: string;
  slug: string;
  title?: {
    it?: string;
    en?: string;
  };
};

const LESSONS_BY_KEYS_QUERY = groq`
  *[_type == "lesson" && lessonKey in $keys]{
    lessonKey,
    "slug": slug.current,
    title
  }
`;

const TOTAL_LESSONS_QUERY = groq`
  count(*[_type == "lesson"])
`;

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
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

  // ===== PROGRESSO LEZIONI DA SUPABASE =====
  const { data: progressRows } = await supabase
    .from('lesson_progress')
    .select('lesson_key, completed, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  const progress = (progressRows ?? []) as LessonProgressRow[];

  // ===== METADATI LEZIONI DA SANITY =====
  const uniqueKeys = Array.from(new Set(progress.map((p) => p.lesson_key).filter(Boolean)));

  let totalLessons = 0;
  const lessonMetaMap = new Map<
    string,
    {
      title: string;
      slug: string;
    }
  >();

  try {
    // totale lezioni (per la %)
    totalLessons = await sanityClient.fetch<number>(TOTAL_LESSONS_QUERY);

    if (uniqueKeys.length > 0) {
      const sanityLessons = await sanityClient.fetch<LessonMeta[]>(LESSONS_BY_KEYS_QUERY, {
        keys: uniqueKeys,
      });

      for (const l of sanityLessons) {
        const localizedTitle =
          (locale === 'it' ? l.title?.it : l.title?.en) ??
          l.title?.it ??
          l.title?.en ??
          l.lessonKey;

        lessonMetaMap.set(l.lessonKey, {
          title: localizedTitle,
          slug: l.slug,
        });
      }
    }
  } catch (err) {
    console.error('[AccountPage] errore caricando lezioni da Sanity', err);
  }

  // se per qualche motivo la query fallisce, fallback: numero di lezioni = progress registrati
  const total = totalLessons > 0 ? totalLessons : progress.length;
  const completedCount = progress.filter((p) => p.completed).length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const recent = progress.slice(0, 5);

  function formatStatus(completed: boolean) {
    if (locale === 'it') {
      return completed ? 'Completata' : 'In corso';
    }
    return completed ? 'Completed' : 'In progress';
  }

  function formatDate(iso: string | null) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString(locale === 'it' ? 'it-IT' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <main className="account-page">
      <div className="account-container">
        <h1 className="account-title">{t.account.overview.title}</h1>
        <p className="account-subtitle">{t.account.overview.subtitle}</p>

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
                  {completedCount} / {total}
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
              <p className="empty">{t.account.overview.recent_empty}</p>
            ) : (
              <ul className="recent-list">
                {recent.map((p) => {
                  const meta = lessonMetaMap.get(p.lesson_key);
                  const displayTitle = meta?.title ?? p.lesson_key;
                  const statusLabel = formatStatus(!!p.completed);
                  const when = formatDate(p.updated_at);
                  const href = meta
                    ? `/${locale}/learn/${meta.slug}`
                    : `/${locale}/learn/${p.lesson_key}`;

                  return (
                    <li key={p.lesson_key} className="recent-item">
                      <div className="recent-top">
                        <div>
                          <div className="lesson-key">{displayTitle}</div>
                          <div className="lesson-sub">
                            {statusLabel}
                            {when ? ` · ${when}` : ''}
                          </div>
                        </div>

                        <Link href={href} className="recent-link">
                          {t.account.overview.open_lesson}
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
