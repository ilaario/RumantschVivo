// src/lib/content/exercises.ts

import { sanityClient } from '@/sanity/lib/client';
import type { Locale } from '@/lib/i18n/config';
import { resolveLocalizedString, resolveLocalizedBlocks } from './sanityUtils';
import { groq } from 'next-sanity';

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

  // consegna / testo (Portable Text)
  promptBlocks: any[];

  // MCQ
  choices: ExerciseChoice[];

  // OPEN
  expectedAnswer: string | null;
  solutionBlocks: any[];
};

// ====== HELPERS ======

function safeArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function safeNumber(v: unknown, fallback = 0): number {
  return typeof v === 'number' ? v : fallback;
}

function safeString(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length ? v : null;
}

// pick traduzione se presente, altrimenti base
function pick<T>(baseVal: T, trVal: T | undefined | null): T {
  return (trVal ?? baseVal) as T;
}

// ====== GROQ ======

/**
 * Prende tutti gli exerciseBase collegati a una lezione
 * (via reference: lesson->lessonKey == $lessonKey)
 * e per ognuno attacca la traduzione corrispondente al locale.
 *
 * Assunzioni sullo schema:
 * - exerciseBase:
 *    _type == "exerciseBase"
 *    fields: exerciseKey (string), order (number), type ("mcq" | "open"),
 *            lesson (ref a lessonBase),
 *            title, prompt, choices, expectedAnswer, solution
 * - exerciseTranslation:
 *    _type == "exerciseTranslation"
 *    fields: exercise (ref a exerciseBase), locale (string),
 *            title, prompt, choices, expectedAnswer, solution
 */
const exercisesByLessonQuery = groq`
  *[_type == "exerciseBase" && lesson->lessonKey == $lessonKey]
  | order(order asc, exerciseKey asc) {
    _id,
    exerciseKey,
    order,
    type,
    title,
    prompt,
    choices,
    expectedAnswer,
    solution,
    "translation": *[
      _type == "exerciseTranslation" &&
      exercise._ref == ^._id &&
      locale == $locale
    ][0]{
      title,
      prompt,
      choices,
      expectedAnswer,
      solution
    }
  }
`;

// ====== API ======

type GetExercisesParams = {
  lessonKey: string;
  locale: Locale;
};

export async function getExercisesForLesson({
  lessonKey,
  locale,
}: GetExercisesParams): Promise<Exercise[]> {
  const raw = await sanityClient.fetch<any[]>(exercisesByLessonQuery, {
    lessonKey,
    locale,
  });

  const list = safeArray<any>(raw);

  return list.map((ex): Exercise => {
    const baseType = safeString(ex.type);
    const type: 'mcq' | 'open' = baseType === 'open' ? 'open' : 'mcq';

    const tr = ex.translation ?? {};

    // ===== title =====
    const titleRaw = pick(ex.title, tr.title);
    const title =
      resolveLocalizedString(titleRaw, locale) ??
      safeString(titleRaw) ??
      'Untitled exercise';

    // ===== prompt / solution (Portable Text) =====
    const promptRaw = pick(ex.prompt, tr.prompt);
    const solutionRaw = pick(ex.solution, tr.solution);

    const promptBlocks = resolveLocalizedBlocks(promptRaw, locale);
    const solutionBlocks = resolveLocalizedBlocks(solutionRaw, locale);

    // ===== choices (MCQ) =====
    const choicesSource = pick(ex.choices, tr.choices);
    const choices: ExerciseChoice[] =
      type === 'mcq'
        ? safeArray<any>(choicesSource).map((c): ExerciseChoice => {
            const textRaw = c.text;
            const text =
              resolveLocalizedString(textRaw, locale) ??
              safeString(textRaw) ??
              '';
            return {
              id: safeString(c.id) ?? safeString(c._key) ?? '',
              text,
              correct: !!c.correct,
            };
          })
        : [];

    // ===== expectedAnswer (OPEN) =====
    const expectedRaw = pick(ex.expectedAnswer, tr.expectedAnswer);
    const expectedResolved =
      resolveLocalizedString(expectedRaw, locale) ?? safeString(expectedRaw);
    const expectedAnswer: string | null =
      type === 'open' ? expectedResolved ?? null : null;

    return {
      id: ex._id,
      exerciseKey: safeString(ex.exerciseKey) ?? 'unknown',
      order: safeNumber(ex.order, 0),
      type,
      title,
      promptBlocks,
      choices,
      expectedAnswer,
      solutionBlocks,
    };
  });
}