'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { Exercise } from '@/lib/content/exercises';
import type { Locale } from '@/lib/i18n/config';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/i18nprovider';

function format(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

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

type Props = {
  exercises: Exercise[];
  locale: Locale;
  lessonKey: string;
  nextLessonHref?: string;
  initialIndex?: number;
};

function normalizeAnswer(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function LessonExercises({
  exercises,
  locale,
  lessonKey,
  nextLessonHref,
  initialIndex,
}: Props) {
  const router = useRouter();
  const t = useI18n();
  const L = t.lesson_exercises;

  const safeInitialIndex = Math.max(
    0,
    Math.min(initialIndex ?? 0, Math.max(exercises.length - 1, 0)),
  );

  const [index, setIndex] = useState(safeInitialIndex);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openAnswer, setOpenAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [completed, setCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasSavedExit, setHasSavedExit] = useState(false);

  if (!exercises || exercises.length === 0) return null;

  const current = exercises[index];
  const isLast = index === exercises.length - 1;
  const isMcq = current.type === 'mcq';
  const isOpen = current.type === 'open';

  const supabase: SupabaseClient | null = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn('[LessonExercises] Missing Supabase env vars. Progress will not be saved.');
      return null;
    }

    return createBrowserClient(url, key);
  }, []);

  const saveProgress = useCallback(
    async (newIndex: number, isCompleted: boolean) => {
      if (!supabase) return;

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error('[LessonExercises] getUser error', {
            message: userError.message,
            details: (userError as any).details,
            hint: (userError as any).hint,
            code: (userError as any).code,
          });
          return;
        }

        if (!user) {
          console.warn('[LessonExercises] No user, skipping progress save');
          return;
        }

        const { error } = await supabase.from('lesson_progress').upsert(
          {
            user_id: user.id,
            lesson_key: lessonKey,
            locale,
            current_index: newIndex,
            completed: isCompleted,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,lesson_key',
          },
        );

        if (error) {
          console.error('[LessonExercises] upsert error', {
            message: error.message,
            details: (error as any).details,
            hint: (error as any).hint,
            code: (error as any).code,
          });
        } else {
          console.log('[LessonExercises] progress saved', {
            newIndex,
            isCompleted,
            lessonKey,
            locale,
          });
        }
      } catch (err: any) {
        console.error('[LessonExercises] saveProgress exception', {
          message: err?.message,
        });
      }
    },
    [supabase, lessonKey, locale],
  );

  const selectedChoice =
    isMcq && current.choices ? (current.choices.find((c) => c.id === selectedId) ?? null) : null;

  const canConfirm = (() => {
    if (completed) return false;
    if (isMcq) {
      return selectedId !== null && status === 'idle';
    }
    if (isOpen) {
      return openAnswer.trim().length > 0 && status === 'idle';
    }
    return status === 'idle';
  })();

  const canNextOrFinish = !completed && status !== 'idle';

  function handleSelect(choiceId: string) {
    if (!isMcq) return;
    if (status !== 'idle' || completed) return;
    setSelectedId(choiceId);
  }

  async function handleConfirm() {
    if (completed) return;

    if (isMcq) {
      if (!selectedChoice) return;
      const ok = !!selectedChoice.correct;
      setStatus(ok ? 'correct' : 'wrong');
      return;
    }

    if (isOpen) {
      if (!current.expectedAnswer) {
        setStatus('correct');
        return;
      }

      const expected = normalizeAnswer(current.expectedAnswer);
      const given = normalizeAnswer(openAnswer);

      const ok = given.length > 0 && given === expected;
      setStatus(ok ? 'correct' : 'wrong');
      return;
    }

    setStatus('correct');
  }

  async function handleNextOrFinish() {
    if (!canNextOrFinish) return;

    if (isLast) {
      await saveProgress(index, true);
      setCompleted(true);
      setShowModal(true);
      return;
    }

    const nextIndex = index + 1;
    await saveProgress(nextIndex, false);

    setIndex(nextIndex);
    setSelectedId(null);
    setOpenAnswer('');
    setStatus('idle');
  }

  async function handleExitToList() {
    if (!hasSavedExit && !completed) {
      await saveProgress(index, false);
      setHasSavedExit(true);
    }
    router.push(`/${locale}/learn`);
  }

  useEffect(() => {
    const handler = () => {
      if (!completed) {
        void saveProgress(index, false);
      }
    };

    window.addEventListener('beforeunload', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
    };
  }, [index, completed, saveProgress]);

  return (
    <>
      <section className="lesson-exercises">
        <header className="lesson-ex-header">
          <div className="lesson-ex-label">{L.exercises_label}</div>
          <div className="lesson-ex-progress">
            {format(L.exercise_of, { i: index + 1, total: exercises.length })}
          </div>
        </header>

        <div className="lesson-ex-body">
          <p className="lesson-ex-prompt-title">
            <strong>{current.title}</strong>
          </p>

          {current.promptBlocks && current.promptBlocks.length > 0 && (
            <div className="lesson-ex-prompt">
              <PortableText value={current.promptBlocks} components={components} />
            </div>
          )}

          {isMcq && current.choices.length > 0 && (
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
                placeholder={L.textarea_placeholder}
                value={openAnswer}
                onChange={(e) => {
                  setOpenAnswer(e.target.value);
                  if (status !== 'idle') setStatus('idle');
                }}
                disabled={completed}
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

                  {current.solutionBlocks && current.solutionBlocks.length > 0 && (
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
        </div>

        <footer className="lesson-ex-footer">
          <button
            type="button"
            className="lesson-ex-btn lesson-ex-btn--ghost lesson-ex-btn--back"
            onClick={handleExitToList}
          >
            {L.back_to_list_inline}
          </button>

          <button
            type="button"
            className="lesson-ex-btn lesson-ex-btn--ghost"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {L.confirm}
          </button>

          <button
            type="button"
            className="lesson-ex-btn lesson-ex-btn--primary"
            disabled={!canNextOrFinish}
            onClick={handleNextOrFinish}
          >
            {isLast ? L.finish : L.next}
          </button>
        </footer>
      </section>

      {showModal && (
        <div className="lesson-modal-backdrop">
          <div className="lesson-modal">
            <h2 className="lesson-modal-title">{L.modal_title}</h2>
            <p className="lesson-modal-body">{L.modal_body}</p>

            <div className="lesson-modal-actions">
              <button
                type="button"
                className="lesson-modal-btn lesson-modal-btn--secondary"
                onClick={handleExitToList}
              >
                {L.modal_back_to_list}
              </button>

              {nextLessonHref && (
                <button
                  type="button"
                  className="lesson-modal-btn lesson-modal-btn--primary"
                  onClick={() => router.push(nextLessonHref)}
                >
                  {L.modal_next_lesson}
                </button>
              )}

              {!nextLessonHref && (
                <button
                  type="button"
                  className="lesson-modal-btn"
                  onClick={() => setShowModal(false)}
                >
                  {L.modal_stay_here}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
