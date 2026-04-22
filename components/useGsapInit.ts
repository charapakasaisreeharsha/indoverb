'use client'

import { useEffect, useRef, DependencyList } from 'react'

type GsapModule = typeof import('gsap')['default']
type ScrollTriggerModule = typeof import('gsap/ScrollTrigger')['ScrollTrigger']

type GsapInitCallback = (
  gsap: GsapModule,
  ScrollTrigger: ScrollTriggerModule
) => (() => void) | void

/**
 * useGsapInit
 *
 * A safe wrapper around GSAP + ScrollTrigger initialisation that:
 *
 * 1. Dynamically imports GSAP so it's never in the server bundle.
 * 2. Kills ALL ScrollTrigger instances before re-creating, so
 *    navigating back to a page doesn't leave stale/grey triggers.
 * 3. Accepts an optional cleanup callback returned from the init fn,
 *    which is called before the next init (on dep change) and on unmount.
 * 4. Schedules a ScrollTrigger.refresh() after a short delay so
 *    measurements are taken after fonts, images, and Lenis are ready.
 *
 * Usage:
 * ```ts
 * useGsapInit((gsap, ScrollTrigger) => {
 *   const tl = gsap.timeline()
 *   tl.from('.hero-title', { y: 40, opacity: 0 })
 *
 *   ScrollTrigger.create({
 *     trigger: '.products-section',
 *     start: 'top 80%',
 *     onEnter: () => tl.play(),
 *   })
 *
 *   return () => tl.kill() // optional cleanup
 * }, []) // deps — usually [] for page-level animations
 * ```
 */
export function useGsapInit(
  callback: GsapInitCallback,
  deps: DependencyList = []
) {
  const cleanupRef  = useRef<(() => void) | null>(null)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    let killed = false
    let refreshTimer: ReturnType<typeof setTimeout>

    const run = async () => {
      const [gsapMod, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      const gsap = gsapMod.default

      if (killed) return // component unmounted while loading

      gsap.registerPlugin(ScrollTrigger)

      // ── Kill all previous triggers so nothing from a prior page visit
      //    lingers and keeps sections invisible / grey.
      ScrollTrigger.getAll().forEach(t => t.kill())

      // ── Run the caller's init and capture any cleanup function
      const userCleanup = callbackRef.current(gsap, ScrollTrigger)
      if (typeof userCleanup === 'function') {
        cleanupRef.current = userCleanup
      }

      // ── Refresh after DOM + Lenis settle (two-pass for robustness)
      ScrollTrigger.refresh()
      refreshTimer = setTimeout(() => {
        if (!killed) ScrollTrigger.refresh()
      }, 200)
    }

    run()

    return () => {
      killed = true
      clearTimeout(refreshTimer)
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * killAllScrollTriggers
 *
 * Utility you can call imperatively to purge all active ScrollTrigger
 * instances — useful in router event handlers or before page transitions.
 */
export async function killAllScrollTriggers() {
  try {
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    ScrollTrigger.getAll().forEach(t => t.kill())
    ScrollTrigger.clearScrollMemory()
  } catch {
    // GSAP not loaded
  }
}
