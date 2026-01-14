import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Lesson } from '@/types/lesson';

const lessonsRoot = path.join(process.cwd(), 'src', 'content', 'lessons');

export async function listLessons(params: { variant: string; level: string }) {
  if (!params?.variant || !params?.level) {
    throw new Error(
      `listLessons: missing params (variant=${params?.variant}, level=${params?.level})`,
    );
  }

  const dir = path.join(lessonsRoot, params.variant, params.level.toLowerCase());
  const files = await fs.readdir(dir);
  const lessons: Lesson[] = [];

  for (const file of files.filter((f) => f.endsWith('.json'))) {
    const full = path.join(dir, file);
    const raw = await fs.readFile(full, 'utf8');
    lessons.push(JSON.parse(raw));
  }

  // ordina per id (a0-001, a0-002, ...)
  lessons.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  return lessons;
}

export async function getLesson(params: { variant: string; level: string; slug: string }) {
  console.log('LessonPage params:', await params);
  const lessons = await listLessons(params);
  return lessons.find((l) => l.slug === params.slug) ?? null;
}
