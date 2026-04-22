'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import GlobeCanvas from './GlobeCanvas'

/* ─────────────────────────────────────────────────────────────
   Desktop-only GSAP imports.
   On mobile the whole block is skipped — zero bytes parsed.
   We lazy-load via dynamic import to keep mobile bundle clean.
───────────────────────────────────────────────────────────── */
const IS_DESKTOP =
  typeof window !== 'undefined' &&
  window.innerWidth > 1024 &&
  !window.matchMedia('(hover: none) and (pointer: coarse)').matches



/* ─── Ticker data ─────────────────────────────────────── */
const TICKER_ITEMS = [
  'Product Studio',
  'Medical Tech · F.R.I.S',
  'Ed-Tech · e-sync',
  'Hospital Feedback OS',
  'School Management OS',
  'Pilot partners welcome',
  'Focused software. Real sectors.',
  'indoverb.com',
]

/* ─── Sector panel data ───────────────────────────────── */
const SECTORS = [
  {
    num: '01',
    status: 'Active',
    title: 'Medical',
    product: 'F.R.I.S',
    tagline: 'Hospital Feedback OS',
    desc: 'Ward managers spend hours chasing complaints through WhatsApp threads. F.R.I.S replaces that — QR-based feedback routing that sends each complaint to the right department in real time. The infrastructure extends to clinics, diagnostic chains, and multi-location healthcare groups.',
    expand: 'Clinics · Diagnostic Chains · Health Networks',
    href: 'https://f-r-i-s.vercel.app/',
  },
  {
    num: '02',
    status: 'Active',
    title: 'Ed-Tech',
    product: 'e-sync',
    tagline: 'School Management OS',
    desc: 'Schools still manage student data through spreadsheets and manual marksheets. e-sync automates the heavy part — OCR-powered marksheet import, confidence scoring, and flagging for human review — then wraps it in attendance, fees, and role-based dashboards.',
    expand: 'District Rollouts · State Partnerships · White-label',
    href: 'https://e-sync-nine.vercel.app/',
  },
  {
    num: '03',
    status: 'On radar',
    title: '???',
    product: null,
    tagline: 'Next sector · TBD',
    desc: "We don't chase hype cycles. We follow operational pain — the kind that people in a sector have stopped complaining about because it just feels normal. If you work in a sector where the tooling hasn't kept up, we want to hear about it.",
    expand: null,
    href: null,
    isCTA: true,
  },
]

/* ─── Social Icons ────────────────────────────────────── */
function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function IconLinkedIn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  )
}

function IconWhatsApp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  )
}

/* ─── Hamburger Icon ──────────────────────────────────── */
// HamburgerIcon removed - handled by layout/Nav

