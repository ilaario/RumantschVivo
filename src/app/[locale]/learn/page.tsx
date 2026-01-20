// src/app/[locale]/learn/page.tsx

import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import { listLessons } from '@/lib/content/lessons';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMessages } from '@/lib/i18n/messages';
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

export default async function LearnPage({ params }: Props) {
  const { locale } = await params;
  const level = 'A0';

  const t = getMessages(locale);
  const text = t.learn_page; // <-- usa i18n

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

  // ====== PROGRESSO DA SUPABASE ======
  const { data: rows, error } = await supabase
    .from('lesson_progress')
    .select('lesson_key, completed')
    .eq('user_id', user.id);

  if (error) {
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
      const key = row.lesson_key as string;
      const status: LessonStatus = row.completed ? 'completed' : 'started';
      progressByLessonKey.set(key, status);
    }
  }

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
            const status: LessonStatus = progressByLessonKey.get(l.lesson_key) ?? 'new';

            const statusClass =
              status === 'completed'
                ? 'learn-card--completed'
                : status === 'started'
                  ? 'learn-card--started'
                  : 'learn-card--new';

            return (
              <li key={l.id}>
                <Link
                  href={`/${locale}/learn/${l.slug}`}
                  className={`learn-card learn-link ${statusClass}`}
                >
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
