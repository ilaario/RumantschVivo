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

          <p className="hero__subtitle">{renderRich(t.home.hero_subtitle)}</p>

          <div className="hero__actions">
            <Link href="/learn" className="hero__bnt hero__primary">
              {t.home.hero_b1}
            </Link>
            <Link href="/about" className="hero__bnt hero__outline">
              {t.home.hero_b2}
            </Link>
          </div>

          {/* ===== WIP / STATUS ===== */}
          <div className="hero__wip">
            <span className="hero__wip-badge">WIP</span>
            <p className="hero__wip-text">
              {t.hero_wip_text}
            </p>
            <Link href="/status" className="hero__bnt hero__wip-btn">
              {t.hero_wip_button}
            </Link>
          </div>
        </div>

        <div className="hero__right" aria-hidden="true">
          {/* Sostituisci src con la tua mappa */}
          <img className="hero__svg" src="/images/logo2.png" alt="Mappa del Canton Grigioni" />
        </div>
      </section>
    </main>
  );
}
