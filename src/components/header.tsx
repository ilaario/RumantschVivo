'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Chiudi menu con ESC
  useEffect(() => {
    function onKeyDown(e: { key: string }) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // (Opzionale) Blocca scroll pagina quando menu è aperto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // helper per active
  const isActive = (href: string) => pathname === href;

  return (
    <header className={`nav ${open ? 'openNav' : ''}`} id="navbar-container">
      <div className="navName">
        {/* Bottone hamburger */}
        <button
          type="button"
          className="navOpenBtn"
          aria-label="Apri menu"
          aria-controls="nav-links"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <span aria-hidden="true">☰</span>
        </button>

        <div className="container-name" onClick={() => setOpen(false)}>
          <Link href="/" className="name">
            <img 
              className="title"
              src="/images/logo2.png"
              alt="RumantschVivo"
            />
          </Link>
        </div>

        <ul className="nav-links" id="nav-links">
          {/* Bottone chiusura */}
          <button
            type="button"
            className="navCloseBtn"
            aria-label="Chiudi menu"
            onClick={() => setOpen(false)}
          >
            <span aria-hidden="true">✕</span>
          </button>

          <li>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className={isActive('/') ? 'active' : ''}
              aria-current={isActive('/') ? 'page' : undefined}
            >
              <strong>HOME</strong>
            </Link>
          </li>

          <li>
            <Link
              href="/learn"
              onClick={() => setOpen(false)}
              className={isActive('/learn') ? 'active' : ''}
              aria-current={isActive('/learn') ? 'page' : undefined}
            >
              IMPARA
            </Link>
          </li>

          <li>
            <Link
              href="/wip"
              onClick={() => setOpen(false)}
              className={isActive('/wip') ? 'active' : ''}
              aria-current={isActive('/wip') ? 'page' : undefined}
            >
              VOCABOLARIO
            </Link>
          </li>

          <li>
            <Link
              href="/wip"
              onClick={() => setOpen(false)}
              className={isActive('/wip') ? 'active' : ''}
              aria-current={isActive('/wip') ? 'page' : undefined}
            >
              STORIE
            </Link>
          </li>
        </ul>
      </div>

      <div className="button-container">
        <Link href="/wip" className="top-right-button" id="RightAccedi">
          Sign Up
        </Link>
        <Link href="/wip" className="top-right-button" id="RightEsci" style={{ display: 'none' }}>
          Exit
        </Link>
      </div>

      {/* Overlay (clic fuori = chiudi) */}
      {open && <div className="nav-overlay" onClick={() => setOpen(false)} aria-hidden="true" />}
    </header>
  );
}
