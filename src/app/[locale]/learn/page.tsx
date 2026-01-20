// src/app/[locale]/learn/page.tsx

import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import { listLessons, type LessonListItem } from '@/lib/content/lessons';
import {
  listCheckpointsForLevel,
  type CheckpointListItem,
} from '@/lib/content/checkpoints';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMessages } from '@/lib/i18n/messages';
import '../../stylesheets/learn.css';

type LearnPageParams = {
  locale: Locale;
};

type Props = {
  params: Promise<LearnPageParams>;
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

export default async function LearnPage({ params }: Props) {
  const { locale } = await params;
  const level = 'A0';

  // i18n
  const t = getMessages(locale);
  const text = t.learn_page;

  // ====== CHECK LOGIN VIA SUPABASE ======
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?redirectTo=/${locale}/learn`);
  }

  // ====== LEZIONI (da Sanity) ======
  const lessons: LessonListItem[] = await listLessons({ level, locale });

  // ====== CHECKPOINTS (da Sanity) ======
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

  // ====== PROGRESSO CHECKPOINTS DA SUPABASE ======
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

  // ====== GATING LINEARE TRA CHECKPOINTS ======
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

  return (
    <main className="learn-page">
      <header className="learn-header">
        <h1>{text.title}</h1>
        <p>{text.subtitle}</p>
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

            return (
              <li key={l.id}>
                <Link
                  href={`/${locale}/learn/${l.slug}`}
                  className={`learn-card learn-link ${statusClass}`}
                >
                  <p className="learn-card-title">{l.title}</p>

                  {Array.isArray(l.goals) && l.goals.length > 0 && (
                    <div className="learn-meta">{l.goals.join(' · ')}</div>
                  )}
                </Link>
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
    </main>
  );
}