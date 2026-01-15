import Link from 'next/link';
import { listLessons } from '@/lib/content/lessons';

export default async function LearnPage() {
  const variant = 'sursilvan';
  const level = 'a0';

  const lessons = await listLessons({ variant, level });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-semibold">Impara (Sursilvan)</h1>
      <p className="mt-2 text-gray-700">Livello A0</p>

      <ul className="mt-6 space-y-3">
        {lessons.map((l) => (
          <li key={l.id} className="rounded-lg border p-4">
            <Link
              className="text-lg font-medium underline"
              href={`/learn/${variant}/${level}/${l.slug}`}
            >
              {l.title}
            </Link>
            <div className="mt-2 text-sm text-gray-700">{l.goals.join(' · ')}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
