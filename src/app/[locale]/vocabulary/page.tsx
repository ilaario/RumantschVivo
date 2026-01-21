// src/app/[locale]/dictionary/page.tsx

import type { Locale } from '@/lib/i18n/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getMessages } from '@/lib/i18n/messages';
import { VocabularyPageClient } from './VocabularyPageClient';
import Link from 'next/link';
import '../../stylesheets/vocabulary.css';

type Params = {
  locale: Locale;
};

type Props = {
  params: Promise<Params>; // Next 16, coerenti con quello che hai già
};

export default async function VocabularyPage({ params }: Props) {
  const { locale } = await params;

  const t = getMessages(locale);
  const text = t.vocabulary_page;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login?redirectTo=/${locale}/vocabulary`);
  }

  const trainingLabel =
    text.training_button ??
    (locale === 'it'
      ? 'Allenati con il vocabulary'
      : locale === 'fr'
        ? 'S’entraîner avec le vocabulary'
        : locale === 'de'
          ? 'Mit dem Vocabulary trainieren'
          : 'Train with your vocabulary');

  return (
    <main className="dict-page">
      <header className="dict-header">
        <div className="dict-header-top">
          <div className="dict-header-text">
            <h1>{text.title}</h1>
            <p>{text.subtitle}</p>
          </div>

          <Link
            href={`/${locale}/vocabulary/training`}
            className="dict-training-btn"
          >
            {trainingLabel}
          </Link>
        </div>
      </header>

      <VocabularyPageClient locale={locale} userId={user.id} />
    </main>
  );
}