import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMessages } from '@/lib/i18n/messages';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import '../../stylesheets/account.css';

// Sanity
import { sanityClient } from '@/sanity/lib/client';
import { groq } from 'next-sanity';
import { resolveLocalizedString } from '@/lib/content/sanityUtils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LessonProgressRow = {
  lesson_key: string;
  completed: boolean | null;
  updated_at: string | null;
};

type LessonMeta = {
  lessonKey: string;
  slug?: string;
  title?: unknown; // può essere string o oggetto localizzato
  translation?: {
    title?: unknown;
  };
};

type CheckpointResultRow = {
  checkpoint_key: string;
  locale: string | null;
  attempts: number | null;
  best_score: number | null;
  last_score: number | null;
  passed: boolean | null;
  passed_at: string | null;
};

type CheckpointMeta = {
  checkpointKey: string;
  slug?: string;
  minScore?: number | null;
  translation?: {
    title?: unknown;
  };
};

const LESSONS_BY_KEYS_QUERY = groq`
  *[_type == "lessonBase" && lessonKey in $keys]{
    lessonKey,
    "slug": slug.current,
    title,
    "translation": *[
      _type == "lessonTranslation" &&
      lesson._ref == ^._id &&
      locale == $locale
    ][0]{ title }
  }
`;

const TOTAL_LESSONS_QUERY = groq`
  count(*[_type == "lessonBase"])
`;

