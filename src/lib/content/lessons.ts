// src/lib/content/lessons.ts

import { sanityClient } from '@/sanity/lib/client';
import type { Locale } from '@/lib/i18n/config';
import { resolveLocalizedString, resolveLocalizedBlocks } from './sanityUtils';
import { groq } from 'next-sanity';

type ListLessonsParams = {
  level: string;
  locale: Locale;
};

type GetLessonParams = {
  slug: string;
  locale: Locale;
};

export type LessonListItem = {
  id: string;
  lesson_key: string;
  slug: string;
  level?: string | null;
  variant?: string | null;
  title: string;
  goals: string[];
};

export type LessonExercise = {
  id: string;
  kind: 'mcq' | 'open';
  prompt: any[];
  options: string[];
  answer: string | null;
};

export type Lesson = {
  id: string;
  slug: string;
  lessonKey: string;
  title: string;
  intro: any[];
  body: any[];
  variant?: string | null;
  level?: string | null;
  exercises: LessonExercise[];
  goals: string[];
};

// --------------------
// GROQ
// --------------------

// LIST: base + translation per locale
// Nota: slug nel tuo schema è STRING.
const lessonsListQuery = groq`
  *[_type == "lessonBase" && level == $level]
  | order(order asc, lessonKey asc) {
    _id,
    lessonKey,
    level,
    variant,
    slug,
    title,
    goals,

    "tr": *[
      _type == "lessonTranslation" &&
      lesson._ref == ^._id &&
      locale == $locale
    ][0]{
      title,
      goals
    }
  }
`;

// GET: base + translation per locale
const lessonBySlugQuery = groq`
  *[_type == "lessonBase" && slug == $slug][0]{
    _id,
    lessonKey,
    level,
    variant,
    slug,
    title,
    goals,
    intro,
    body,

    "tr": *[
      _type == "lessonTranslation" &&
      lesson._ref == ^._id &&
      locale == $locale
    ][0]{
      title,
      goals,
      intro,
      body
    },

    "exercises": exercises[]->{
      _id,
      kind,
      prompt,
      options,
      answer
    }
  }
`;

// --------------------
// HELPERS
// --------------------

function safeString(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length ? v : null;
}

function safeArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

// Pick translation field if present, else base field
function pick<T>(baseVal: T, trVal: T | undefined | null): T {
  return (trVal ?? baseVal) as T;
}

// --------------------
// API
// --------------------

export async function listLessons({
  level,
  locale,
}: ListLessonsParams): Promise<LessonListItem[]> {
  const rows = await sanityClient.fetch<any[]>(lessonsListQuery, {
    level,
    locale, // IMPORTANT: ora serve
  });

  return safeArray<any>(rows).map((l) => {
    const tr = l.tr ?? null;

    const titleRaw = pick(l.title, tr?.title);
    const goalsRaw = pick(l.goals, tr?.goals);

    return {
      id: l._id,
      lesson_key: safeString(l.lessonKey) ?? 'unknown',
      slug: safeString(l.slug) ?? '',
      level: safeString(l.level),
      variant: safeString(l.variant),
      title: resolveLocalizedString(titleRaw, locale) ?? 'Untitled',
      goals: safeArray<string>(goalsRaw),
    };
  });
}

export async function getLesson({
  slug,
  locale,
}: GetLessonParams): Promise<Lesson | null> {
  const data = await sanityClient.fetch<any>(lessonBySlugQuery, {
    slug,
    locale, // IMPORTANT: ora serve
  });

  if (!data?._id) return null;

  const tr = data.tr ?? null;

  // fallback base -> translation
  const titleRaw = pick(data.title, tr?.title);
  const introRaw = pick(data.intro, tr?.intro);
  const bodyRaw = pick(data.body, tr?.body);
  const goalsRaw = pick(data.goals, tr?.goals);

  const exercisesRaw = safeArray<any>(data.exercises);

  return {
    id: data._id,
    slug: safeString(data.slug) ?? slug,
    lessonKey: safeString(data.lessonKey) ?? 'unknown',
    title: resolveLocalizedString(titleRaw, locale) ?? 'Untitled',
    intro: resolveLocalizedBlocks(introRaw, locale),
    body: resolveLocalizedBlocks(bodyRaw, locale),
    goals: safeArray<string>(goalsRaw),
    variant: safeString(data.variant),
    level: safeString(data.level),
    exercises: exercisesRaw.map((ex) => ({
      id: ex._id,
      kind: ex.kind === 'mcq' ? 'mcq' : 'open',
      prompt: resolveLocalizedBlocks(ex.prompt, locale),
      options: safeArray<string>(ex.options),
      answer: resolveLocalizedString(ex.answer, locale),
    })),
  };
}