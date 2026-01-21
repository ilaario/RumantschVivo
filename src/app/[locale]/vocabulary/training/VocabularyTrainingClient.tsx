// src/app/[locale]/vocabulary/training/VocabularyTrainingClient.tsx

'use client';

import { useMemo, useState } from 'react';
import type { Locale } from '@/lib/i18n/config';
import type { TrainingExercise } from './page';

type Props = {
  locale: Locale;
  exercises: TrainingExercise[];
};

function normalizeAnswer(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function VocabularyTrainingClient({ locale, exercises }: Props) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [showFlashAnswer, setShowFlashAnswer] = useState(false);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [openAnswer, setOpenAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const [correctCount, setCorrectCount] = useState(0);

  const current = exercises[index];
  const isLast = index === exercises.length - 1;

  const texts = useMemo(() => {
    if (locale === 'it') {
      return {
        start: 'Inizia allenamento',
        progress: '{i} di {total}',
        flash_show: 'Mostra traduzione',
        flash_hide: 'Nascondi traduzione',
        next: 'Avanti',
        finish: 'Fine',
        mcq_confirm: 'Conferma',
        open_placeholder: 'Scrivi la traduzione in italiano…',
        open_correct: 'Corretto!',
        open_wrong: 'Non è proprio questo…',
        mcq_correct: 'Risposta corretta!',
        mcq_wrong: 'Risposta sbagliata.',
        expected_label: 'Traduzione attesa:',
        result_title: 'Allenamento completato',
        result_body:
          'Hai completato questo giro di allenamento. Puoi ricaricare la pagina per generare un nuovo set di esercizi.',
        score_label: 'Risposte corrette:',
      };
    }

    if (locale === 'fr') {
      return {
        start: 'Commencer l’entraînement',
        progress: '{i} sur {total}',
        flash_show: 'Afficher la traduction',
        flash_hide: 'Masquer la traduction',
        next: 'Suivant',
        finish: 'Terminer',
        mcq_confirm: 'Confirmer',
        open_placeholder: 'Écris la traduction en italien…',
        open_correct: 'Correct !',
        open_wrong: 'Ce n’est pas tout à fait ça…',
        mcq_correct: 'Bonne réponse !',
        mcq_wrong: 'Mauvaise réponse.',
        expected_label: 'Traduction attendue :',
        result_title: 'Entraînement terminé',
        result_body:
          'Tu as terminé cette session. Recharge la page pour générer un nouveau set d’exercices.',
        score_label: 'Réponses correctes :',
      };
    }

    if (locale === 'de') {
      return {
        start: 'Training starten',
        progress: '{i} von {total}',
        flash_show: 'Übersetzung anzeigen',
        flash_hide: 'Übersetzung ausblenden',
        next: 'Weiter',
        finish: 'Fertig',
        mcq_confirm: 'Bestätigen',
        open_placeholder: 'Schreibe die Übersetzung auf Italienisch…',
        open_correct: 'Richtig!',
        open_wrong: 'Nicht ganz richtig…',
        mcq_correct: 'Richtige Antwort!',
        mcq_wrong: 'Falsche Antwort.',
        expected_label: 'Erwartete Übersetzung:',
        result_title: 'Training abgeschlossen',
        result_body:
          'Du hast diese Trainingseinheit abgeschlossen. Lade die Seite neu, um ein neues Set von Übungen zu erzeugen.',
        score_label: 'Richtige Antworten:',
      };
    }

    return {
      start: 'Start training',
      progress: '{i} of {total}',
      flash_show: 'Show translation',
      flash_hide: 'Hide translation',
      next: 'Next',
      finish: 'Finish',
      mcq_confirm: 'Confirm',
      open_placeholder: 'Write the translation in Italian…',
      open_correct: 'Correct!',
      open_wrong: 'Not quite there…',
      mcq_correct: 'Correct answer!',
      mcq_wrong: 'Wrong answer.',
      expected_label: 'Expected translation:',
      result_title: 'Training completed',
      result_body:
        'You completed this training round. Reload the page to generate a new set of exercises.',
      score_label: 'Correct answers:',
    };
  }, [locale]);

  function fmt(template: string, vars: Record<string, string | number>) {
    return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
  }

  if (!started) {
    return (
      <section className="vt-box vt-box--centered">
        <p className="vt-intro">
          {locale === 'it'
            ? 'Questo allenamento usa le parole che hai salvato nella pagina Vocabulary.'
            : locale === 'fr'
              ? 'Cet entraînement utilise les mots que tu as enregistrés dans la page Vocabulary.'
              : locale === 'de'
                ? 'Dieses Training verwendet die Wörter, die du in der Vocabulary-Seite gespeichert hast.'
                : 'This training uses the words you saved in the Vocabulary page.'}
        </p>
        <button
          type="button"
          className="vt-btn vt-btn--primary"
          onClick={() => setStarted(true)}
        >
          {texts.start}
        </button>
      </section>
    );
  }

  // training finito
  if (index >= exercises.length) {
    return (
      <section className="vt-box vt-box--centered">
        <h2 className="vt-result-title">{texts.result_title}</h2>
        <p className="vt-result-body">{texts.result_body}</p>
        <p className="vt-result-score">
          {texts.score_label} {correctCount} / {exercises.length}
        </p>
      </section>
    );
  }

  const isFlash = current.kind === 'flashcard';
  const isMcq = current.kind === 'mcq';
  const isOpen = current.kind === 'open';

  const canConfirm =
    !isFlash &&
    status === 'idle' &&
    ((isMcq && selectedOption !== null) ||
      (isOpen && openAnswer.trim().length > 0));

  const showNextButton = isFlash || status !== 'idle';

  function handleConfirm() {
    if (isFlash) return;
    if (status !== 'idle') return;

    if (isMcq) {
      if (!selectedOption) return;
      const ok =
        normalizeAnswer(selectedOption) === normalizeAnswer(current.answer);
      setStatus(ok ? 'correct' : 'wrong');
      if (ok) setCorrectCount((c) => c + 1);
      return;
    }

    if (isOpen) {
      const given = normalizeAnswer(openAnswer);
      const expected = normalizeAnswer(current.answer);
      const ok = !!given && given === expected;
      setStatus(ok ? 'correct' : 'wrong');
      if (ok) setCorrectCount((c) => c + 1);
      return;
    }
  }

  function handleNext() {
    // reset stato
    setShowFlashAnswer(false);
    setSelectedOption(null);
    setOpenAnswer('');
    setStatus('idle');
    setIndex((i) => i + 1);
  }

  return (
    <section className="vt-box">
      {/* progress */}
      <header className="vt-header-row">
        <span className="vt-progress">
          {fmt(texts.progress, {
            i: index + 1,
            total: exercises.length,
          })}
        </span>
        <span className="vt-kind">
          {isFlash
            ? 'Flashcard'
            : isMcq
              ? 'MCQ'
              : locale === 'it'
                ? 'Traduzione'
                : 'Translation'}
        </span>
      </header>

      {/* prompt */}
      <div className="vt-prompt">
        <span className="vt-prompt-word">{current.prompt}</span>
      </div>

      {/* contenuto in base al tipo */}
      {isFlash && (
        <div className="vt-flashcard-area">
          <button
            type="button"
            className="vt-btn vt-btn--ghost"
            onClick={() => setShowFlashAnswer((v) => !v)}
          >
            {showFlashAnswer ? texts.flash_hide : texts.flash_show}
          </button>

          {showFlashAnswer && (
            <p className="vt-flash-answer">{current.answer}</p>
          )}
        </div>
      )}

      {isMcq && current.options && (
        <ul className="vt-mcq-list">
          {current.options.map((opt) => {
            const isSelected = selectedOption === opt;
            const isCorrect =
              status !== 'idle' &&
              normalizeAnswer(opt) === normalizeAnswer(current.answer);
            const isWrongSelected =
              status === 'wrong' &&
              isSelected &&
              normalizeAnswer(opt) !== normalizeAnswer(current.answer);

            let cls = 'vt-mcq-option';
            if (isSelected) cls += ' vt-mcq-option--selected';
            if (isCorrect) cls += ' vt-mcq-option--correct';
            if (isWrongSelected) cls += ' vt-mcq-option--wrong';

            return (
              <li
                key={opt}
                className={cls}
                onClick={() => {
                  if (status !== 'idle') return;
                  setSelectedOption(opt);
                }}
              >
                {opt}
              </li>
            );
          })}
        </ul>
      )}

      {isOpen && (
        <div className="vt-open-area">
          <textarea
            className="vt-open-input"
            rows={3}
            placeholder={texts.open_placeholder}
            value={openAnswer}
            onChange={(e) => {
              setOpenAnswer(e.target.value);
              if (status !== 'idle') setStatus('idle');
            }}
          />
          {status !== 'idle' && (
            <div className="vt-feedback">
              <p className="vt-feedback-line">
                {status === 'correct' ? texts.open_correct : texts.open_wrong}
              </p>
              <p className="vt-expected">
                <span className="vt-expected-label">
                  {texts.expected_label}
                </span>{' '}
                {current.answer}
              </p>
            </div>
          )}
        </div>
      )}

      {/* feedback per MCQ */}
      {isMcq && status !== 'idle' && (
        <div className="vt-feedback">
          <p className="vt-feedback-line">
            {status === 'correct' ? texts.mcq_correct : texts.mcq_wrong}
          </p>
          {status === 'wrong' && (
            <p className="vt-expected">
              <span className="vt-expected-label">
                {texts.expected_label}
              </span>{' '}
              {current.answer}
            </p>
          )}
        </div>
      )}

      {/* footer bottoni */}
      <footer className="vt-footer">
        {!isFlash && (
          <button
            type="button"
            className="vt-btn vt-btn--ghost"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {texts.mcq_confirm}
          </button>
        )}

        {showNextButton && (
          <button
            type="button"
            className="vt-btn vt-btn--primary"
            onClick={handleNext}
          >
            {isLast ? texts.finish : texts.next}
          </button>
        )}
      </footer>
    </section>
  );
}