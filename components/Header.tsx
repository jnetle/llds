'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { LogoLong } from './LogoLong';

const NAV = [
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Press', href: '/press' }
];

// Mobile only — the desktop bar gets Home from the logo, which the overlay hides.
const MOBILE_NAV = [{ label: 'Home', href: '/' }, ...NAV];
const MENU_ID = 'mobile-site-menu';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!menuOpen) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const openButton = openButtonRef.current;
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMenuOpen(false);
        return;
      }

      if (e.key !== 'Tab') return;
      const root = menuRef.current;
      if (!root) return;

      const focusable = Array.from(root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      } else {
        openButton?.focus();
      }
    };
  }, [menuOpen]);

  // The header foreground is owned by `.site-header` in globals.css so it can flip with the fill. Nothing below may
  // set an inline `color` — inline wins the cascade and would freeze the flip. Inherit, or use currentColor.
  return (
    <>
      <header
        className="site-header px-[18px] py-[16px] sm:px-[36px] sm:py-[18px]"
        data-solid={scrolled ? '' : undefined}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
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

        <div className="relative z-[1] grid grid-cols-[1fr_auto] items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <div style={{ justifySelf: 'start' }}>
            <Link href="/" aria-label="Laurel Leaf Design Studio — Home" style={{ display: 'flex' }}>
              <span className="sm:hidden">
                <LogoLong height={36} />
              </span>
              <span className="hidden sm:block">
                <LogoLong height={38} />
              </span>
            </Link>
          </div>

          <nav className="micro hidden justify-self-center gap-9 lg:flex">
            {NAV.map(item => (
              <Link key={item.label} href={item.href} className="nav-link relative">
                {item.label}
                <span className="nav-underline" />
              </Link>
            ))}
          </nav>

          <button
            ref={openButtonRef}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-controls={MENU_ID}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="flex justify-self-end lg:hidden"
            style={{
              flexDirection: 'column',
              gap: 5,
              padding: 8,
              marginRight: -8
            }}>
            <span style={{ width: 24, height: 1, background: 'currentColor', display: 'block' }} />
            <span style={{ width: 24, height: 1, background: 'currentColor', display: 'block' }} />
            <span style={{ width: 24, height: 1, background: 'currentColor', display: 'block' }} />
          </button>

          <div className="hidden justify-self-end items-center gap-6 lg:flex">
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
        </div>
      </header>

      <div
        id={MENU_ID}
        ref={menuRef}
        className={'mobile-nav-overlay ' + (menuOpen ? 'open' : 'closed')}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-nav-title">
        <h2 id="mobile-nav-title" className="sr-only">
          Site menu
        </h2>
        <button
          ref={closeButtonRef}
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