const CHECKPOINTS_BY_KEYS_QUERY = groq`
  *[_type == "checkpointBase" && checkpointKey in $keys]{
    checkpointKey,
    "slug": slug.current,
    minScore,
    "translation": *[
      _type == "checkpointTranslation" &&
      checkpoint._ref == ^._id &&
      locale == $locale
    ][0]{ title }
  }
`;

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? (rawLocale as Locale) : DEFAULT_LOCALE;
  const t = getMessages(locale);
  const cpT = t.account.checkpoints; // 🔥 blocco i18n checkpoint

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

  /* ===== PROGRESSO LEZIONI DA SUPABASE ===== */
  const { data: progressRows } = await supabase
    .from('lesson_progress')
    .select('lesson_key, completed, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  const progress = (progressRows ?? []) as LessonProgressRow[];

  /* ===== METADATI LEZIONI DA SANITY ===== */
  const uniqueLessonKeys = Array.from(
    new Set(progress.map((p) => p.lesson_key).filter(Boolean)),
  );

  let totalLessons = 0;
  const lessonMetaMap = new Map<
    string,
    {
      title: string;
      slug: string;
    }
  >();

  try {
    totalLessons = await sanityClient.fetch<number>(TOTAL_LESSONS_QUERY);

    if (uniqueLessonKeys.length > 0) {
      const sanityLessons = await sanityClient.fetch<LessonMeta[]>(
        LESSONS_BY_KEYS_QUERY,
        {
          keys: uniqueLessonKeys,
          locale,
        },
      );

      for (const l of sanityLessons) {
        const titleFromTranslation = resolveLocalizedString(
          l.translation?.title,
          locale,
        );
        const titleFromBase = resolveLocalizedString(l.title, locale);

        const localizedTitle = titleFromTranslation ?? titleFromBase ?? l.lessonKey;

        lessonMetaMap.set(l.lessonKey, {
          title: localizedTitle,
          slug: l.slug ?? l.lessonKey,
        });
      }
    }
  } catch (err) {
    console.error('[AccountPage] errore caricando lezioni da Sanity', err);
  }

  // fallback totale lezioni
  const total = totalLessons > 0 ? totalLessons : progress.length;
  const completedCount = progress.filter((p) => p.completed).length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const recent = progress.slice(0, 5);

  /* ===== CHECKPOINTS: RISULTATI DA SUPABASE ===== */
  const { data: checkpointRows } = await supabase
    .from('checkpoint_results')
    .select(
      'checkpoint_key, locale, attempts, best_score, last_score, passed, passed_at',
    )
    .eq('user_id', user.id)
    .eq('locale', locale)
    .order('updated_at', { ascending: false });

  const checkpointResults = (checkpointRows ?? []) as CheckpointResultRow[];

  const checkpointKeys = Array.from(
    new Set(checkpointResults.map((r) => r.checkpoint_key).filter(Boolean)),
  );

  const checkpointMetaMap = new Map<
    string,
    {
      title: string;
      slug: string;
      minScore: number | null;
    }
  >();

  if (checkpointKeys.length > 0) {
    try {
      const sanityCheckpoints = await sanityClient.fetch<CheckpointMeta[]>(
        CHECKPOINTS_BY_KEYS_QUERY,
        {
          keys: checkpointKeys,
          locale,
        },
      );

      for (const cp of sanityCheckpoints) {
        const titleFromTranslation = resolveLocalizedString(
          cp.translation?.title,
          locale,
        );

        checkpointMetaMap.set(cp.checkpointKey, {
          title: titleFromTranslation ?? cp.checkpointKey,
          slug: cp.slug ?? cp.checkpointKey,
          minScore:
            typeof cp.minScore === 'number' ? cp.minScore : null,
        });
      }
    } catch (err) {
      console.error(
        '[AccountPage] errore caricando checkpoint da Sanity',
        err,
      );
    }
  }

  const totalCheckpoints = checkpointResults.length;
  const passedCheckpoints = checkpointResults.filter((r) => r.passed).length;

  const avgCheckpointScore =
    totalCheckpoints > 0
      ? Math.round(
          checkpointResults.reduce((sum, r) => {
            const s = r.best_score ?? r.last_score ?? 0;
            return sum + s;
          }, 0) / totalCheckpoints,
        )
      : 0;

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

  // piccolo helper per la soglia
  const formatPassThreshold = (score: number) =>
    cpT.pass_threshold.replace('{score}', String(score));

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
                  <span className="v muted">
                    {t.account.overview.name_missing}
                  </span>
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

            {/* Lezioni */}
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

            {/* Checkpoints summary */}
            <div className="checkpoint-summary">
              <div className="checkpoint-summary-row">
                <div className="checkpoint-summary-meta">
                  {cpT.summary_passed_label}{' '}
                  <strong>
                    {passedCheckpoints} / {totalCheckpoints}
                  </strong>
                </div>
                <span className="badge badge--checkpoint">
                  {avgCheckpointScore}%
                </span>
              </div>

              <div className="checkpoint-bar">
                <span style={{ width: `${avgCheckpointScore}%` }} />
              </div>

              <p className="checkpoint-summary-note">
                {cpT.summary_average_note}
              </p>
            </div>

            {/* Attività recente lezioni */}
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

            {/* Lista checkpoint (se ci sono) */}
            {checkpointResults.length > 0 && (
              <>
                <h3 className="card-title" style={{ marginTop: '18px' }}>
                  {cpT.list_title}
                </h3>
                <ul className="checkpoint-list">
                  {checkpointResults.map((cp) => {
                    const meta = checkpointMetaMap.get(cp.checkpoint_key);
                    const title = meta?.title ?? cp.checkpoint_key;
                    const href = meta
                      ? `/${locale}/learn/checkpoint/${meta.slug}`
                      : undefined;

                    const statusLabel = cp.passed
                      ? cpT.status_passed
                      : cpT.status_not_passed;
                    const when = formatDate(cp.passed_at ?? cp.passed_at);

                    return (
                      <li key={cp.checkpoint_key} className="checkpoint-item">
                        <div className="checkpoint-item-main">
                          <div>
                            <div className="checkpoint-name">{title}</div>
                            <div className="checkpoint-sub">
                              {statusLabel}
                              {when ? ` · ${when}` : ''}
                            </div>
                          </div>
                          <div className="checkpoint-score-pill">
                            <span className="checkpoint-score-value">
                              {cp.best_score ?? cp.last_score ?? 0}%
                            </span>
                            {meta?.minScore != null && (
                              <span className="checkpoint-score-min">
                                {formatPassThreshold(meta.minScore)}
                              </span>
                            )}
                          </div>
                        </div>

                        {href && (
                          <div className="checkpoint-item-actions">
                            <Link href={href} className="recent-link">
                              {cpT.open_checkpoint}
                            </Link>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}