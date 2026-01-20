// src/app/[locale]/learn/[slug]/page.tsx

import type { Locale } from '@/lib/i18n/config';
import {
  getLesson,
  listLessons,
  type LessonListItem,
} from '@/lib/content/lessons';
import { getExercisesForLesson } from '@/lib/content/exercises';
import { PortableBlocks } from '@/lib/content/portableComponents';
import { LessonExercises } from '@/components/lesson-exercises';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import '@/app/stylesheets/lesson.css';

type PageProps = {
  params: Promise<{
    locale: Locale;
    slug: string;
  }>;
};

export default async function LessonPage({ params }: PageProps) {
  const { locale, slug } = await params;

  // ====== LEZIONE ======
  const lesson = await getLesson({ slug, locale });
  if (!lesson) {
    console.error("Lesson not found")
    return notFound();
  }

  // ====== ESERCIZI (localizzati) ======
  const exercises =
    (await getExercisesForLesson({
      lessonKey: lesson.lessonKey,
      locale,
    })) ?? [];

  // ====== PROGRESSO INIZIALE (per riprendere da dove hai lasciato) ======
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialIndex = 0;

  if (user) {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('current_index, completed')
      .eq('user_id', user.id)
      .eq('lesson_key', lesson.lessonKey)
      // niente .eq('locale', locale) perché ora il progresso è condiviso tra lingue
      .maybeSingle();

    if (!error && data && !data.completed && typeof data.current_index === 'number') {
      initialIndex = Math.max(0, data.current_index);
    }
  }

  // ====== Calcolo "prossima lezione" nello stesso livello ======
  let nextLessonHref: string | undefined;

  try {
    if (lesson.level) {
      const lessonsInLevel: LessonListItem[] = await listLessons({
        level: lesson.level,
        locale,
      });

      const idx = lessonsInLevel.findIndex((l) => l.slug === slug);

      if (idx >= 0 && idx < lessonsInLevel.length - 1) {
        const next = lessonsInLevel[idx + 1];
        if (next?.slug) {
          nextLessonHref = `/${locale}/learn/${next.slug}`;
        }
      }
    }
  } catch (err) {
    // non esplodiamo se listLessons fallisce, semplicemente niente "prossima lezione"
    console.error('[LessonPage] errore calcolo nextLessonHref', err);
  }

  return (
    <main className="lesson-page">
      <p className="lesson-meta">
        {(lesson.variant || 'Sursilvan').toUpperCase()} · {lesson.level || 'A0'}
      </p>

      <h1 className="lesson-title">{lesson.title}</h1>

      {lesson.intro?.length > 0 && (
        <section className="lesson-intro">
          <PortableBlocks value={lesson.intro} />
        </section>
      )}

      {lesson.body?.length > 0 && (
        <section className="lesson-body">
          <PortableBlocks value={lesson.body} />
        </section>
      )}

      {exercises.length > 0 && (
        <LessonExercises
          exercises={exercises}
          locale={locale}
          lessonKey={lesson.lessonKey}
          nextLessonHref={nextLessonHref}
          initialIndex={initialIndex}
        />
      )}
    </main>
  );
}