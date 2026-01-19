'use client';

import {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { Exercise } from '@/lib/content/exercises';
import type { Locale } from '@/lib/i18n/config';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h1 className="lesson-h1">{children}</h1>,
    h2: ({ children }) => <h2 className="lesson-h2">{children}</h2>,
    h3: ({ children }) => <h3 className="lesson-h3">{children}</h3>,
    normal: ({ children }) => <p className="lesson-p">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="lesson-quote">{children}</blockquote>
    ),
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

const ui = {
  it: {
    exercisesLabel: 'ESERCIZI',
    exerciseOf: (i: number, total: number) => `Esercizio ${i} di ${total}`,
    openHint:
      'Scrivi la tua risposta, poi premi "Conferma" per vedere se coincide con la soluzione prevista.',
    openCorrectTitle: 'Corretto!',
    openCorrectBody: 'La tua risposta coincide con quella attesa.',
    openWrongTitle: 'Risposta diversa.',
    openWrongBody: 'Qui sotto trovi una possibile soluzione.',
    expectedLabel: 'Risposta attesa:',
    mcqCorrectTitle: 'Corretto!',
    mcqCorrectBody: 'Ottimo lavoro.',
    mcqWrongTitle: 'Risposta sbagliata.',
    mcqWrongBody: 'Prova a riguardare la lezione o gli esempi sopra.',
    confirm: 'Conferma',
    next: 'Avanti',
    finish: 'Fine',
    textareaPlaceholder: 'Scrivi qui la tua risposta…',
    completedBanner: 'Lezione completata! ✅',
    modalTitle: 'Lezione completata 🎉',
    modalBody:
      'Hai completato tutti gli esercizi di questa lezione. Cosa vuoi fare adesso?',
    modalBackToList: 'Torna alla lista delle lezioni',
    modalNextLesson: 'Prossima lezione',
    modalStayHere: 'Rimani su questa lezione',
    backToListInline: 'Torna alla lista',
  },
  en: {
    exercisesLabel: 'EXERCISES',
    exerciseOf: (i: number, total: number) => `Exercise ${i} of ${total}`,
    openHint:
      'Write your answer, then press "Confirm" to see if it matches the expected solution.',
    openCorrectTitle: 'Correct!',
    openCorrectBody: 'Your answer matches the expected one.',
    openWrongTitle: 'Different answer.',
    openWrongBody: 'Below you can see a suggested solution.',
    expectedLabel: 'Expected answer:',
    mcqCorrectTitle: 'Correct!',
    mcqCorrectBody: 'Nice job.',
    mcqWrongTitle: 'Wrong answer.',
    mcqWrongBody: 'Try reviewing the lesson or the examples above.',
    confirm: 'Confirm',
    next: 'Next',
    finish: 'Finish',
    textareaPlaceholder: 'Write your answer here…',
    completedBanner: 'Lesson completed! ✅',
    modalTitle: 'Lesson completed 🎉',
    modalBody:
      'You have completed all the exercises for this lesson. What would you like to do now?',
    modalBackToList: 'Back to lesson list',
    modalNextLesson: 'Next lesson',
    modalStayHere: 'Stay on this lesson',
    backToListInline: 'Back to list',
  },
} as const;

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

  const L = locale in ui ? ui[locale as 'it' | 'en'] : ui.it;
  const current = exercises[index];
  const isLast = index === exercises.length - 1;
  const isMcq = current.type === 'mcq';
  const isOpen = current.type === 'open';

  const supabase: SupabaseClient | null = useMemo(() => {
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn(
        '[LessonExercises] Missing Supabase env vars. Progress will not be saved.',
      );
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

        const { error } = await supabase
        .from('lesson_progress')
        .upsert(
          {
            user_id: user.id,
            lesson_key: lessonKey,
            // locale viene comunque aggiornato all'ultimo usato
            locale,
            current_index: newIndex,
            completed: isCompleted,
            updated_at: new Date().toISOString(),
          },
          {
            // <<< QUI LA PARTE IMPORTANTE
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
    isMcq && current.choices
      ? current.choices.find((c) => c.id === selectedId) ?? null
      : null;

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
        // best-effort, non aspettiamo
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
          <div className="lesson-ex-label">{L.exercisesLabel}</div>
          <div className="lesson-ex-progress">
            {L.exerciseOf(index + 1, exercises.length)}
          </div>
        </header>

        <div className="lesson-ex-body">
          {completed && (
            <div className="lesson-ex-completed-banner">
              {L.completedBanner}
            </div>
          )}

          <p className="lesson-ex-prompt-title">
            <strong>{current.title}</strong>
          </p>

          {current.promptBlocks && current.promptBlocks.length > 0 && (
            <div className="lesson-ex-prompt">
              <PortableText
                value={current.promptBlocks}
                components={components}
              />
            </div>
          )}

          {isMcq && current.choices.length > 0 && (
            <ul className="lesson-ex-options">
              {current.choices.map((choice) => {
                const isSelected = choice.id === selectedId;
                const isCorrect = status !== 'idle' && choice.correct;
                const isWrongSelected =
                  status === 'wrong' && isSelected && !choice.correct;

                let className = 'lesson-ex-option';
                if (isSelected) className += ' is-selected';
                if (isCorrect) className += ' is-correct';
                if (isWrongSelected) className += ' is-wrong';

                return (
                  <li
                    key={choice.id}
                    className={className}
                    onClick={() => handleSelect(choice.id)}
                  >
                    {choice.text}
                  </li>
                );
              })}
            </ul>
          )}

          {isOpen && (
            <div className="lesson-ex-open">
              <p className="lesson-ex-open-hint">{L.openHint}</p>

              <textarea
                className="lesson-ex-open-input"
                rows={4}
                placeholder={L.textareaPlaceholder}
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
                      <span className="lesson-ex-answer-label">
                        {L.openCorrectTitle}
                      </span>
                      <span> {L.openCorrectBody}</span>
                    </>
                  ) : (
                    <>
                      <span className="lesson-ex-answer-label">
                        {L.openWrongTitle}
                      </span>
                      <span> {L.openWrongBody}</span>
                    </>
                  )}

                  {current.solutionBlocks &&
                    current.solutionBlocks.length > 0 && (
                      <div className="lesson-ex-answer-text">
                        <PortableText
                          value={current.solutionBlocks}
                          components={components}
                        />
                      </div>
                    )}

                  {current.expectedAnswer && (
                    <p className="lesson-ex-expected">
                      <span className="lesson-ex-expected-label">
                        {L.expectedLabel}
                      </span>{' '}
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
                  <span className="lesson-ex-answer-label">
                    {L.mcqCorrectTitle}
                  </span>
                  <span> {L.mcqCorrectBody}</span>
                </>
              ) : (
                <>
                  <span className="lesson-ex-answer-label">
                    {L.mcqWrongTitle}
                  </span>
                  <span> {L.mcqWrongBody}</span>
                </>
              )}
            </div>
          )}
        </div>

        <footer className="lesson-ex-footer">
          {/* nuovo bottone "torna alla lista" */}
          <button
            type="button"
            className="lesson-ex-btn lesson-ex-btn--ghost lesson-ex-btn--back"
            onClick={handleExitToList}
          >
            {L.backToListInline}
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
            <h2 className="lesson-modal-title">{L.modalTitle}</h2>
            <p className="lesson-modal-body">{L.modalBody}</p>

            <div className="lesson-modal-actions">
              <button
                type="button"
                className="lesson-modal-btn lesson-modal-btn--secondary"
                onClick={handleExitToList}
              >
                {L.modalBackToList}
              </button>

              {nextLessonHref && (
                <button
                  type="button"
                  className="lesson-modal-btn lesson-modal-btn--primary"
                  onClick={() => router.push(nextLessonHref)}
                >
                  {L.modalNextLesson}
                </button>
              )}

              {!nextLessonHref && (
                <button
                  type="button"
                  className="lesson-modal-btn"
                  onClick={() => setShowModal(false)}
                >
                  {L.modalStayHere}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}