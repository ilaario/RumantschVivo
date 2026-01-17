import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import { listLessons } from '@/lib/content/lessons';
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
  title: string;
  goals: string[];
  variant?: string | null;
  level?: string | null;
};

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
  // fallback generico se mai arrivasse un locale strano
  default: {
    title: 'Impara (Sursilvan)',
    subtitle: 'Livello A0',
    empty: 'Nessuna lezione ancora disponibile per questo livello.',
  },
};

export default async function LearnPage({ params }: Props) {
  const { locale } = await params;
  const level = 'A0';

  const lessons = (await listLessons({ level, locale })) as LessonListItem[];

  const text = UI_TEXT[locale] ?? UI_TEXT.default;

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
          {lessons.map((l: LessonListItem) => (
            <li key={l.id} className="learn-card">
              <Link href={`/${locale}/learn/${l.slug}`} className="learn-link">
                <p>{l.title}</p>
                {Array.isArray(l.goals) && l.goals.length > 0 && (
                  <div className="learn-meta">{l.goals.join(' · ')}</div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}