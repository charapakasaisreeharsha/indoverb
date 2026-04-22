'use client'

import { useEffect, useState } from 'react'

const SESSION_KEY = 'indoverb_loaded'

/**
 * SiteLoader
 *
 * Shows the full-screen intro loader ONLY on a user's first visit
 * within a browser session. Refreshes and back-navigation do not
 * re-trigger it — we gate on sessionStorage.
 *
 * Usage: Drop this anywhere inside your page's top-level JSX.
 * The component renders null if the user has already seen the loader.
 *
 * To reset during development: sessionStorage.removeItem('indoverb_loaded')
 */
export default function SiteLoader() {
  // null = unknown (SSR), false = skip, true = show
  const [show, setShow] = useState<boolean | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem(SESSION_KEY)

    if (seen) {
      // Already seen this session — skip entirely
      setShow(false)
      return
    }

    // First visit this session
    sessionStorage.setItem(SESSION_KEY, '1')
    setShow(true)

    // Dismiss after the bar animation completes (≈2.4 s total)
    const dismissTimer = window.setTimeout(() => setDone(true), 2400)
    // Remove from DOM after fade-out finishes
    const hideTimer    = window.setTimeout(() => setShow(false), 3200)

    return () => {
      clearTimeout(dismissTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  // Unknown (SSR) or already seen → render nothing
  if (!show) return null

  return (
    <div
      className={`site-loader${done ? ' site-loader-done' : ''}`}
      aria-hidden="true"
    >
      <div className="site-loader-inner">
        <div className="site-loader-logo">
          INDO<span>VERB</span>
        </div>

        <div className="site-loader-bar-wrap">
          <div className="site-loader-bar" />
        </div>

        <div className="site-loader-label">
          <span className="site-loader-dot" />
          Building solutions
        </div>
      </div>
    </div>
  )
}