/* ─── Page ────────────────────────────────────────────── */
export default function Home() {
  const pageRef      = useRef<HTMLDivElement>(null)
  const cursorRef    = useRef<HTMLDivElement | null>(null)
  const ghostRef     = useRef<HTMLDivElement>(null)
  const orbitWrapRef = useRef<HTMLDivElement>(null)
  const tickerRef    = useRef<HTMLDivElement>(null)
  const headlineRef  = useRef<HTMLDivElement>(null)
  const sectorsContainerRef = useRef<HTMLDivElement>(null)
  // menuOpen removed - handled by layout/Nav
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [globeVisible, setGlobeVisible] = useState(false)

  /* ── Detect mobile on mount ───────────────────────── */
  useEffect(() => {
    const check = () => {
      const mobile =
        window.innerWidth <= 1024 ||
        window.matchMedia('(hover: none) and (pointer: coarse)').matches
      setIsMobile(mobile)
    }
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  /* ── Loading screen ───────────────────────────────── */
  useEffect(() => {
    // Minimum display time for loader, then fade out
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Slight delay so globe fades in after loader exits
      setTimeout(() => setGlobeVisible(true), 200)
    }, 2200)
    return () => clearTimeout(timer)
  }, [])

  // Menu resize handler removed - handled by layout/Nav

  // Nav scroll state removed - handled by layout/Nav

  // Body scroll lock removed - handled by layout/Nav

  /* ── Mobile CSS-only hero reveal ─────────────────── */
  useEffect(() => {
    if (!isMobile) return
    // Immediately reveal elements that GSAP would animate on desktop
    const headlines = document.querySelectorAll<HTMLElement>('.hero-headline-inner')
    const sub       = document.querySelector<HTMLElement>('.hero-sub')
    const chips     = document.querySelector<HTMLElement>('.hero-chips')
    const ticker    = document.querySelector<HTMLElement>('.ticker-wrap')
    const reveals   = document.querySelectorAll<HTMLElement>('.reveal')

    headlines.forEach((el, i) => {
      el.style.transition = `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 100}ms`
      el.style.transform  = 'translateY(0)'
    })

    const delay = (el: HTMLElement | null, ms: number) => {
      if (!el) return
      el.style.transition = `opacity 0.6s ease ${ms}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${ms}ms`
      el.style.opacity    = '1'
      el.style.transform  = 'none'
    }

    delay(sub, 350)
    delay(chips, 500)
    if (ticker) {
      ticker.style.transition = 'opacity 0.5s ease 600ms, transform 0.5s ease 600ms'
      ticker.style.opacity    = '1'
      ticker.style.transform  = 'none'
    }

    // Reveal scroll-triggered elements immediately via IntersectionObserver
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            el.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)'
            el.style.opacity    = '1'
            el.style.transform  = 'none'
            io.unobserve(el)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    reveals.forEach((el) => io.observe(el))

    return () => io.disconnect()
  }, [isMobile])

  // Lenis removed - handled by layout/SmoothScrollProvider

  /* ── Custom cursor (DESKTOP ONLY) ──────────────────── */
  useEffect(() => {
    if (isMobile) return

    const cursor = document.getElementById('indoverb-cursor')
    cursorRef.current = cursor as HTMLDivElement

    let cx = 0, cy = 0, tx = 0, ty = 0, raf: number

    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY }

    const loop = () => {
      cx += (tx - cx) * 0.12
      cy += (ty - cy) * 0.12
      if (cursor) {
        cursor.style.left = cx + 'px'
        cursor.style.top  = cy + 'px'
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const onParallax = (e: MouseEvent) => {
      if (ghostRef.current) {
        const px = (e.clientX / window.innerWidth  - 0.5) * 22
        const py = (e.clientY / window.innerHeight - 0.5) * 22
        ghostRef.current.style.transform = `translateY(-50%) translate(${px}px,${py}px)`
      }
      // if (orbitWrapRef.current) {
      //   const ox = (e.clientX / window.innerWidth  - 0.5) * 16
      //   const oy = (e.clientY / window.innerHeight - 0.5) * 16
      //   orbitWrapRef.current.style.transform = `translate(${ox}px,${oy}px)`
      // }
    }

    const hoverEls = document.querySelectorAll(
      'a, button, .hero-chip, .product-card, .cta-path, .sector-card'
    )
    const bloom   = () => cursor?.classList.add('is-hovering')
    const unbloom = () => cursor?.classList.remove('is-hovering')
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', bloom)
      el.addEventListener('mouseleave', unbloom)
    })

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousemove', onParallax)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousemove', onParallax)
      hoverEls.forEach(el => {
        el.removeEventListener('mouseenter', bloom)
        el.removeEventListener('mouseleave', unbloom)
      })
    }
  }, [isMobile])

  /* ── GSAP animations (DESKTOP ONLY) ────────────────── */
  useEffect(() => {
    if (isMobile) return

    let ctx: { revert: () => void } | null = null

    const init = async () => {
      const [gsapMod, { ScrollTrigger }, { Observer }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('gsap/dist/Observer'),
      ])
      const gsap = gsapMod.default
      gsap.registerPlugin(ScrollTrigger)
      gsap.registerPlugin(Observer)

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

        tl.to('.hero-headline-inner', { y: 0, duration: 1.1, stagger: 0.12 })
          .to('.hero-sub',   { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
          .to('.hero-chips', { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
          // .to('.hero-orbit', { opacity: 1, duration: 0.9 }, '-=0.7')
          .from('.ticker-wrap', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')

        gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
          gsap.to(el, {
            opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          })
        })

        gsap.from('.product-card', {
          opacity: 0, y: 32, stagger: 0.15, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.products-grid', start: 'top 82%' },
        })

        gsap.from('.process-step', {
          opacity: 0, y: 24, stagger: 0.1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.process-steps', start: 'top 82%' },
        })

        /* ── Service Sliding Panels (desktop only) ── */
        const spPanels = gsap.utils.toArray<HTMLElement>('#services .sp-panel')
        const spOuters = gsap.utils.toArray<HTMLElement>('#services .sp-outer')
        const spInners = gsap.utils.toArray<HTMLElement>('#services .sp-inner')
        const spBgs    = gsap.utils.toArray<HTMLElement>('#services .sp-bg')
        const spRoot   = document.getElementById('services')

        if (spRoot && spPanels.length && window.innerWidth > 1024) {
          gsap.set(spPanels, { autoAlpha: 0, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 })
          gsap.set(spOuters, { yPercent: 100 })
          gsap.set(spInners, { yPercent: -100 })

          let currentIndex = -1
          let animating    = false
          const wrap       = gsap.utils.wrap(0, spPanels.length)

          const goTo = (index: number, direction: number) => {
            if (animating) return
            index = wrap(index)
            if (index === currentIndex) return

            animating = true
            const dFactor = direction === -1 ? -1 : 1

            const tl = gsap.timeline({
              defaults  : { duration: 1.25, ease: 'power1.inOut' },
              onComplete: () => { animating = false },
            })

            if (currentIndex >= 0) {
              gsap.set(spPanels[currentIndex], { zIndex: 0 })
              tl.to(spBgs[currentIndex], { yPercent: -15 * dFactor }, 0)
              tl.set(spPanels[currentIndex], { autoAlpha: 0 })
            }

            gsap.set(spPanels[index], { autoAlpha: 1, zIndex: 1 })

            tl.fromTo(
              [spOuters[index], spInners[index]],
              { yPercent: (i: number) => i ? -100 * dFactor : 100 * dFactor },
              { yPercent: 0 },
              0
            )
            tl.fromTo(spBgs[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0)

            const contentEls = spPanels[index].querySelectorAll(
              '.sp-meta, .sp-card-eyebrow, .sp-card-title, .sp-card-desc, .sp-card-chips, .sp-card-delivery, .sp-scroll-hint'
            )
            tl.fromTo(
              contentEls,
              { autoAlpha: 0, yPercent: 150 * dFactor },
              { autoAlpha: 1, yPercent: 0, duration: 1, ease: 'power2', stagger: { each: 0.04, from: 'random' } },
              0.2
            )

            currentIndex = index
          }

          ScrollTrigger.create({
            id                : 'services-pin',
            trigger           : spRoot,
            pin               : true,
            start             : 'top top',
            end               : () => `+=${(spPanels.length - 1) * window.innerHeight}`,
            invalidateOnRefresh: true,
          })

          Observer.create({
            id            : 'services-observer',
            type          : 'wheel,touch,pointer',
            wheelSpeed    : -1,
            target        : spRoot,
            onDown        : () => !animating && goTo(currentIndex - 1, -1),
            onUp          : () => !animating && goTo(currentIndex + 1,  1),
            tolerance     : 10,
            preventDefault: true,
          })

          goTo(0, 1)
        }

        /* ── Horizontal sectors scroll (desktop only) ── */
        const panels = gsap.utils.toArray<HTMLElement>('.sector-panel')
        const track  = sectorsContainerRef.current

        if (track && panels.length) {
          panels.forEach((panel) => {
            const inner = panel.querySelector<HTMLElement>('.sector-panel-inner')
            if (inner) gsap.set(inner, { opacity: 0, y: 30 })
          })

          const hPin = gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth),
            ease: 'none',
            scrollTrigger: {
              id: 'sectors-horiz',
              trigger: '#sectors',
              pin: true,
              scrub: 1,
              end: () => `+=${track.scrollWidth - window.innerWidth}`,
              invalidateOnRefresh: true,
            },
          })

          panels.forEach((panel) => {
            const inner = panel.querySelector<HTMLElement>('.sector-panel-inner')
            if (!inner) return
            gsap.to(inner, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: panel,
                containerAnimation: hPin,
                start: 'left 75%',
                toggleActions: 'play none none none',
              },
            })
          })
        }
      }, pageRef)

      const onResize = () => ScrollTrigger.refresh(true)
      window.addEventListener('resize', onResize, { passive: true })

      return () => {
        window.removeEventListener('resize', onResize)
      }
    }

    let cleanup: (() => void) | undefined
    init().then((fn) => { cleanup = fn })

    return () => {
      ctx?.revert()
      cleanup?.()
    }
  }, [isMobile])

  /* ── Ticker animation ─── */
  useEffect(() => {
    const track = tickerRef.current
    if (!track) return
    const clone = track.cloneNode(true) as HTMLElement
    track.parentElement?.appendChild(clone)
  }, [])

  // navLinks removed - handled by layout/Nav

  /* ─── Render ──────────────────────────────────────── */
  return (
    <div ref={pageRef}>

      {/* ── LOADING SCREEN ───────────────────────────── */}
      <div className={`site-loader ${isLoading ? '' : 'site-loader-done'}`} aria-hidden={!isLoading}>
        <div className="site-loader-inner">
          <div className="site-loader-logo">
            Indo<span>verb</span>
          </div>
          <div className="site-loader-bar-wrap">
            <div className="site-loader-bar" />
          </div>
          <div className="site-loader-label">
            <span className="site-loader-dot" />
            Initialising studio OS
          </div>
        </div>
      </div>

      {/* Nav removed - handled by layout/Nav component */}

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="hero" style={{ position: 'relative' }}>

        {/* Globe — right-middle hero background */}
        <div className={`hero-globe-bg ${globeVisible ? 'hero-globe-visible' : ''}`} aria-hidden="true">
          <GlobeCanvas />
        </div>

        <div ref={ghostRef} className="hero-ghost" aria-hidden="true">I</div>

        <div className="hero-body">
          <div className="hero-left">
            <div className="badge badge-live" style={{ marginBottom: '40px' }}>
              <div className="badge-dot" />
              next-gen Product Developers at your service · 2026
            </div>

            <div ref={headlineRef} className="display-xl" style={{ marginBottom: '32px' }}>
              <span className="hero-headline-line">
                <span className="hero-headline-inner">WE BUILD</span>
              </span>
              <span className="hero-headline-line">
                <span className="hero-headline-inner">Solutions</span>
              </span>
              <span className="hero-headline-line">
                <span className="hero-headline-inner">FOR THE</span>
              </span>
              <span className="hero-headline-line">
                <span className="hero-headline-inner">
                  OVERLOOKED.<span className="accent-text"> ↗</span>
                </span>
              </span>
            </div>

            <p className="hero-sub body-lg" style={{ maxWidth: '440px', marginBottom: '40px' }}>
              Indoverb is a product studio. We find operational problems
              that have been normalised in specific sectors and build focused
              software products around them. Currently shipping in medical
              and ed-tech.
            </p>

            <div className="hero-chips">
              <div className="hero-chip">
                <span className="hero-chip-dot" />
                F.R.I.S — Hospital Feedback OS
              </div>
              <div className="hero-chip">
                <span className="hero-chip-dot" />
                e-sync — School Management OS
              </div>
              <div className="hero-chip hero-chip-new">
                <span className="hero-chip-dot" style={{ background: 'rgba(0,229,255,0.4)' }} />
                Next sector · TBD
              </div>
            </div>
          </div>

          {/* Remove the old orbit-wrap entirely */}
          {/* <div ref={orbitWrapRef} className="orbit-wrap hero-orbit"><OrbitSVG /></div> */}
        </div>

        {/* Ticker */}
        <div className="ticker-wrap">
          <div style={{ display: 'flex', animation: 'ticker 30s linear infinite', width: 'max-content' }}>
            <div ref={tickerRef} style={{ display: 'flex' }}>
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="ticker-item">
                  <span className="ticker-diamond">◆</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes ticker {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* ── PRODUCTS ─────────────────────────────────── */}
      <section id="products" className="section" style={{ padding: '0' }}>
        <div className="container" style={{ padding: '0' }}>
          <div style={{ padding: `80px var(--pad-x) 40px` }}>
            <div className="section-label reveal">
              <span>Products</span>
            </div>
            <p className="display-md reveal" style={{ maxWidth: '560px' }}>
              Two products. Two sectors. Both{' '}
              <span className="accent-text">in pilot stage.</span>
            </p>
          </div>

          <div className="products-grid">

            {/* F.R.I.S */}
            <div className="product-card">
              <div className="product-card-num">01</div>
              <div className="product-card-tag">Medical · Feedback Management</div>
              <div className="product-card-name">F.R.I.S</div>
              <p className="product-card-desc">
                Feedback Response Intelligent System. A QR-based complaint routing OS
                for hospitals — patients scan, feedback reaches the right department
                instantly. No WhatsApp groups. No lost complaints. Real-time dashboard
                for ward managers.
              </p>
              <div className="product-card-meta">
                <div className="product-meta-item">
                  <div className="product-meta-label">Sector</div>
                  <div className="product-meta-value">Hospitals · Clinics</div>
                </div>
                <div className="product-meta-item">
                  <div className="product-meta-label">Expand to</div>
                  <div className="product-meta-value">Hotels · Restaurants · RWAs</div>
                </div>
                <div className="product-meta-item">
                  <div className="product-meta-label">Status</div>
                  <div className="product-meta-value" style={{ color: 'var(--acid)' }}>Pilot stage</div>
                </div>
              </div>
              <a
                href="https://f-r-i-s.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="product-card-link"
              >
                View product ↗
              </a>
            </div>

            {/* e-sync */}
            <div className="product-card">
              <div className="product-card-num">02</div>
              <div className="product-card-tag">Ed-Tech · School Management</div>
              <div className="product-card-name">e-sync</div>
              <p className="product-card-desc">
                A school management OS built around one insight: OCR-powered
                marksheet import. Teachers upload physical mark sheets — the system
                extracts, confidence-scores, and flags low-confidence fields for
                human review. Covers attendance, fees, calendar, and role-based access.
              </p>
              <div className="product-card-meta">
                <div className="product-meta-item">
                  <div className="product-meta-label">Sector</div>
                  <div className="product-meta-value">Schools · Institutes</div>
                </div>
                <div className="product-meta-item">
                  <div className="product-meta-label">Expand to</div>
                  <div className="product-meta-value">Ed-tech SaaS · White-label</div>
                </div>
                <div className="product-meta-item">
                  <div className="product-meta-label">Status</div>
                  <div className="product-meta-value" style={{ color: 'var(--acid)' }}>Pilot stage</div>
                </div>
              </div>
              <a
                href="https://e-sync-nine.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="product-card-link"
              >
                View product ↗
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────── */}
      <section id="process" className="section">
        <div className="container">
          <div className="section-label reveal">
            <span>Process</span>
          </div>
          <p className="display-md reveal" style={{ maxWidth: '500px', marginBottom: '0' }}>
            How a problem becomes a{' '}
            <span className="accent-text">product.</span>
          </p>

          <div className="process-steps">
            {[
              {
                n: '01',
                title: 'Find',
                desc: 'We talk to people in the field — doctors, teachers, operators. We look for friction that\'s been normalised. If something is painful and everyone\'s just dealing with it, that\'s worth building around.',
              },
              {
                n: '02',
                title: 'Frame',
                desc: 'We define the smallest version of the product that solves the core problem. No feature bloat. One clear outcome. We scope tight and validate with domain experts before writing a line of code.',
              },
              {
                n: '03',
                title: 'Build',
                desc: 'We build lean and fast. Interactive mockups first, then a working pilot. Every design decision is grounded in how the actual user — a ward manager, a school teacher — will use it.',
              },
              {
                n: '04',
                title: 'Scale',
                desc: 'One pilot becomes a case study. The case study sells the next five. The product evolves with real feedback — then we look at where the same problem lives in other sectors.',
              },
            ].map((step) => (
              <div key={step.n} className="process-step">
                <div className="process-step-num">{step.n}</div>
                <div className="process-step-title">{step.title}</div>
                <p className="process-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES — GSAP Observer Sliding Panels ─────── */}
      <div id="services" className="sp-root">

        {/* Panel 1 — Automations */}
        <div className="sp-panel" data-index="0">
          <div className="sp-outer">
            <div className="sp-inner">
              <div
                className="sp-bg"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1518770660439-4636190af475?w=1800&q=80)' }}
              />
              <div className="sp-veil" />

              <div className="sp-content">
                <div className="sp-meta">
                  <span className="sp-num">01</span>
                  <span className="sp-rule" />
                  <span className="sp-label">Service</span>
                </div>

                <div className="sp-card">
                  <div className="sp-card-eyebrow">Automations</div>
                  <h2 className="sp-card-title">
                    Kill the manual work.<br />
                    <span className="accent-text">Build the pipeline.</span>
                  </h2>
                  <p className="sp-card-desc">
                    We identify repetitive, manual workflows inside your operation and
                    replace them with intelligent systems. OCR ingestion, feedback routing,
                    notification pipelines, scheduled jobs — we build the plumbing that
                    keeps your product running without human intervention.
                  </p>
                  <div className="sp-card-chips">
                    <span className="sp-chip">Workflow automation</span>
                    <span className="sp-chip">OCR pipelines</span>
                    <span className="sp-chip">Real-time routing</span>
                    <span className="sp-chip">Scheduled jobs</span>
                  </div>
                  <div className="sp-card-delivery">
                    <span className="sp-delivery-label">Typical delivery</span>
                    <span className="sp-delivery-value">2 – 4 weeks per system</span>
                  </div>
                </div>
              </div>

              <div className="sp-scroll-hint">
                <span>Scroll</span>
                <span className="sp-scroll-arrow">↓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2 — MVP Development */}
        <div className="sp-panel" data-index="1">
          <div className="sp-outer">
            <div className="sp-inner">
              <div
                className="sp-bg"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1800&q=80)' }}
              />
              <div className="sp-veil" />

              <div className="sp-content">
                <div className="sp-meta">
                  <span className="sp-num">02</span>
                  <span className="sp-rule" />
                  <span className="sp-label">Service</span>
                </div>

                <div className="sp-card">
                  <div className="sp-card-eyebrow">MVP Development</div>
                  <h2 className="sp-card-title">
                    One problem.<br />
                    <span className="accent-text">One working product.</span>
                  </h2>
                  <p className="sp-card-desc">
                    We take a single, well-defined problem and ship a working MVP around it.
                    No feature lists, no bloat. One core loop — validated, live, and in the
                    hands of real users. Built for iteration from day one, not for demo days.
                  </p>
                  <div className="sp-card-chips">
                    <span className="sp-chip">Problem framing</span>
                    <span className="sp-chip">Pilot-ready builds</span>
                    <span className="sp-chip">Full-stack</span>
                    <span className="sp-chip">Iteration-first</span>
                  </div>
                  <div className="sp-card-delivery">
                    <span className="sp-delivery-label">Typical delivery</span>
                    <span className="sp-delivery-value">4 – 8 weeks to pilot</span>
                  </div>
                </div>
              </div>

              <div className="sp-scroll-hint">
                <span>Scroll</span>
                <span className="sp-scroll-arrow">↓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3 — Web / App Development */}
        <div className="sp-panel" data-index="2">
          <div className="sp-outer">
            <div className="sp-inner">
              <div
                className="sp-bg"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1800&q=80)' }}
              />
              <div className="sp-veil" />

              <div className="sp-content">
                <div className="sp-meta">
                  <span className="sp-num">03</span>
                  <span className="sp-rule" />
                  <span className="sp-label">Service</span>
                </div>

                <div className="sp-card">
                  <div className="sp-card-eyebrow">Web &amp; App Development</div>
                  <h2 className="sp-card-title">
                    Built to scale.<br />
                    <span className="accent-text">Not to rewrite.</span>
                  </h2>
                  <p className="sp-card-desc">
                    Production-grade web applications and mobile experiences. We handle
                    design, engineering, and deployment — architected to scale from a
                    single-location pilot to a multi-site rollout without touching the
                    foundation.
                  </p>
                  <div className="sp-card-chips">
                    <span className="sp-chip">Next.js · React Native</span>
                    <span className="sp-chip">Role-based dashboards</span>
                    <span className="sp-chip">Scale-ready architecture</span>
                    <span className="sp-chip">White-label</span>
                  </div>
                  <div className="sp-card-delivery">
                    <span className="sp-delivery-label">Typical delivery</span>
                    <span className="sp-delivery-value">6 – 12 weeks</span>
                  </div>
                </div>
              </div>

              <div className="sp-scroll-hint sp-scroll-last">
                <span>Continue</span>
                <span className="sp-scroll-arrow">↓</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── SECTORS (horizontal scroll desktop / vertical mobile) ─ */}
      <section id="sectors" className="sectors-section">
        <div ref={sectorsContainerRef} className="sectors-h-track">
          {SECTORS.map((sector) => (
            <div key={sector.num} className={`sector-panel ${sector.isCTA ? 'sector-panel-cta' : ''}`}>
              <div className="sector-panel-inner">

                {!sector.isCTA ? (
                  <>
                    <div className="sector-panel-num">{sector.num}</div>
                    <div className="sector-panel-status">
                      <span className={`sector-dot ${sector.status === 'Active' ? 'active' : 'radar'}`} />
                      {sector.status}
                    </div>
                    <div className="sector-panel-title">{sector.title}</div>
                    <div className="sector-panel-product">
                      <span className="sector-panel-product-name">{sector.product}</span>
                      <span className="sector-panel-product-tag">{sector.tagline}</span>
                    </div>
                    <p className="sector-panel-desc">{sector.desc}</p>
                    {sector.expand && (
                      <div className="sector-panel-expand">
                        <div className="sector-panel-expand-label">Expansion path</div>
                        <div className="sector-panel-expand-value">{sector.expand}</div>
                      </div>
                    )}
                    {sector.href && (
                      <a href={sector.href} target="_blank" rel="noopener noreferrer" className="sector-panel-link">
                        View product ↗
                      </a>
                    )}
                    <div className="sector-panel-progress">
                      <div className="sector-panel-progress-fill" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="sector-panel-num">03</div>
                    <div className="sector-cta-eyebrow">Which sector do you operate in?</div>
                    <div className="sector-cta-headline">
                      If the tools haven&apos;t<br />
                      caught up to the work —<br />
                      <span className="accent-text">let&apos;s talk.</span>
                    </div>
                    <p className="sector-panel-desc" style={{ maxWidth: '440px' }}>
                      {sector.desc}
                    </p>
                    <div className="sector-cta-actions">
                      <a href="mailto:hello@indoverb.com?subject=Sector opportunity" className="sector-cta-btn-primary">
                        Tell us about the problem ↗
                      </a>
                      <a href="mailto:hello@indoverb.com?subject=Co-build inquiry" className="sector-cta-btn-secondary">
                        Co-build with us
                      </a>
                    </div>
                    <div className="sector-cta-scroll-hint">
                      ↓ scroll to continue
                    </div>
                  </>
                )}

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT / CTA ────────────────────────────── */}
      <section id="contact">
        <div className="cta-section">

          <div>
            <div className="section-label reveal">
              <span>Work with us</span>
            </div>
            <p className="display-md reveal" style={{ marginBottom: '24px' }}>
              Have a real problem?<br />
              <span className="accent-text">We build around it.</span>
            </p>
            <p className="body-lg reveal" style={{ maxWidth: '400px', fontSize: '15px' }}>
              We partner with domain experts — doctors, school owners, operators —
              who understand the problem deeply. We bring product thinking,
              design, and engineering.
            </p>
          </div>

          <div className="cta-paths">
            {[
              {
                label: 'For institutions',
                title: 'You have a problem. We build the product.',
                href: 'mailto:hello@indoverb.com?subject=Problem to solve',
              },
              {
                label: 'For domain experts',
                title: 'You know the sector. We co-build.',
                href: 'mailto:hello@indoverb.com?subject=Co-build partnership',
              },
              {
                label: 'For investors',
                title: "You see the potential. Let's talk.",
                href: 'mailto:hello@indoverb.com?subject=Investment inquiry',
              },
            ].map((path) => (
              <a key={path.label} href={path.href} className="cta-path">
                <div>
                  <div className="cta-path-label">{path.label}</div>
                  <div className="cta-path-title">{path.title}</div>
                </div>
                <div className="cta-path-arrow">↗</div>
              </a>
            ))}
          </div>

        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="footer-full">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo-lg">
              Indo<span>verb</span>
            </div>
            <p className="footer-brand-desc">
              A product studio that builds focused software for overlooked
              operational problems. Currently shipping in medical and ed-tech.
            </p>
            <a href="mailto:hello@indoverb.com" className="footer-email-link">
              hello@indoverb.com ↗
            </a>

            <div className="footer-socials">
              <a href="#" className="footer-social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <IconInstagram />
              </a>
              <a href="#" className="footer-social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <IconLinkedIn />
              </a>
              <a href="#" className="footer-social-link" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                <IconWhatsApp />
              </a>
            </div>
          </div>

          <div className="footer-cols">
            <div className="footer-col">
              <div className="footer-col-heading">Products</div>
              <ul className="footer-col-list">
                <li><a href="https://f-r-i-s.vercel.app/" target="_blank" rel="noopener noreferrer">F.R.I.S</a></li>
                <li><a href="https://e-sync-nine.vercel.app/" target="_blank" rel="noopener noreferrer">e-sync</a></li>
                <li><span className="footer-col-muted">Next product · TBD</span></li>
              </ul>
            </div>

            <div className="footer-col">
              <div className="footer-col-heading">Sectors</div>
              <ul className="footer-col-list">
                <li><a href="#sectors">Medical</a></li>
                <li><a href="#sectors">Ed-Tech</a></li>
                <li><span className="footer-col-muted">Operational-sectors</span></li>
              </ul>
            </div>

            <div className="footer-col">
              <div className="footer-col-heading">Contact</div>
              <ul className="footer-col-list">
                <li>
                  <a href="mailto:hello@indoverb.com?subject=Problem to solve">
                    For institutions
                  </a>
                </li>
                <li>
                  <a href="mailto:hello@indoverb.com?subject=Co-build partnership">
                    Co-build inquiry
                  </a>
                </li>
                <li>
                  <a href="mailto:hello@indoverb.com?subject=Investment inquiry">
                    Investment
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <span className="footer-copy">© {new Date().getFullYear()} Indoverb. All rights reserved.</span>
            <span className="footer-sep">·</span>
            <span className="footer-copy">Product studio. India.</span>
          </div>
          <div className="footer-bottom-right">
            <span className="footer-copy footer-status">
              <span className="footer-status-dot" />
              2 products in pilot
            </span>
          </div>
        </div>
      </footer>

    </div>
  )
}