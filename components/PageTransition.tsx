'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * PageTransition
 *
 * A circular wipe overlay that plays on every internal navigation.
 * It does NOT play on initial page load — only on route changes.
 *
 * Usage: Mount once inside RootLayout, above {children}.
 *
 * CSS custom properties used:
 *   --acid: the brand cyan colour
 *   --bg:   the background colour
 */
export default function PageTransition() {
  const pathname = usePathname()
  const isFirst   = useRef(true)
  const [phase, setPhase] = useState<'idle' | 'in' | 'out'>('idle')

  useEffect(() => {
    // Skip the very first render (actual page load)
    if (isFirst.current) {
      isFirst.current = false
      return
    }

    // Trigger: in → brief hold → out
    setPhase('in')
    const holdTimer  = window.setTimeout(() => setPhase('out'), 480)
    const idleTimer  = window.setTimeout(() => setPhase('idle'), 900)

    return () => {
      clearTimeout(holdTimer)
      clearTimeout(idleTimer)
    }
  }, [pathname])

  if (phase === 'idle') return null

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          pointerEvents: phase === 'in' ? 'all' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* ── Expanding / shrinking circle ──────────────── */}
        <div
          style={{
            width: '100vmax',
            height: '100vmax',
            borderRadius: '50%',
            background: 'var(--bg)',
            border: '0.5px solid var(--acid-border, rgba(0,229,255,0.22))',
            transform: phase === 'in' ? 'scale(1.5)' : 'scale(0)',
            opacity: phase === 'in' ? 1 : 0,
            transition: phase === 'in'
              ? 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease'
              : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease 0.05s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Brand mark in centre of wipe */}
          <span
            style={{
              fontFamily: 'var(--font-display, "Bebas Neue", sans-serif)',
              fontSize: 'clamp(28px, 5vw, 52px)',
              letterSpacing: '0.04em',
              color: 'var(--text, #F0EDE6)',
              opacity: phase === 'in' ? 1 : 0,
              transition: 'opacity 0.2s ease',
              userSelect: 'none',
            }}
          >
            INDO<span style={{ color: 'var(--acid, #00E5FF)' }}>VERB</span>
          </span>
        </div>
      </div>
    </>
  )
}
