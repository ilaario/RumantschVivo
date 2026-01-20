'use client';

import { useMemo, useState, useCallback } from 'react';
import type { Locale } from '@/lib/i18n/config';
import type { Exercise } from '@/lib/content/exercises';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { PortableBlocks } from '@/lib/content/portableComponents';
import { useI18n } from '@/lib/i18n/i18nprovider';

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h1 className="lesson-h1">{children}</h1>,
    h2: ({ children }) => <h2 className="lesson-h2">{children}</h2>,
    h3: ({ children }) => <h3 className="lesson-h3">{children}</h3>,
    normal: ({ children }) => <p className="lesson-p">{children}</p>,
    blockquote: ({ children }) => <blockquote className="lesson-quote">{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul className="lesson-ul">{children}</ul>,
    number: ({ children }) => <ol className="lesson-ol">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="lesson-li">{children}</li>,
    number: ({ children }) => <li className="lesson-li">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => <code className="lesson-code">{children}</code>,
  },
};

function normalizeAnswer(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function format(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

type Props = {
  locale: Locale;
  checkpointKey: string;
  minScore: number;
  exercises: Exercise[];

  initialAttempts: number;
  initialBestScore: number;
  initialPassed: boolean;
  initialPassedAt: string | null;

  outroPassBlocks: any[];
  outroFailBlocks: any[];
};

export function CheckpointRunner(props: Props) {
  const router = useRouter();
  const t = useI18n();
  const L = t.checkpoint_runner;

  const {
    locale,
    checkpointKey,
    minScore,
    exercises,
    initialAttempts,
    initialBestScore,
    initialPassed,
    initialPassedAt,
    outroPassBlocks,
    outroFailBlocks,
  } = props;

  const supabase: SupabaseClient | null = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      console.warn('[CheckpointRunner] Missing Supabase env vars, skipping persistence');
      return null;
    }
    return createBrowserClient(url, key);
  }, []);

  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openAnswer, setOpenAnswer] = useState('');

  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const [firstTryTaken, setFirstTryTaken] = useState<boolean[]>(() =>
    exercises.map(() => false),
  );
  const [firstTryCorrect, setFirstTryCorrect] = useState<boolean[]>(() =>
    exercises.map(() => false),
  );

  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  const [attempts, setAttempts] = useState(initialAttempts);
  const [bestScore, setBestScore] = useState(initialBestScore);
  const [passed, setPassed] = useState(initialPassed);
  const [passedAt, setPassedAt] = useState<string | null>(initialPassedAt);

  if (!exercises || exercises.length === 0) return null;

  const current = exercises[index];
  const isLast = index === exercises.length - 1;
  const isMcq = current.type === 'mcq';
  const isOpen = current.type === 'open';

  const selectedChoice =
    isMcq && current.choices ? current.choices.find((c) => c.id === selectedId) ?? null : null;

  const canConfirm =
    !finished &&
    status === 'idle' &&
    (isMcq ? selectedId !== null : isOpen ? openAnswer.trim().length > 0 : true);

  const canNext = !finished && status !== 'idle';

  function handleSelect(choiceId: string) {
    if (!isMcq) return;
    if (status !== 'idle' || finished) return;
    setSelectedId(choiceId);
  }

  function markFirstTry(ok: boolean) {
    setFirstTryTaken((arr) => {
      const next = [...arr];
      next[index] = true;
      return next;
    });

    setFirstTryCorrect((arr) => {
      const next = [...arr];
      next[index] = ok;
      return next;
    });
  }

  async function handleConfirm() {
    if (!canConfirm) return;

    if (isMcq) {
      if (!selectedChoice) return;
      const ok = !!selectedChoice.correct;

      if (!firstTryTaken[index]) markFirstTry(ok);
      setStatus(ok ? 'correct' : 'wrong');
      return;
    }

    if (isOpen) {
      const expected = current.expectedAnswer ? normalizeAnswer(current.expectedAnswer) : null;
      const given = normalizeAnswer(openAnswer);

      const ok = expected ? given === expected : true;

      if (!firstTryTaken[index]) markFirstTry(ok);
      setStatus(ok ? 'correct' : 'wrong');
      return;
    }

    if (!firstTryTaken[index]) markFirstTry(true);
    setStatus('correct');
  }

  // === salvataggio su checkpoint_results ===
  const saveResult = useCallback(
    async (
      score: number,
      isPassed: boolean,
      newAttempts: number,
      newBestScore: number,
      newPassedAt: string | null,
    ) => {
      if (!supabase) {
        console.warn('[CheckpointRunner] Supabase client missing, skipping save');
        return;
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error('[CheckpointRunner] getUser error', {
            message: userError.message,
            details: (userError as any).details,
            hint: (userError as any).hint,
            code: (userError as any).code,
          });
          return;
        }

        if (!user) {
          console.warn('[CheckpointRunner] No user, skipping save');
          return;
        }

        const { data, error } = await supabase
          .from('checkpoint_results')
          .upsert(
            {
              user_id: user.id,
              checkpoint_key: checkpointKey,
              locale,
              attempts: newAttempts,
              best_score: newBestScore,
              last_score: score,
              passed: isPassed,
              passed_at: newPassedAt,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'user_id,checkpoint_key',
            },
          )
          .select(
            'user_id, checkpoint_key, locale, attempts, best_score, last_score, passed, passed_at, updated_at',
          );

        if (error) {
          const e: any = error;
          console.error('[CheckpointRunner] upsert error (raw):', error);
          console.error('[CheckpointRunner] upsert error (details):', {
            message: e?.message,
            code: e?.code,
            details: e?.details,
            hint: e?.hint,
            status: e?.status,
            name: e?.name,
            ctor: e?.constructor?.name,
            ownProps: error ? Object.getOwnPropertyNames(error) : [],
            string: String(error),
          });
          return;
        }

        console.log('[CheckpointRunner] saved row:', data);
      } catch (err: any) {
        console.error('[CheckpointRunner] save exception', {
          message: err?.message,
          stack: err?.stack,
        });
      }
    },
    [supabase, checkpointKey, locale],
  );

  async function handleNextOrFinish() {
    if (!canNext) return;

    if (isLast) {
      const correct = firstTryCorrect.filter(Boolean).length;
      const total = exercises.length;
      const score = total > 0 ? Math.round((correct / total) * 100) : 0;
      const isPassed = score >= minScore;

      const newAttempts = attempts + 1;
      const newBestScore = score > bestScore ? score : bestScore;
      const newPassedAt = isPassed ? new Date().toISOString() : passedAt;

      setSaving(true);
      try {
        await saveResult(score, isPassed, newAttempts, newBestScore, newPassedAt ?? null);

        setFinished(true);
        setAttempts(newAttempts);
        setBestScore(newBestScore);
        setPassed(isPassed);
        setPassedAt(newPassedAt ?? null);
      } finally {
        setSaving(false);
      }
      return;
    }

    setIndex((i) => i + 1);
    setSelectedId(null);
    setOpenAnswer('');
    setStatus('idle');
  }

  const correctCount = firstTryCorrect.filter(Boolean).length;
  const scoreNow = exercises.length > 0 ? Math.round((correctCount / exercises.length) * 100) : 0;
  const wouldPass = scoreNow >= minScore;

  // header text i18n
  const headerText = finished
    ? (() => {
        const base = format(L.header_finished, {
          score: scoreNow,
          best: bestScore,
          attempts,
        });

        if (passed && passedAt) {
          const dt = new Date(passedAt).toLocaleString(
            locale === 'it'
              ? 'it-IT'
              : locale === 'de'
              ? 'de-DE'
              : locale === 'fr'
              ? 'fr-FR'
              : 'en-GB',
          );
          const suffix = L.header_finished_passed_suffix
            ? format(L.header_finished_passed_suffix, { datetime: dt })
            : '';
          return base + suffix;
        }

        return base;
      })()
    : format(L.header_in_progress, {
        index: index + 1,
        total: exercises.length,
        score: scoreNow,
      });

  const resultStatus = wouldPass ? L.result_status_passed : L.result_status_failed;
  const resultSentence = format(L.result_sentence, {
    score: scoreNow,
    minScore,
    status: resultStatus,
  });

  return (
    <section className="lesson-exercises">
      <header className="lesson-ex-header">
        <div className="lesson-ex-label">{L.label}</div>
        <div className="lesson-ex-progress">
          {finished ? <strong>{headerText}</strong> : headerText}
        </div>
      </header>

      <div className="lesson-ex-body">
        <p className="lesson-ex-prompt-title">
          <strong>{current.title}</strong>
        </p>

        {current.promptBlocks?.length > 0 && (
          <div className="lesson-ex-prompt">
            <PortableText value={current.promptBlocks} components={components} />
          </div>
        )}

        {isMcq && current.choices?.length > 0 && (
          <ul className="lesson-ex-options">
            {current.choices.map((choice) => {
              const isSelected = choice.id === selectedId;
              const isCorrect = status !== 'idle' && choice.correct;
              const isWrongSelected = status === 'wrong' && isSelected && !choice.correct;

              let className = 'lesson-ex-option';
              if (isSelected) className += ' is-selected';
              if (isCorrect) className += ' is-correct';
              if (isWrongSelected) className += ' is-wrong';

              return (
                <li key={choice.id} className={className} onClick={() => handleSelect(choice.id)}>
                  {choice.text}
                </li>
              );
            })}
          </ul>
        )}

        {isOpen && (
          <div className="lesson-ex-open">
            <p className="lesson-ex-open-hint">{L.open_hint}</p>

            <textarea
              className="lesson-ex-open-input"
              rows={4}
              placeholder={L.open_placeholder}
              value={openAnswer}
              onChange={(e) => {
                setOpenAnswer(e.target.value);
                if (status !== 'idle') setStatus('idle');
              }}
              disabled={finished}
            />

            {status !== 'idle' && (
              <div className="lesson-ex-answer">
                {status === 'correct' ? (
                  <>
                    <span className="lesson-ex-answer-label">{L.open_correct_title}</span>
                    <span> {L.open_correct_body}</span>
                  </>
                ) : (
                  <>
                    <span className="lesson-ex-answer-label">{L.open_wrong_title}</span>
                    <span> {L.open_wrong_body}</span>
                  </>
                )}

                {current.solutionBlocks?.length > 0 && (
                  <div className="lesson-ex-answer-text">
                    <PortableText value={current.solutionBlocks} components={components} />
                  </div>
                )}

                {current.expectedAnswer && (
                  <p className="lesson-ex-expected">
                    <span className="lesson-ex-expected-label">{L.expected_label}</span>{' '}
                    {current.expectedAnswer}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {isMcq && status !== 'idle' && (
          <div className="lesson-ex-answer">
            {status === 'correct' ? (
              <>
                <span className="lesson-ex-answer-label">{L.mcq_correct_title}</span>
                <span> {L.mcq_correct_body}</span>
              </>
            ) : (
              <>
                <span className="lesson-ex-answer-label">{L.mcq_wrong_title}</span>
                <span> {L.mcq_wrong_body}</span>
              </>
            )}
          </div>
        )}

        {finished && (
          <div className="lesson-ex-answer" style={{ marginTop: 16 }}>
            <p>
              <strong>{L.result_label}</strong> {resultSentence}
            </p>

            {wouldPass ? (
              outroPassBlocks?.length > 0 && <PortableBlocks value={outroPassBlocks} />
            ) : (
              outroFailBlocks?.length > 0 && <PortableBlocks value={outroFailBlocks} />
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="lesson-ex-btn lesson-ex-btn--primary"
                onClick={() => router.refresh()}
              >
                {L.redo_button}
              </button>

              <button
                type="button"
                className="lesson-ex-btn lesson-ex-btn--ghost"
                onClick={() => router.push(`/${locale}/learn`)}
              >
                {L.back_to_lessons_button}
              </button>
            </div>
          </div>
        )}
      </div>

      {!finished && (
        <footer className="lesson-ex-footer">
          <button
            type="button"
            className="lesson-ex-btn lesson-ex-btn--ghost"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {L.confirm_button}
          </button>

          <button
            type="button"
            className="lesson-ex-btn lesson-ex-btn--primary"
            disabled={!canNext || saving}
            onClick={handleNextOrFinish}
          >
            {saving ? L.loading_label : isLast ? L.finish_button : L.next_button}
          </button>
        </footer>
      )}
    </section>
  );
}