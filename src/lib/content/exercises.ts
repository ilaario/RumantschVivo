// src/lib/content/exercises.ts
import { sanityClient } from '@/sanity/lib/client';
import { exercisesByLessonQuery } from '@/sanity/lib/queries';
import type { Locale } from '@/lib/i18n/config';
import { resolveLocalizedString } from './sanityUtils';

// ====== TYPES ======

export type ExerciseChoice = {
  id: string;
  text: string;
  correct: boolean;
};

export type Exercise = {
  id: string;
  exerciseKey: string;
  order: number;
  type: 'mcq' | 'open';
  title: string;

  // comune a tutti: consegna / testo
  promptBlocks: any[];

  // MCQ
  choices: ExerciseChoice[];

  // OPEN
  expectedAnswer: string | null;
  // soluzione / spiegazione (per open, e in futuro se vuoi per altro)
  solutionBlocks: any[];
};

// ====== FETCH ======

type GetExercisesParams = {
  lessonKey: string;
  locale: Locale;
};

export async function getExercisesForLesson({
  lessonKey,
  locale,
}: GetExercisesParams): Promise<Exercise[]> {
  const raw = await sanityClient.fetch(exercisesByLessonQuery, { lessonKey });

  // forza sempre un array, anche se Sanity torna null / oggetto singolo
  const list = Array.isArray(raw) ? raw : [];

  return list.map((ex: any): Exercise => {
    // solo 'mcq' o 'open', default mcq se manca / sbagliato
    const type: 'mcq' | 'open' = ex.type === 'open' ? 'open' : 'mcq';

    // prompt (portable text localizzato)
    const promptBlocks = ex.prompt?.[locale] ?? ex.prompt?.it ?? ex.prompt?.en ?? [];

    // soluzione (solo per open, ma la normalizziamo sempre come array)
    const solutionBlocks = ex.solution?.[locale] ?? ex.solution?.it ?? ex.solution?.en ?? [];

    // MCQ choices
    const choices: ExerciseChoice[] =
      type === 'mcq'
        ? (ex.choices ?? []).map((c: any) => ({
            id: c._key,
            text: resolveLocalizedString(c.text, locale) ?? '',
            correct: !!c.correct,
          }))
        : [];

    // OPEN expected answer
    const expectedAnswer: string | null =
      type === 'open' ? (resolveLocalizedString(ex.expectedAnswer, locale) ?? null) : null;

    return {
      id: ex._id,
      exerciseKey: ex.exerciseKey,
      order: ex.order ?? 0,
      type,
      title: resolveLocalizedString(ex.title, locale) ?? ex.exerciseKey,
      promptBlocks,
      choices,
      expectedAnswer,
      solutionBlocks,
    };
  });
}
