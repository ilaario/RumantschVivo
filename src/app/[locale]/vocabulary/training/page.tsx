// src/app/[locale]/vocabulary/training/page.tsx

import { redirect } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { VocabularyTrainingClient } from './VocabularyTrainingClient';
import '../../../stylesheets/vocabulary-training.css';

type PageParams = {
  locale: Locale;
};

type PageProps = {
  params: Promise<PageParams>; // Next 16 style
};

type VocabRow = {
  id: string;
  term: string;
  translation: string;
  notes?: string | null;
};

type TrainingKind = 'flashcard' | 'mcq' | 'open';

export type TrainingExercise = {
  id: string;
  kind: TrainingKind;
  prompt: string;
  options?: string[];   // solo MCQ
  answer: string;       // risposta corretta (traduzione)
};

// semplice shuffle
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// costruisce un set misto di esercizi da vocab
function buildTrainingExercises(rows: VocabRow[]): TrainingExercise[] {
  const base = rows.filter(
    (r) => r.term && r.translation && r.term.trim() && r.translation.trim(),
  );
  if (base.length === 0) return [];

  const shuffled = shuffle(base);
  const exercises: TrainingExercise[] = [];

  // 1) flashcard: una per parola (limitiamole per non esplodere)
  const maxFlashcards = 30;
  for (const row of shuffled.slice(0, maxFlashcards)) {
    exercises.push({
      id: `fc_${row.id}`,
      kind: 'flashcard',
      prompt: row.term,
      answer: row.translation,
    });
  }

  // 2) MCQ: se abbiamo almeno 4 parole
  if (base.length >= 4) {
    const maxMcq = Math.min(10, base.length);
    const mcqPool = shuffled.slice(0, maxMcq);

    for (const row of mcqPool) {
      // 3 distrattori
      const others = shuffle(base.filter((r) => r.id !== row.id)).slice(0, 3);
      const optionsRaw = [row.translation, ...others.map((o) => o.translation)];
      const options = shuffle(optionsRaw);

      exercises.push({
        id: `mcq_${row.id}`,
        kind: 'mcq',
        prompt: row.term,
        options,
        answer: row.translation,
      });
    }
  }

  // 3) open translation: scrivi la traduzione in italiano
  const maxOpen = Math.min(10, base.length);
  for (const row of shuffled.slice(0, maxOpen)) {
    exercises.push({
      id: `open_${row.id}`,
      kind: 'open',
      prompt: row.term,
      answer: row.translation,
    });
  }

  // shuffle globale, e limitiamo un po' la lunghezza totale
  const mixed = shuffle(exercises);
  return mixed.slice(0, 40);
}

export default async function VocabularyTrainingPage({ params }: PageProps) {
  const { locale } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?redirectTo=/${locale}/vocabulary/training`);
  }

  // TODO: aggiusta nome tabella / colonne in base al tuo schema
  const { data: rows, error } = await supabase
    .from('vocab_entries')
    .select('id, term, translation, notes')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[VocabularyTraining] error loading vocabulary_entries', {
      message: error.message,
      details: (error as any).details,
      hint: (error as any).hint,
      code: (error as any).code,
    });
  }

  const vocabRows = (rows ?? []) as VocabRow[];
  const exercises = buildTrainingExercises(vocabRows);

  return (
    <main className="vt-page">
      <div className="vt-header">
        <h1 className="vt-title">
          {locale === 'it'
            ? 'Allenamento vocabolario'
            : locale === 'fr'
              ? 'Entraînement de vocabulaire'
              : locale === 'de'
                ? 'Vokabeltraining'
                : 'Vocabulary training'}
        </h1>
        <p className="vt-subtitle">
          {locale === 'it'
            ? 'Allena le parole che hai salvato: flashcard, scelte multiple e traduzioni.'
            : locale === 'fr'
              ? 'Entraîne les mots que tu as enregistrés : flashcards, QCM et traductions.'
              : locale === 'de'
                ? 'Trainiere die Wörter, die du gespeichert hast: Flashcards, Multiple Choice und Übersetzungen.'
                : 'Practice the words you saved: flashcards, multiple choice and translations.'}
        </p>
      </div>

      {exercises.length === 0 ? (
        <div className="vt-empty">
          {locale === 'it'
            ? 'Per iniziare ad allenarti, aggiungi prima qualche parola nella pagina Vocabulary.'
            : locale === 'fr'
              ? 'Pour commencer, ajoute d’abord quelques mots sur la page Vocabulary.'
              : locale === 'de'
                ? 'Um zu starten, füge zuerst ein paar Wörter auf der Vocabulary-Seite hinzu.'
                : 'To start training, add some words first in the Vocabulary page.'}
        </div>
      ) : (
        <VocabularyTrainingClient locale={locale} exercises={exercises} />
      )}
    </main>
  );
}