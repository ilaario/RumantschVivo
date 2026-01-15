'use client';

import Link from 'next/link';
import '../stylesheets/home.css';

import { useI18n } from '@/lib/i18n/i18nprovider';
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

export default function Home() {

  const t = useI18n();

  return (
    <main className="home">
      <section className="hero">
        <div className="hero__left">
          <h1 className="hero__title">{t.home.hero_title}</h1>

          <p className="hero__subtitle">
            {renderRich(t.home.hero_subtitle)}
          </p>

          <div className="hero__actions">
            <Link href="/learn" className="hero__bnt hero__primary">
                {t.home.hero_b1}
            </Link>
            <Link href="/about" className="hero__bnt hero__outline">
            {t.home.hero_b2}
            </Link>
          </div>
        </div>

        <div className="hero__right" aria-hidden="true">
          {/* Sostituisci src con la tua mappa */}
          <img
              className="hero__svg"
              src="/images/logo2.png"
              alt="Mappa del Canton Grigioni"
            />
        </div>
      </section>

      <section className="about_us">
        <div className="about__left" aria-hidden="true">
          {/* Sostituisci src con la tua mappa */}
          <img
              className="about__svg"
              src="/images/graubuenden-map.svg"
              alt="Mappa del Canton Grigioni"
            />
        </div>

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
        </div>
      </section>
    </main>
  );
}
