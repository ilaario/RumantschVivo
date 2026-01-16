// src/app/[locale]/learn/[slug]/page.tsx

import type { Locale } from '@/lib/i18n/config';
import { getLesson } from '@/lib/content/lessons';
import { getExercisesForLesson } from '@/lib/content/exercises';
import { PortableBlocks } from '@/lib/content/portableComponents';
import { LessonExercises } from '@/components/lesson-exercises';
import { notFound } from 'next/navigation';
import '../../../stylesheets/lesson.css';

type PageProps = {
  params: Promise<{
    locale: Locale;
    slug: string;
  }>;
};

export default async function LessonPage({ params }: PageProps) {
  const { locale, slug } = await params;

  const lesson = await getLesson({ slug, locale });
  if (!lesson) {
    return notFound();
  }

  const exercises = await getExercisesForLesson({
    lessonKey: lesson.lessonKey,
    locale,
  });

  return (
    <main className="lesson-page">
      {/* METADATI LEZIONE */}
      <p className="lesson-meta">
        {(lesson.variant || 'Sursilvan').toUpperCase()} · {lesson.level || 'A0'}
      </p>

      <h1 className="lesson-title">{lesson.title}</h1>

      {/* INTRO */}
      {lesson.intro && lesson.intro.length > 0 && (
        <section className="lesson-intro">
          <PortableBlocks value={lesson.intro} />
        </section>
      )}

      {/* CORPO */}
      {lesson.body && lesson.body.length > 0 && (
        <section className="lesson-body">
          <PortableBlocks value={lesson.body} />
        </section>
      )}

      {/* ESERCIZI (component client) */}
      {exercises.length > 0 && (
        <LessonExercises exercises={exercises} />
      )}
    </main>
  );
}