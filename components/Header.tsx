'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Wordmark } from './Wordmark';

const NAV = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/' },
  { label: 'Press', href: '/press' }
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onSetHidden = (e: Event) => {
      const detail = (e as CustomEvent<{ hidden: boolean }>).detail;
      setHidden(Boolean(detail?.hidden));
    };
    window.addEventListener('globalHeader:setHidden', onSetHidden);
    return () => {
      window.removeEventListener('globalHeader:setHidden', onSetHidden);
    };
  }, []);

  const fg = '#F4F0E8';

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: scrolled ? '18px 36px' : '28px 36px',
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? 'none' : 'auto',
        transition: 'padding 0.4s ease, transform 0.36s ease, opacity 0.36s ease'
      }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 140,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.22) 55%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          color: fg,
          gap: 24
        }}>
        <div style={{ justifySelf: 'start' }}>
          <Link href="/" aria-label="Laurel Leaf Design Studio — Home">
            <Wordmark color={fg} />
          </Link>
        </div>

        <nav
          style={{
            display: 'flex',
            gap: 36,
            justifySelf: 'center'
          }}>
          {NAV.map(item => (
            <Link key={item.label} href={item.href} className="micro nav-link" style={{ position: 'relative', color: fg }}>
              {item.label}
              <span className="nav-underline" />
            </Link>
          ))}
        </nav>

        <div
          style={{
            justifySelf: 'end',
            display: 'flex',
            alignItems: 'center',
            gap: 24
          }}>
          <a
            href="mailto:hello@laurelleaf.studio"
            className="micro"
            style={{
              padding: '9px 18px',
              border: '1px solid rgba(244,240,232,0.6)',
              borderRadius: 100,
              color: fg
            }}>
            Inquire
          </a>
        </div>
      </div>
    </header>
  );
}
