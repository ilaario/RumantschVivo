import { notFound } from 'next/navigation';
import { getLesson } from '@/lib/content/lessons';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ variant: string; level: string; slug: string }>;
}) {
  const p = await params; // <-- unwrap QUI

  const lesson = await getLesson(p);
  if (!lesson) return notFound();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="text-sm text-gray-600">
        {lesson.variant} · {lesson.level} · {lesson.id}
      </div>

      <h1 className="mt-2 text-3xl font-semibold">{lesson.title}</h1>

      <h2 className="mt-6 text-xl font-semibold">Obiettivi</h2>
      <ul className="mt-2 list-disc pl-5">
        {lesson.goals.map((g) => (
          <li key={g}>{g}</li>
        ))}
      </ul>

      <div className="mt-8 space-y-8">
        {lesson.content.map((block, idx) => {
          if (block.type === 'explain') {
            return (
              <section key={idx}>
                <h3 className="text-lg font-semibold">{block.title}</h3>
                <p className="mt-2 text-gray-800">{block.text}</p>
              </section>
            );
          }

          if (block.type === 'examples') {
            return (
              <section key={idx}>
                <h3 className="text-lg font-semibold">Esempi</h3>
                <ul className="mt-2 space-y-2">
                  {block.items.map((ex, i) => (
                    <li key={i} className="rounded border p-3">
                      <div className="font-medium">{ex.rm}</div>
                      <div className="text-sm text-gray-700">{ex.it}</div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          }

          if (block.type === 'exercises') {
            return (
              <section key={idx}>
                <h3 className="text-lg font-semibold">Esercizi</h3>
                <div className="mt-2 space-y-4">
                  {block.items.map((q, i) => (
                    <div key={i} className="rounded border p-4">
                      <div className="font-medium">{q.question}</div>
                      <ul className="mt-2 list-disc pl-5 text-gray-800">
                        {q.options.map((opt, j) => (
                          <li key={j}>{opt}</li>
                        ))}
                      </ul>
                      <div className="mt-2 text-sm text-gray-600">
                        (Soluzione per ora: {q.options[q.answerIndex]})
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          return null;
        })}
      </div>
    </main>
  );
}
