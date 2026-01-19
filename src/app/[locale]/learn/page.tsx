// src/app/[locale]/learn/page.tsx

import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import { listLessons } from '@/lib/content/lessons';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import '../../stylesheets/learn.css';

type LearnPageParams = {
  locale: Locale;
};

type Props = {
  params: Promise<LearnPageParams>;
};

type LessonListItem = {
  id: string;
  slug: string;
  lesson_key: string;
  title: string;
  goals: string[];
  variant?: string | null;
  level?: string | null;
};

type LessonStatus = 'new' | 'started' | 'completed';

const UI_TEXT: Record<
  Locale | 'default',
  {
    title: string;
    subtitle: string;
    empty: string;
  }
> = {
  it: {
    title: 'Impara (Sursilvan)',
    subtitle: 'Livello A0',
    empty: 'Nessuna lezione ancora disponibile per questo livello.',
  },
  en: {
    title: 'Learn (Sursilvan)',
    subtitle: 'Level A0',
    empty: 'No lessons available for this level yet.',
  },
  default: {
    title: 'Impara (Sursilvan)',
    subtitle: 'Livello A0',
    empty: 'Nessuna lezione ancora disponibile per questo livello.',
  },
};

export default async function LearnPage({ params }: Props) {
  const { locale } = await params;
  const level = 'A0';

  // ====== CHECK LOGIN VIA SUPABASE ======
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?redirectTo=/${locale}/learn`);
  }

  // ====== LEZIONI ======
  const lessons = (await listLessons({ level, locale })) as LessonListItem[];
  console.log("Lessons found: ", lessons)
  const text = UI_TEXT[locale] ?? UI_TEXT.default;

  // ====== PROGRESSO DA SUPABASE ======
  // tabella: lesson_progress (come usata in lesson-exercises.tsx)
  // colonne: user_id, lesson_key, locale, status
  const { data: rows, error } = await supabase
    .from('lesson_progress')
    .select('lesson_key, completed')
    .eq('user_id', user.id)

  if (error) {
    // non ammazziamo la pagina, fallback: nessun progresso
    console.error('Errore caricando lesson_progress:', {
      message: error?.message,
      details: (error as any)?.details,
      hint: (error as any)?.hint,
      code: (error as any)?.code,
    });
  }

  const progressByLessonKey = new Map<string, LessonStatus>();

  if (Array.isArray(rows)) {
    for (const row of rows) {
      console.log("Lesson completed: ", row)
      const key = row.lesson_key as string;
      const status: LessonStatus = row.completed ? 'completed' : 'started';
      progressByLessonKey.set(key, status);
    }
  }

  console.log(progressByLessonKey)

  return (
    <main className="learn-page">
      <header className="learn-header">
        <h1>{text.title}</h1>
        <p>{text.subtitle}</p>
      </header>

      {lessons.length === 0 ? (
        <div className="learn-empty">{text.empty}</div>
      ) : (
        <ul className="learn-list">
          {lessons.map((l) => {
            const status: LessonStatus =
              progressByLessonKey.get(l.lesson_key) ?? 'new';

              console.log("Evaluating Lesson: ", l.lesson_key, " ==> ", status)

            const statusClass =
              status === 'completed'
                ? 'learn-card--completed'
                : status === 'started'
                ? 'learn-card--started'
                : 'learn-card--new';

            return (
              <li key={l.id} className={`learn-card ${statusClass}`}>
                <Link href={`/${locale}/learn/${l.slug}`} className="learn-link">
                  <p className="learn-card-title">{l.title}</p>

                  {Array.isArray(l.goals) && l.goals.length > 0 && (
                    <div className="learn-meta">{l.goals.join(' · ')}</div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}