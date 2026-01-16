// src/lib/content/exercises.ts
import { sanityClient } from '@/sanity/lib/client';
import { exercisesByLessonQuery } from '@/sanity/lib/queries';
import type { Locale } from '@/lib/i18n/config';
import { resolveLocalizedString } from './sanityUtils';

// =====================
// Tipi (frontend)
// =====================

export type ExerciseBase = {
  id: string;
  exerciseKey: string;
  order: number;
  type: 'mcq' | 'open' | 'order' | 'match';
  title: string;
  promptBlocks: any[];
  solutionBlocks: any[];    // blocchi della soluzione / spiegazione (Portable Text)
};

export type McqExercise = ExerciseBase & {
  type: 'mcq';
  choices: { id: string; text: string; correct: boolean }[];
};

export type OpenExercise = ExerciseBase & {
  type: 'open';
  answer?: string; // soluzione mostrabile (opzionale)
};

export type OrderExercise = ExerciseBase & {
  type: 'order';
  items: { id: string; text: string }[]; // in ordine CORRETTO
};

export type MatchExercise = ExerciseBase & {
  type: 'match';
  pairs: { id: string; left: string; right: string }[]; // coppie corrette
};

export type Exercise = McqExercise | OpenExercise | OrderExercise | MatchExercise;

type GetExercisesParams = {
  lessonKey: string;
  locale: Locale;
};

// helper: prompt localized portable text
function resolvePromptBlocks(ex: any, locale: Locale): any[] {
  return ex?.prompt?.[locale] ?? ex?.prompt?.it ?? ex?.prompt?.en ?? [];
}

// helper: titolo localized
function resolveTitle(ex: any, locale: Locale): string {
  return (
    resolveLocalizedString(ex?.titleShort, locale) ??
    resolveLocalizedString(ex?.title, locale) ??
    ex?.exerciseKey ??
    'Untitled'
  );
}

// helper: normalizza stringa (scelta/label ecc)
function resolveText(value: any, locale: Locale): string {
  return resolveLocalizedString(value, locale) ?? String(value ?? '');
}

export async function getExercisesForLesson({
  lessonKey,
  locale,
}: GetExercisesParams): Promise<Exercise[]> {
  const raw = await sanityClient.fetch(exercisesByLessonQuery, { lessonKey });

  return (raw ?? []).map((ex: any) => {
    const base: ExerciseBase = {
        id: ex._id,
        exerciseKey: ex.exerciseKey,
        order: ex.order ?? 0,
        type: (ex.exerciseType as ExerciseBase['type']) ?? 'mcq',
        title:
          resolveLocalizedString(ex.title, locale) ??
          ex.exerciseKey,
        // prompt: localized portable text
        promptBlocks:
          ex.prompt?.[locale] ??
          ex.prompt?.it ??
          ex.prompt?.en ??
          [],
        // solution: localized portable text
        solutionBlocks:
          ex.solution?.[locale] ??
          ex.solution?.it ??
          ex.solution?.en ??
          [],
      };

    // ✅ MCQ
    if (base.type === 'mcq') {
      const choices = (ex.choices ?? []).map((c: any) => ({
        id: c._key ?? c.id ?? crypto.randomUUID?.() ?? String(Math.random()),
        text: resolveText(c.text ?? c.choice, locale),
        correct: !!c.correct,
      }));

      const out: McqExercise = { ...base, type: 'mcq', choices };
      return out;
    }

    // ✅ OPEN
    if (base.type === 'open') {
      const out: OpenExercise = {
        ...base,
        type: 'open',
        answer: resolveText(ex.answer, locale) || undefined,
      };
      return out;
    }

    // ✅ ORDER (riordina)
    if (base.type === 'order') {
      const items = (ex.items ?? []).map((it: any) => ({
        id: it._key ?? it.id ?? crypto.randomUUID?.() ?? String(Math.random()),
        text: resolveText(it.text ?? it.item, locale),
      }));

      const out: OrderExercise = { ...base, type: 'order', items };
      return out;
    }

    // ✅ MATCH (abbina)
    if (base.type === 'match') {
      const pairs = (ex.pairs ?? []).map((p: any) => ({
        id: p._key ?? p.id ?? crypto.randomUUID?.() ?? String(Math.random()),
        left: resolveText(p.left, locale),
        right: resolveText(p.right, locale),
      }));

      const out: MatchExercise = { ...base, type: 'match', pairs };
      return out;
    }

    // fallback ultra safe (non dovrebbe mai arrivarci)
    const fallback: McqExercise = { ...base, type: 'mcq', choices: [] };
    return fallback;
  });
}