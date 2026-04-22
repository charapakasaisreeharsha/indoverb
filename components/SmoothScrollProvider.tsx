'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * SmoothScrollProvider — production-grade
 *
 * Key fixes vs. previous version:
 * 1. Lenis is fully DESTROYED and RE-CREATED on every route change.
 *    This prevents stale ScrollTrigger instances from carrying over and
 *    causing sections to appear grey/invisible after back-navigation.
 * 2. ScrollTrigger.getAll().forEach(t => t.kill()) purges every trigger
 *    before refresh so nothing from the previous page lingers.
 * 3. Lenis instance is stored in a module-level ref so any component in
 *    the tree can call window.__lenis for programmatic scroll.
 */

// Expose lenis instance globally so other components can access it
declare global {
  interface Window {
    __lenis?: {
      on: (e: string, cb: (...a: unknown[]) => void) => void
      off: (e: string, cb: (...a: unknown[]) => void) => void
      raf: (t: number) => void
      destroy: () => void
      scrollTo: (target: number | string | HTMLElement, opts?: Record<string, unknown>) => void
      stop: () => void
      start: () => void
    }
  }
}

export default function SmoothScrollProvider() {
  const pathname = usePathname()
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // Skip on touch / mobile — native momentum scroll wins
    const isMobile =
      window.innerWidth <= 1024 ||
      window.matchMedia('(hover: none) and (pointer: coarse)').matches

    if (isMobile) return

    let rafId = 0

    const init = async () => {
      // ── 1. Kill previous Lenis + all ScrollTriggers ──────────────
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }

      const [{ default: Lenis }, gsapMod, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      const gsap = gsapMod.default
      gsap.registerPlugin(ScrollTrigger)

      // Kill ALL existing triggers from the previous page
      ScrollTrigger.getAll().forEach(t => t.kill())
      ScrollTrigger.clearScrollMemory()

      // ── 2. Create a fresh Lenis instance ─────────────────────────
      const lenis = new Lenis({
        duration: 0.85,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 0,
      }) as unknown as NonNullable<Window['__lenis']>

      window.__lenis = lenis

      // ── 3. Wire into GSAP ticker (single rAF loop) ────────────────
      const onScroll = ScrollTrigger.update.bind(ScrollTrigger)
      lenis.on('scroll', onScroll)

      const tick = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)

      // ── 4. Wait for DOM paint, then refresh triggers ───────────────
      // Two-step: immediate refresh + one more after fonts/images settle
      ScrollTrigger.refresh()
      const refreshTimer = window.setTimeout(() => {
        ScrollTrigger.refresh()
      }, 200)

      // ── 5. Cleanup factory ────────────────────────────────────────
      cleanupRef.current = () => {
        clearTimeout(refreshTimer)
        cancelAnimationFrame(rafId)
        gsap.ticker.remove(tick)
        lenis.off('scroll', onScroll)
        lenis.destroy()
        delete window.__lenis

        // Kill all ScrollTrigger instances so they don't bleed into
        // the next page's GSAP animations
        ScrollTrigger.getAll().forEach(t => t.kill())
        ScrollTrigger.clearScrollMemory()
      }
    }

    init()

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  }, [pathname]) // ← Re-run on EVERY route change (key fix)

  // Scroll to top instantly on route change so new page starts at 0
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return null
}