// src/app/sitemap.ts
import type { MetadataRoute } from 'next';
import { sanityClient } from '@/sanity/lib/client';

const SITE_URL = 'https://rumantschvivo.it' as const;
const LOCALES = ['it', 'en', 'fr', 'de'] as const;

type LessonDoc = {
  slug?: string;
  _updatedAt?: string;
};

type CheckpointDoc = {
  slug?: string;
  _updatedAt?: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ---- FETCH DA SANITY ----
  const [lessons, checkpoints] = await Promise.all([
    sanityClient.fetch<LessonDoc[]>(
      `*[_type == "lessonBase" && defined(slug) && published == true]{
        "slug": slug,
        _updatedAt
      }`,
    ),
    sanityClient.fetch<CheckpointDoc[]>(
      `*[_type == "checkpointBase" && defined(slug.current)]{
        "slug": slug.current,
        _updatedAt
      }`,
    ),
  ]);

  // Pagine statiche per ogni locale
  const staticPathsPerLocale = [
    '', // home
    '/about',
    '/learn',
    '/methodology',
    '/contribute',
    '/contributors',
    '/stories',
    '/vocabulary',
  ];

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    // --- STATICHE ---
    for (const path of staticPathsPerLocale) {
      const isHome = path === '';

      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: isHome ? 1 : 0.8,
      });
    }

    // --- LEZIONI DINAMICHE ---
    for (const lesson of lessons ?? []) {
      if (!lesson.slug) continue;

      entries.push({
        url: `${SITE_URL}/${locale}/learn/${lesson.slug}`,
        lastModified: lesson._updatedAt
          ? new Date(lesson._updatedAt)
          : now,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    // --- CHECKPOINT DINAMICI ---
    for (const cp of checkpoints ?? []) {
      if (!cp.slug) continue;

      entries.push({
        url: `${SITE_URL}/${locale}/learn/checkpoint/${cp.slug}`,
        lastModified: cp._updatedAt
          ? new Date(cp._updatedAt)
          : now,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return entries;
}