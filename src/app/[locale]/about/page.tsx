'use client';

import '../../stylesheets/about.css';
import { useI18n } from '@/lib/i18n/i18nprovider';
import { usePathname } from 'next/navigation';
import { isLocale, type Locale } from '@/lib/i18n/config';

function renderRich(text: string) {
    // split su **...**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.slice(2, -2); // togli **
        return <strong key={index}>{content}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  }

export default function AboutPage() {
  const t = useI18n();
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale: Locale = isLocale(segments[0]) ? (segments[0] as Locale) : 'it';

  return (
    <main className="about">
      <section className="about__hero">
        <div className="about__container">
          {/* Badge in alto */}
          <div className="about__badge-row">
            <span className="about__badge">
              {t.about.hero_badge_main}
            </span>
            <span className="about__badge about__badge--soft">
              {t.about.hero_badge_secondary}
            </span>
          </div>

          <div className="about__grid">
            {/* COLONNA SINISTRA */}
            <aside className="about__left">
              <div className="about__card-main">
                <h2 className="about__card-title">
                  {t.about.hero_card_title}
                </h2>
                <p className="about__card-text">
                  {t.about.hero_card_text}
                </p>

                <ul className="about__pill-list">
                  <li className="about__pill">
                    {t.about.hero_pill_1}
                  </li>
                  <li className="about__pill">
                    {t.about.hero_pill_2}
                  </li>
                  <li className="about__pill">
                    {t.about.hero_pill_3}
                  </li>
                </ul>
              </div>

              <div className="about__mini-grid">
                <div className="about__mini-card">
                  <p className="about__mini-label">
                    {t.about.mini_language_label}
                  </p>
                  <p className="about__mini-value">
                    {t.about.mini_language_value}
                  </p>
                  <p className="about__mini-caption">
                    {t.about.mini_language_caption}
                  </p>
                </div>

                <div className="about__mini-card">
                  <p className="about__mini-label">
                    {t.about.mini_approach_label}
                  </p>
                  <p className="about__mini-value">
                    {t.about.mini_approach_value}
                  </p>
                  <p className="about__mini-caption">
                    {t.about.mini_approach_caption}
                  </p>
                </div>
              </div>
            </aside>

            {/* COLONNA DESTRA – testo che avevi già */}
            <div className="about__right">
              <h1 className="about__title">{t.home.about_title}</h1>

              <p className="about__subtitle">
                {renderRich(t.home.about_t1)}
              </p>
              <p className="about__subtitle">
                {renderRich(t.home.about_t2)}
              </p>
              <p className="about__subtitle">
                {renderRich(t.home.about_t3)}
              </p>
              <p className="about__subtitle">
                {renderRich(t.home.about_t4)}
              </p>
              <p className="about__subtitle">
                {renderRich(t.home.about_t5)}
              </p>
              <p className="about__subtitle">
                {renderRich(t.home.about_t6)}
              </p>
              <p className="about__subtitle">
                {renderRich(t.home.about_t7)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione valori in fondo */}
      <section className="about__values">
        <div className="about__container about__values-grid">
          <div className="about__values-block">
            <h2 className="about__values-title">
              {t.about.values_block_1_title}
            </h2>
            <p className="about__values-text">
              {t.about.values_block_1_text}
            </p>
          </div>

          <div className="about__values-block">
            <h2 className="about__values-title">
              {t.about.values_block_2_title}
            </h2>
            <p className="about__values-text">
              {t.about.values_block_2_text}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}