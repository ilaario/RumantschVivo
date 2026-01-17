'use client';

import { useState } from 'react';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { Exercise } from '@/lib/content/exercises';
import type { Locale } from '@/lib/i18n/config';

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

// Mini dizionario UI
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
  },
} as const;

type Props = {
  exercises: Exercise[];
  locale: Locale;
};

function normalizeAnswer(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function LessonExercises({ exercises, locale }: Props) {
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openAnswer, setOpenAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  if (!exercises || exercises.length === 0) return null;

  // fallback: se esiste solo it/en, usa it come default
  const L = locale in ui ? ui[locale as 'it' | 'en'] : ui.it;

  const current = exercises[index];
  const isLast = index === exercises.length - 1;
  const isMcq = current.type === 'mcq';
  const isOpen = current.type === 'open';

  const selectedChoice =
    isMcq && current.choices
      ? current.choices.find((c) => c.id === selectedId) ?? null
      : null;

  const canConfirm = (() => {
    if (isMcq) {
      return selectedId !== null && status === 'idle';
    }
    if (isOpen) {
      return openAnswer.trim().length > 0 && status === 'idle';
    }
    return status === 'idle';
  })();

  function handleSelect(choiceId: string) {
    if (!isMcq) return;
    if (status !== 'idle') return;
    setSelectedId(choiceId);
  }

  function handleConfirm() {
    if (isMcq) {
      if (!selectedChoice) return;
      const ok = !!selectedChoice.correct;
      setStatus(ok ? 'correct' : 'wrong');
      return;
    }

    if (isOpen) {
      if (!current.expectedAnswer) {
        // niente expectedAnswer: non rompiamo
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

  function handleNext() {
    if (isLast) return;
    setIndex((prev) => prev + 1);
    setSelectedId(null);
    setOpenAnswer('');
    setStatus('idle');
  }

  return (
    <section className="lesson-exercises">
      <header className="lesson-ex-header">
        <div className="lesson-ex-label">{L.exercisesLabel}</div>
        <div className="lesson-ex-progress">
          {L.exerciseOf(index + 1, exercises.length)}
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

        {/* ========= MCQ ========= */}
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

        {/* ========= OPEN ========= */}
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

                {current.solutionBlocks && current.solutionBlocks.length > 0 && (
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

        {/* ========= FEEDBACK GENERICO PER MCQ ========= */}
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
          disabled={status === 'idle' || isLast}
          onClick={handleNext}
        >
          {isLast ? L.finish : L.next}
        </button>
      </footer>
    </section>
  );
}