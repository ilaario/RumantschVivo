import type { Locale } from '@/lib/i18n/config';
import { notFound, redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCheckpointBySlug } from '@/lib/content/checkpoints';
import { PortableBlocks } from '@/lib/content/portableComponents';
import { CheckpointRunner } from '@/components/checkpoint-runner';
import '@/app/stylesheets/lesson.css';

type PageProps = {
  params: Promise<{
    locale: Locale;
    slug: string;
  }>;
};

export default async function CheckpointPage({ params }: PageProps) {
  const { locale, slug } = await params;

  // auth
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?redirectTo=/${locale}/checkpoint/${slug}`);
  }

  const checkpoint = await getCheckpointBySlug({ slug, locale });
  if (!checkpoint) return notFound();

  // carico best/attempts attuali (server-side) così il runner può aggiornare correttamente
  const { data: existing } = await supabase
    .from('checkpoint_results')
    .select('attempts, best_score, passed, passed_at')
    .eq('user_id', user.id)
    .eq('checkpoint_key', checkpoint.checkpointKey)
    .maybeSingle();

  const attempts = typeof existing?.attempts === 'number' ? existing.attempts : 0;
  const bestScore = typeof existing?.best_score === 'number' ? existing.best_score : 0;
  const passed = !!existing?.passed;
  const passedAt = existing?.passed_at ?? null;

  return (
    <main className="lesson-page">
      <p className="lesson-meta">
        CHECKPOINT · {checkpoint.level} · pass ≥ {checkpoint.minScore}%
      </p>

      <h1 className="lesson-title">{checkpoint.title}</h1>

      {checkpoint.introBlocks?.length > 0 && (
        <section className="lesson-intro">
          <PortableBlocks value={checkpoint.introBlocks} />
        </section>
      )}

      <CheckpointRunner
        locale={locale}
        checkpointKey={checkpoint.checkpointKey}
        minScore={checkpoint.minScore}
        exercises={checkpoint.exercises}
        initialAttempts={attempts}
        initialBestScore={bestScore}
        initialPassed={passed}
        initialPassedAt={passedAt}
        outroPassBlocks={checkpoint.outroPassBlocks}
        outroFailBlocks={checkpoint.outroFailBlocks}
      />
    </main>
  );
}