'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Immediately check scroll position on mount (handles back navigation)
    setScrolled(window.scrollY > 24)

    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const links = [
    { label: 'Products', href: '/#products' },
    { label: 'Sectors',  href: '/#sectors' },
    { label: 'Work',     href: '/case-studies' },
    { label: 'Contact',  href: '/#contact' },
  ]

  return (
    <>
      <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <Link href="/" className="nav-logo">
          INDO<span className="logo-accent">VERB</span>
        </Link>

        {/* Desktop links */}
        <ul className="nav-links" style={{ listStyle: 'none' }}>
          {links.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                style={
                  (label === 'Work' && pathname === '/case-studies') ||
                  (label !== 'Work' && pathname === '/')
                    ? { color: label === 'Work' ? 'var(--acid)' : undefined }
                    : { color: label === 'Work' ? 'var(--acid)' : undefined }
                }
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <Link href="/#contact" className="btn btn-outline nav-cta" style={{ display: 'none' }}>
            Get in touch
          </Link>
          {/* Hamburger */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: 4 }}
          >
            <span style={{
              display: 'block', width: 22, height: 1.5,
              background: menuOpen ? 'var(--acid)' : 'var(--text)',
              transition: 'all 0.3s var(--ease-out-expo)',
              transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none',
            }} />
            <span style={{
              display: 'block', width: 22, height: 1.5,
              background: menuOpen ? 'var(--acid)' : 'var(--text)',
              transition: 'all 0.3s var(--ease-out-expo)',
              opacity: menuOpen ? 0 : 1,
            }} />
            <span style={{
              display: 'block', width: 22, height: 1.5,
              background: menuOpen ? 'var(--acid)' : 'var(--text)',
              transition: 'all 0.3s var(--ease-out-expo)',
              transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
            }} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 490,
          background: 'rgba(10,10,10,0.97)',
          backdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '0 var(--pad-x)',
          gap: 'var(--sp-6)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'all' : 'none',
          transition: 'opacity 0.35s var(--ease-out-expo)',
        }}
        aria-hidden={!menuOpen}
      >
        {links.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 9vw, 64px)',
              color: item.label === 'Work' ? 'var(--acid)' : 'var(--text)',
              lineHeight: 1,
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'translateX(0)' : 'translateX(-24px)',
              transition: `opacity 0.4s ease ${0.05 + i * 0.06}s, transform 0.4s var(--ease-out-expo) ${0.05 + i * 0.06}s`,
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>
  )
}
