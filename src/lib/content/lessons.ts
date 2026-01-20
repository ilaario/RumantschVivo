// src/lib/content/lessons.ts

import { sanityClient } from '@/sanity/lib/client';
import { lessonsListQuery, lessonBySlugQuery } from '@/sanity/lib/queries';
import type { Locale } from '@/lib/i18n/config';
import { resolveLocalizedString, resolveLocalizedBlocks } from './sanityUtils';

type ListLessonsParams = {
  level: string;
  locale: Locale;
};

export async function listLessons({ level, locale }: ListLessonsParams) {
  const lessons = await sanityClient.fetch(lessonsListQuery, {
    level,
  });

  return lessons.map((l: any) => ({
    id: l._id,
    lesson_key: l.lessonKey,
    slug: l.slug,
    level: l.level,
    title: resolveLocalizedString(l.title, locale) ?? 'Untitled',
  }));
}

type GetLessonParams = {
  slug: string;
  locale: Locale;
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
};

export type LessonExercise = {
  id: string;
  kind: 'mcq' | 'open';
  prompt: any[]; // <-- IMPORTANT: se prompt è Portable Text
  options: string[];
  answer: string | null;
};

export async function getLesson({ slug, locale }: GetLessonParams): Promise<Lesson | null> {
  const data = await sanityClient.fetch(lessonBySlugQuery, { slug, locale });
  if (!data) return null;

  return {
    id: data._id,
    slug: data.slug,
    lessonKey: data.lessonKey,
    title: resolveLocalizedString(data.title, locale) ?? 'Untitled',
    intro: resolveLocalizedBlocks(data.intro, locale), // ✅ FIX
    body: resolveLocalizedBlocks(data.body, locale), // ✅ FIX
    variant: data.variant ?? null,
    level: data.level ?? null,
    exercises: (data.exercises ?? []).map((ex: any) => ({
      id: ex._id,
      kind: ex.kind ?? 'open',
      prompt: resolveLocalizedBlocks(ex.prompt, locale), // <-- array blocks
      options: ex.options ?? [],
      answer: resolveLocalizedString(ex.answer, locale) ?? null,
    })),
  };
}
