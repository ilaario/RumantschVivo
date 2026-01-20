import { sanityClient } from '@/sanity/lib/client';
import type { Locale } from '@/lib/i18n/config';
import { resolveLocalizedBlocks, resolveLocalizedString } from './sanityUtils';
import { groq } from 'next-sanity';
import type { Exercise } from './exercises';
import { getExercisesByKeys } from './exercises';

function safeString(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length ? v : null;
}
function safeNumber(v: unknown, fallback = 0): number {
  return typeof v === 'number' ? v : fallback;
}
function safeArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export type Checkpoint = {
  id: string;
  checkpointKey: string;
  slug: string;
  level: string;
  minScore: number;

  title: string;
  introBlocks: any[];
  outroPassBlocks: any[];
  outroFailBlocks: any[];

  exercises: Exercise[];
};

const checkpointBySlugQuery = groq`
  *[_type == "checkpointBase" && slug.current == $slug][0]{
    _id,
    checkpointKey,
    level,
    minScore,
    "slug": slug.current,

    "translation": *[
      _type == "checkpointTranslation" &&
      checkpoint._ref == ^._id &&
      locale == $locale
    ][0]{
      title,
      intro,
      outroPass,
      outroFail
    },

    "exerciseKeys": exercises[]->exerciseKey
  }
`;

export async function getCheckpointBySlug(params: {
  slug: string;
  locale: Locale;
}): Promise<Checkpoint | null> {
  const { slug, locale } = params;

  const data = await sanityClient.fetch<any>(checkpointBySlugQuery, { slug, locale });
  if (!data?._id) return null;

  const exerciseKeys = safeArray<string>(data.exerciseKeys).filter(Boolean);

  const exercises = await getExercisesByKeys({
    exerciseKeys,
    locale,
  });

  const tr = data.translation ?? {};

  return {
    id: data._id,
    checkpointKey: safeString(data.checkpointKey) ?? 'UNKNOWN_CHECKPOINT',
    slug: safeString(data.slug) ?? slug,
    level: safeString(data.level) ?? 'A0',
    minScore: safeNumber(data.minScore, 70),

    title: resolveLocalizedString(tr.title, locale) ?? safeString(tr.title) ?? 'Checkpoint',
    introBlocks: resolveLocalizedBlocks(tr.intro, locale),
    outroPassBlocks: resolveLocalizedBlocks(tr.outroPass, locale),
    outroFailBlocks: resolveLocalizedBlocks(tr.outroFail, locale),

    exercises,
  };
}

export type CheckpointListItem = {
    id: string;
    checkpointKey: string;
    slug: string;
    level: string;
    order: number;
    minScore: number;
    title: string;
    // opzionale: una descrizione breve per la card (estratta dal primo blocco intro)
    description?: string | null;
  };
  
  const checkpointsByLevelQuery = groq`
    *[_type == "checkpointBase" && level == $level]
    | order(order asc, checkpointKey asc) {
      _id,
      checkpointKey,
      level,
      order,
      minScore,
      "slug": slug.current,
  
      "translation": *[
        _type == "checkpointTranslation" &&
        checkpoint._ref == ^._id &&
        locale == $locale
      ][0]{
        title,
        intro
      }
    }
  `;
  
  export async function listCheckpointsForLevel(params: {
    level: string;
    locale: Locale;
  }): Promise<CheckpointListItem[]> {
    const { level, locale } = params;
  
    const rows = await sanityClient.fetch<any[]>(checkpointsByLevelQuery, {
      level,
      locale,
    });
  
    return safeArray<any>(rows).map((row) => {
      const tr = row.translation ?? {};
  
      const title =
        resolveLocalizedString(tr.title, locale) ??
        safeString(tr.title) ??
        safeString(row.checkpointKey) ??
        'Checkpoint';
  
      // prova a prendere una mini-descrizione dal primo blocco dell’intro
      const introBlocks = resolveLocalizedBlocks(tr.intro, locale);
      const description =
        Array.isArray(introBlocks) && introBlocks.length > 0
          ? (introBlocks[0]?.children?.[0]?.text as string | undefined) ?? null
          : null;
  
      return {
        id: row._id,
        checkpointKey: safeString(row.checkpointKey) ?? 'UNKNOWN_CHECKPOINT',
        slug: safeString(row.slug) ?? '',
        level: safeString(row.level) ?? level,
        order: safeNumber(row.order, 0),
        minScore: safeNumber(row.minScore, 70),
        title,
        description,
      };
    });
  }