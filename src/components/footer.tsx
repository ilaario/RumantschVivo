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
    <footer>
          <div className="footerElements">
            <div className="footerLeftElement">
              <div className="footerTitle">
                <h2>
                  <span>FUORI</span>Campo
                </h2>
              </div>
              <div className="footerLeftText">
                <p>
                  <b>Your football universe at your fingertips!</b>
                  Follow us on social media to stay updated with the latest news, real-time results,
                  and exclusive insights.
                </p>
              </div>
              <div className="footerSocial">
                <a href="#">
                  <i className="uil uil-facebook-f"></i>
                </a>
                <a href="#">
                  <i className="uil uil-twitter-alt"></i>
                </a>
                <a href="#">
                  <i className="uil uil-instagram"></i>
                </a>
                <a href="#">
                  <i className="uil uil-linkedin"></i>
                </a>
              </div>
            </div>
            <div className="footerMiddleLeftElement">
              <div className="footerTitle">
                <h2>USEFUL LINKS</h2>
              </div>
              <div className="footerMiddleLeftText">
                <ul>
                  <li>
                    <a href="index.html">Home</a>
                  </li>
                  <li>
                    <a href="games.html">All matches</a>
                  </li>
                  <li>
                    <a href="teams.html">All teams</a>
                  </li>
                  <li>
                    <a href="players.html">All players</a>
                  </li>
                  <li>
                    <a href="chat.html">Chat</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="copyright">
            <p>© 2024 FUORICampo. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </footer>
  );
}
