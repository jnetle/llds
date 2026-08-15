'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCompact } from '@/hooks/useCompact';
import { LogoLong } from './LogoLong';

const NAV = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Press', href: '/press' }
];

// Mobile only — the desktop bar gets Home from the logo, which the overlay hides.
const MOBILE_NAV = [{ label: 'Home', href: '/' }, ...NAV];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isCompact = useCompact();
  // 600px, not the 1024px default above: it matches the media query in
  // globals.css that pins header padding to `16px 18px`, which is what decides
  // how much room the mark actually has.
  const isMobile = useCompact(600);

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

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = menuOpen ? 'hidden' : prev || '';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // The header foreground is owned by `.site-header` in globals.css so it can
  // flip with the fill (cream over the photo scrim → ink once filled, since
  // warm stone is too light to carry cream text). Nothing below may set an
  // inline `color` — inline wins the cascade and would freeze the flip. Children
  // inherit, or use currentColor where they need the value on another property.
  return (
    <>
      <header
        className="site-header"
        data-solid={scrolled ? '' : undefined}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          // One size on every route. The bar used to open taller and shrink on
          // scroll, but the home page never showed that state — the cover panel
          // suppresses the header until 0.92 of a viewport, by which point it is
          // already compact. Home set the standard, so the compact size is now
          // the only size. `scrolled` still drives the fill; just not the sizing.
          padding: '18px 36px',
          transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
          opacity: hidden ? 0 : 1,
          pointerEvents: hidden ? 'none' : 'auto'
        }}>
        <div
          className="site-header__scrim"
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
            gridTemplateColumns: isCompact ? '1fr auto' : '1fr auto 1fr',
            alignItems: 'center',
            gap: 24
          }}>
          <div style={{ justifySelf: 'start' }}>
            <Link href="/" aria-label="Laurel Leaf Design Studio — Home" style={{ display: 'flex' }}>
              {/* Flat, like the bar around it. Mobile is a touch smaller because
                  the 600px media query tightens the bar's padding to match. */}
              <LogoLong height={isMobile ? 36 : 38} />
            </Link>
          </div>

          <nav
            style={{
              display: 'flex',
              gap: 36,
              justifySelf: 'center'
            }}>
            {NAV.map(item => (
              <Link key={item.label} href={item.href} className="micro nav-link" style={{ position: 'relative' }}>
                {item.label}
                <span className="nav-underline" />
              </Link>
            ))}
          </nav>

          {isCompact ? (
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              style={{
                justifySelf: 'end',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                padding: 8,
                marginRight: -8
              }}>
              <span style={{ width: 24, height: 1, background: 'currentColor', display: 'block' }} />
              <span style={{ width: 24, height: 1, background: 'currentColor', display: 'block' }} />
              <span style={{ width: 24, height: 1, background: 'currentColor', display: 'block' }} />
            </button>
          ) : (
            <div
              style={{
                justifySelf: 'end',
                display: 'flex',
                alignItems: 'center',
                gap: 24
              }}>
              <Link
                href="/inquire"
                className="micro"
                style={{
                  padding: '9px 18px',
                  border: '1px solid color-mix(in srgb, currentColor 60%, transparent)',
                  borderRadius: 100
                }}>
                Inquire
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className={'mobile-nav-overlay ' + (menuOpen ? 'open' : 'closed')} aria-hidden={!menuOpen}>
        <button
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
          style={{ position: 'absolute', top: 24, right: 24, fontSize: 22, padding: 12 }}>
          ✕
        </button>
        {MOBILE_NAV.map(item => (
          <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
            {item.label}
          </Link>
        ))}
        <Link href="/inquire" onClick={() => setMenuOpen(false)}>
          Inquire
        </Link>
      </div>
    </>
  );
}
