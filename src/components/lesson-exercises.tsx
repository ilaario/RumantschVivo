'use client';

import { useState } from 'react';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { Exercise } from '@/lib/content/exercises';

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

type Props = {
  exercises: Exercise[];
};

export function LessonExercises({ exercises }: Props) {
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openAnswer, setOpenAnswer] = useState(''); // testo scritto dall'utente negli open
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  if (!exercises || exercises.length === 0) return null;

  const current = exercises[index];
  const isLast = index === exercises.length - 1;
  const isMcq = current.type === 'mcq';

  // MCQ: scelta selezionata
  const selectedChoice =
    isMcq && current.choices
      ? current.choices.find((c) => c.id === selectedId) ?? null
      : null;

  // Quando posso premere "Conferma"?
  const canConfirm = isMcq
    ? selectedId !== null && status === 'idle'
    : status === 'idle';

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

    // OPEN / ORDERING:
    // per ora "Conferma" serve solo a mostrare una soluzione / spiegazione
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
        <div className="lesson-ex-label">ESERCIZI</div>
        <div className="lesson-ex-progress">
          Esercizio {index + 1} di {exercises.length}
        </div>
      </header>

      <div className="lesson-ex-body">
        {/* Titolo breve / chiave esercizio */}
        <p className="lesson-ex-prompt-title">
          <strong>{current.title}</strong>
        </p>

        {/* Testo prompt (PortableText) */}
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
              const isCorrect =
                status !== 'idle' && choice.correct;
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
        {current.type === 'open' && (
          <div className="lesson-ex-open">
            <p className="lesson-ex-open-hint">
              Scrivi la tua risposta, poi premi &quot;Conferma&quot; per vedere una soluzione suggerita.
            </p>

            <textarea
              className="lesson-ex-open-input"
              rows={4}
              placeholder="Scrivi qui la tua risposta…"
              value={openAnswer}
              onChange={(e) => setOpenAnswer(e.target.value)}
            />

            {status !== 'idle' && current.solutionBlocks.length > 0 && (
              <div className="lesson-ex-answer">
                <span className="lesson-ex-answer-label">
                  Soluzione suggerita:
                </span>
                <div className="lesson-ex-answer-text">
                  <PortableText value={current.solutionBlocks} components={components} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========= ORDERING ========= */}
        {current.type === 'order' && (
          <div className="lesson-ex-order">
            <p className="lesson-ex-open-hint">
              Prova a mettere mentalmente in ordine / abbinare gli elementi. In futuro diventerà
              un esercizio interattivo, per ora usa &quot;Conferma&quot; per vedere una soluzione.
            </p>

            {status !== 'idle' && current.solutionBlocks.length > 0 && (
              <div className="lesson-ex-answer">
                <span className="lesson-ex-answer-label">
                  Soluzione suggerita:
                </span>
                <div className="lesson-ex-answer-text">
                  <PortableText value={current.solutionBlocks} components={components} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========= FEEDBACK GENERICO PER MCQ ========= */}
        {isMcq && status !== 'idle' && (
          <div className="lesson-ex-answer">
            {status === 'correct' ? (
              <>
                <span className="lesson-ex-answer-label">Corretto!</span>
                <span> Ottimo lavoro.</span>
              </>
            ) : (
              <>
                <span className="lesson-ex-answer-label">
                  Risposta sbagliata.
                </span>
                <span> Prova a riguardare la lezione o gli esempi sopra.</span>
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
          Conferma
        </button>

        <button
          type="button"
          className="lesson-ex-btn lesson-ex-btn--primary"
          disabled={status === 'idle' || isLast}
          onClick={handleNext}
        >
          {isLast ? 'Fine' : 'Avanti'}
        </button>
      </footer>
    </section>
  );
}