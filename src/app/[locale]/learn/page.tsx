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

export default async function LearnPage({ params }: Props) {
  // params è UNA PROMISE, quindi:
  const { locale } = await params;
  const level = 'A0';

  const lessons = await listLessons({ level, locale });

  return (
    <main className="learn-page">
      <header className="learn-header">
        <h1>Impara (Sursilvan)</h1>
        <p>Livello A0</p>
      </header>

      {lessons.length === 0 ? (
        <div className="learn-empty">
          Nessuna lezione ancora disponibile per questo livello.
        </div>
      ) : (
        <ul className="learn-list">
          {lessons.map((l) => (
            <Link key={l.id} className="learn-card" href={`/${locale}/learn/${l.slug}`}>
              <p
                className="learn-link"
              >
                {l.title}
              </p>
              {l.goals && l.goals.length > 0 && (
                <div className="learn-meta">{l.goals.join(' · ')}</div>
              )}
            </Link>
          ))}
        </ul>
      )}
    </main>
  );
}