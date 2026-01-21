// src/app/[locale]/learn/page.tsx

import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import { listLessons, type LessonListItem } from '@/lib/content/lessons';
import {
  listCheckpointsForLevel,
  type CheckpointListItem,
} from '@/lib/content/checkpoints';
import { PortableBlocks } from '@/lib/content/portableComponents';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMessages } from '@/lib/i18n/messages';
import '../../stylesheets/learn.css';

type LearnPageParams = {
  locale: Locale;
  variant?: string;
};

type Props = {
  // in Next 16 questi due sono *Promises* in un server component async
  params: Promise<LearnPageParams>;
  searchParams?: Promise<{ level?: string }>;
};

type LessonStatus = 'new' | 'started' | 'completed';

type CheckpointResultRow = {
  checkpoint_key: string;
  best_score: number | null;
  passed: boolean | null;
};

// piccolo helper per "{level}" / "{score}"
function format(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

// ordine logico dei livelli
const LEVEL_ORDER = ['A0', 'A1', 'A2', 'B1'];

export default async function LearnPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = (await searchParams) ?? {};

  // livello corrente da query ?level=A1, fallback A0
  const requestedLevel =
    typeof sp.level === 'string' ? sp.level.toUpperCase() : 'A0';
  const level = LEVEL_ORDER.includes(requestedLevel) ? requestedLevel : 'A0';

  const currentIdx = LEVEL_ORDER.indexOf(level);
  const prevLevel = currentIdx > 0 ? LEVEL_ORDER[currentIdx - 1] : null;
  const nextLevel =
    currentIdx >= 0 && currentIdx < LEVEL_ORDER.length - 1
      ? LEVEL_ORDER[currentIdx + 1]
      : null;

  // i18n
  const t = getMessages(locale);
  const text = t.learn_page;

  // ====== CHECK LOGIN VIA SUPABASE ======
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectQuery = level && level !== 'A0' ? `?level=${level}` : '';
    redirect(`/${locale}/login?redirectTo=/${locale}/learn${redirectQuery}`);
  }

  // ====== LEZIONI (da Sanity) per il livello corrente ======
  const lessons: LessonListItem[] = await listLessons({ level, locale });

  // ====== CHECKPOINTS (da Sanity) per il livello corrente ======
  const checkpoints: CheckpointListItem[] = await listCheckpointsForLevel({
    level,
    locale,
  });

  // ====== PROGRESSO LEZIONI DA SUPABASE ======
  const { data: rows, error } = await supabase
    .from('lesson_progress')
    .select('lesson_key, completed')
    .eq('user_id', user.id);

  if (error) {
    console.error('Errore caricando lesson_progress:', {
      message: error?.message,
      details: (error as any)?.details,
      hint: (error as any)?.hint,
      code: (error as any)?.code,
    });
  }

  const progressByLessonKey = new Map<string, LessonStatus>();

  if (Array.isArray(rows)) {
    for (const row of rows) {
      const key = row.lesson_key as string;
      const status: LessonStatus = row.completed ? 'completed' : 'started';
      progressByLessonKey.set(key, status);
    }
  }

  // ====== PROGRESSO CHECKPOINTS DEL LIVELLO CORRENTE DA SUPABASE ======
  const checkpointKeys = checkpoints.map((c) => c.checkpointKey).filter(Boolean);

  let checkpointResultsByKey = new Map<
    string,
    { best_score: number; passed: boolean }
  >();

  if (checkpointKeys.length > 0) {
    const { data: cpRows, error: cpErr } = await supabase
      .from('checkpoint_results')
      .select('checkpoint_key, best_score, passed')
      .eq('user_id', user.id)
      .in('checkpoint_key', checkpointKeys);

    if (cpErr) {
      console.error('Errore caricando checkpoint_results:', cpErr);
    }

    if (Array.isArray(cpRows)) {
      checkpointResultsByKey = new Map(
        (cpRows as CheckpointResultRow[]).map((r) => [
          r.checkpoint_key,
          {
            best_score: r.best_score ?? 0,
            passed: !!r.passed,
          },
        ]),
      );
    }
  }

  // ====== GATING LINEARE TRA CHECKPOINTS (NEL LIVELLO CORRENTE) ======
  const sortedCheckpoints = [...checkpoints].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  type CheckpointView = CheckpointListItem & {
    unlocked: boolean;
    passed: boolean;
    bestScore: number;
  };

  const checkpointViews: CheckpointView[] = [];
  let chainBroken = false;

  for (const cp of sortedCheckpoints) {
    const res = checkpointResultsByKey.get(cp.checkpointKey);
    const passed = !!res?.passed;
    const bestScore = res?.best_score ?? 0;

    const unlocked = !chainBroken;

    if (!passed) {
      chainBroken = true;
    }

    checkpointViews.push({
      ...cp,
      unlocked,
      passed,
      bestScore,
    });
  }

  // ====== GATING PER LIVELLO: SERVE CHECKPOINT LIVELLO PRECEDENTE ======
  let previousLevelCompleted = true;

  if (prevLevel) {
    try {
      const prevCheckpoints: CheckpointListItem[] = await listCheckpointsForLevel({
        level: prevLevel,
        locale,
      });

      const prevKeys = prevCheckpoints.map((c) => c.checkpointKey).filter(Boolean);

      if (prevKeys.length > 0) {
        const { data: prevRows, error: prevErr } = await supabase
          .from('checkpoint_results')
          .select('checkpoint_key, passed')
          .eq('user_id', user.id)
          .in('checkpoint_key', prevKeys);

        if (prevErr) {
          console.error('Errore caricando checkpoint_results livello precedente:', prevErr);
        }

        if (Array.isArray(prevRows)) {
          const passedSet = new Set(
            prevRows.filter((r: any) => r.passed).map((r: any) => r.checkpoint_key),
          );
          // consideriamo "completato" se TUTTI i checkpoint del livello precedente sono passati
          previousLevelCompleted = prevKeys.every((k) => passedSet.has(k));
        } else {
          previousLevelCompleted = false;
        }
      } else {
        // nessun checkpoint nel livello precedente => nessun blocco
        previousLevelCompleted = true;
      }
    } catch (e) {
      console.error('Errore nel gating livello precedente:', e);
      previousLevelCompleted = false;
    }
  }

  const lessonsLocked = !!prevLevel && !previousLevelCompleted;

  // ====== LABELS DA i18n ======
  const labelCheckpoint = text.checkpoints_section_title
    ? format(text.checkpoints_section_title, { level })
    : `Checkpoint livello ${level}`;

  const labelTodo = text.checkpoints_todo_label ?? 'Da svolgere';
  const labelScore = text.checkpoints_best_score_label ?? 'Miglior voto';

  const formatPassMark = (score: number) =>
    (text.checkpoints_pass_mark ?? 'Soglia: {score}%').replace(
      '{score}',
      String(score),
    );

  const lockText =
    text.checkpoints_lock_text ??
    'Completa il checkpoint precedente per sbloccare questo.';

  const levelLockText =
    text.level_lock_text ??
    (prevLevel
      ? `Completa il checkpoint del livello ${prevLevel} per sbloccare queste lezioni.`
      : 'Completa il livello precedente per sbloccare queste lezioni.');

  const currentLevelLabel =
    text.current_level_label ??
    (locale === 'it' ? 'Livello {level}' : 'Level {level}');

  const prevLevelLabel =
    text.prev_level_button ??
    (locale === 'it' ? 'Livello precedente' : 'Previous level');

  const nextLevelLabel =
    text.next_level_button ??
    (locale === 'it' ? 'Livello successivo' : 'Next level');

  return (
    <main className="learn-page">
      <header className="learn-header">
        <h1>{text.title}</h1>
        <p>{text.subtitle}</p>

        {/* livello corrente visualizzato */}
        <p className="learn-subtitle-level">
          {format(currentLevelLabel, { level })}
        </p>
      </header>

      {/* ====== LISTA LEZIONI ====== */}
      {lessons.length === 0 ? (
        <div className="learn-empty">{text.empty}</div>
      ) : (
        <ul className="learn-list">
          {lessons.map((l) => {
            const status: LessonStatus =
              progressByLessonKey.get(l.lesson_key) ?? 'new';

            const statusClass =
              status === 'completed'
                ? 'learn-card--completed'
                : status === 'started'
                  ? 'learn-card--started'
                  : 'learn-card--new';

            const content = (
              <div className={`learn-card ${statusClass}`}>
                <p className="learn-card-title">{l.title}</p>
                <PortableBlocks value={l.intro} />
                <p className="learn-lock-text">{l.variant?.toUpperCase()}</p>

                {Array.isArray(l.goals) && l.goals.length > 0 && (
                  <div className="learn-meta">{l.goals.join(' · ')}</div>
                )}

                {lessonsLocked && (
                  <p className="learn-lock-text">{levelLockText}</p>
                )}
              </div>
            );

            return (
              <li key={l.id}>
                {lessonsLocked ? (
                  <div className="learn-link learn-link--disabled">{content}</div>
                ) : (
                  <Link
                    href={`/${locale}/learn/${l.slug}`}
                    className="learn-link"
                  >
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}

            {/* ====== CHECKPOINTS ====== */}
            {checkpointViews.length > 0 && (
        <section className="learn-checkpoints">
          <h2 className="learn-checkpoints-title">{labelCheckpoint}</h2>

          <ul className="learn-list learn-list--checkpoints">
            {checkpointViews.map((cp) => {
              const href = `/${locale}/learn/checkpoint/${cp.slug}`;
              const disabled = !cp.unlocked;
              const hasScore = cp.passed || cp.bestScore > 0;

              const cardClass = [
                'learn-card',
                'learn-card--checkpoint',
                disabled ? 'learn-card--locked' : '',
                cp.passed ? 'learn-card--completed' : '',
              ]
                .filter(Boolean)
                .join(' ');

              const content = (
                <div className={cardClass}>
                  <div className="learn-card-header">
                    <p className="learn-card-title">{cp.title}</p>

                    {!hasScore && (
                      <span className="badge badge--todo">{labelTodo}</span>
                    )}

                    {hasScore && (
                      <div className="checkpoint-score">
                        <svg
                          viewBox="0 0 36 36"
                          className="checkpoint-circle"
                          aria-hidden="true"
                        >
                          <path
                            className="checkpoint-circle-bg"
                            d="M18 2.0845
                               a 15.9155 15.9155 0 0 1 0 31.831
                               a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="checkpoint-circle-value"
                            strokeDasharray={`${Math.max(
                              0,
                              Math.min(cp.bestScore, 100),
                            )}, 100`}
                            d="M18 2.0845
                               a 15.9155 15.9155 0 0 1 0 31.831
                               a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <text
                            x="18"
                            y="20.35"
                            className="checkpoint-circle-label"
                          >
                            {Math.round(cp.bestScore)}%
                          </text>
                        </svg>
                        <span className="checkpoint-score-label">
                          {labelScore}
                        </span>
                      </div>
                    )}
                  </div>

                  {cp.description && (
                    <p className="learn-meta">{cp.description}</p>
                  )}

                  {cp.minScore != null && (
                    <p className="learn-meta">
                      {formatPassMark(cp.minScore)}
                    </p>
                  )}

                  {disabled && (
                    <p className="learn-lock-text">
                      {lockText}
                    </p>
                  )}
                </div>
              );

              return (
                <li key={cp.id}>
                  {disabled ? (
                    <div className="learn-link learn-link--disabled">
                      {content}
                    </div>
                  ) : (
                    <Link href={href} className="learn-link">
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ====== NAVIGAZIONE LIVELLI (SEMPRE VISIBILE) ====== */}
      <section className="learn-level-nav">
        <div className="learn-level-nav-buttons">
          {/* Indietro */}
          {prevLevel ? (
            <Link
              href={`/${locale}/learn?level=${prevLevel}`}
              className="learn-level-nav-btn learn-level-nav-btn--prev"
            >
              ← {prevLevelLabel} ({prevLevel})
            </Link>
          ) : (
            <button
              type="button"
              className="learn-level-nav-btn learn-level-nav-btn--prev"
              disabled
            >
              ← {prevLevelLabel}
            </button>
          )}

          {/* Avanti */}
          {nextLevel ? (
            <Link
              href={`/${locale}/learn?level=${nextLevel}`}
              className="learn-level-nav-btn learn-level-nav-btn--next"
            >
              {nextLevelLabel} ({nextLevel}) →
            </Link>
          ) : (
            <button
              type="button"
              className="learn-level-nav-btn learn-level-nav-btn--next"
              disabled
            >
              {nextLevelLabel} →
            </button>
          )}
        </div>
      </section>
    </main>
  );
}