'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

/* ─── Types ───────────────────────────────────────────── */
interface CaseStudy {
  id: string
  num: string
  sector: string
  product: string
  tagline: string
  year: string
  status: 'Live' | 'Shipped' | 'Pilot'
  tags: string[]
  challenge: string
  outcome: string
  image: string
  href: string
  accentColor?: string
}

/* ─── Data ────────────────────────────────────────────── */
const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'fris',
    num: '01',
    sector: 'Medical',
    product: 'F.R.I.S',
    tagline: 'Hospital Feedback OS',
    year: '2024',
    status: 'Live',
    tags: ['QR Routing', 'Real-time Ops', 'Multi-location'],
    challenge:
      'Ward managers were chasing patient complaints through WhatsApp threads — zero traceability, zero resolution SLA. Hospitals had no operational layer between a complaint and the right department.',
    outcome:
      'QR-triggered feedback that routes each complaint to the exact department in real time, with resolution dashboards for management. Deployed across clinic chains and diagnostic networks.',
    image: '/images/fris-cover.jpg',
    href: 'https://f-r-i-s.vercel.app/',
  },
  {
    id: 'esync',
    num: '02',
    sector: 'Ed-Tech',
    product: 'e-sync',
    tagline: 'School Management OS',
    year: '2024',
    status: 'Live',
    tags: ['OCR', 'Marksheet Automation', 'Role Dashboards'],
    challenge:
      'Schools were managing student data in spreadsheets — manual marksheet entry took days, errors were invisible, and staff had no unified dashboard for attendance, fees, or records.',
    outcome:
      'OCR-powered marksheet import with confidence scoring and human-review flags, wrapped with attendance, fee tracking, and role-based access. Ready for district-level rollout.',
    image: '/images/esync-cover.jpg',
    href: 'https://e-sync-nine.vercel.app/',
  },
]

/* ─── Case Study Card ─────────────────────────────────── */
function CaseStudyCard({ study, index }: { study: CaseStudy; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const isEven = index % 2 === 0

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const statusColors: Record<string, string> = {
    Live: 'var(--acid)',
    Shipped: '#A3E635',
    Pilot: '#FCD34D',
  }
  const statusColor = statusColors[study.status] ?? 'var(--acid)'

  return (
    <div
      ref={cardRef}
      className="cs-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.7s var(--ease-out-expo) ${index * 0.08}s, transform 0.7s var(--ease-out-expo) ${index * 0.08}s`,
      }}
    >
      <div className="h-line" style={{ marginBottom: 0 }} />

      <div className="cs-card-inner" style={{ flexDirection: isEven ? 'row' : 'row-reverse' }}>

        <div className="cs-card-text">
          <div className="cs-card-meta">
            <span className="label" style={{ color: 'var(--text-3)' }}>{study.num}</span>
            <span className="cs-divider">·</span>
            <span className="label" style={{ color: 'var(--text-3)' }}>{study.sector}</span>
            <span className="cs-divider">·</span>
            <span className="label" style={{ color: 'var(--text-3)' }}>{study.year}</span>
            <span
              className="cs-status"
              style={{ '--status-color': statusColor } as React.CSSProperties}
            >
              <span className="cs-status-dot" />
              {study.status}
            </span>
          </div>

          <h2 className="cs-product-name display-lg">{study.product}</h2>
          <p className="cs-tagline label" style={{ color: 'var(--acid)', marginBottom: 'var(--sp-7)' }}>
            {study.tagline}
          </p>

          <div className="cs-block">
            <p className="label" style={{ color: 'var(--text-3)', marginBottom: 'var(--sp-2)' }}>
              The Problem
            </p>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75, fontWeight: 300 }}>
              {study.challenge}
            </p>
          </div>

          <div className="cs-block">
            <p className="label" style={{ color: 'var(--text-3)', marginBottom: 'var(--sp-2)' }}>
              What We Built
            </p>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75, fontWeight: 300 }}>
              {study.outcome}
            </p>
          </div>

          <div className="cs-tags">
            {study.tags.map(tag => (
              <span key={tag} className="badge">{tag}</span>
            ))}
          </div>
        </div>

        <a
          href={study.href}
          target="_blank"
          rel="noopener noreferrer"
          className="cs-card-visual"
          aria-label={`View ${study.product} live`}
        >
          <div className="cs-img-wrap">
            <div className="cs-img-placeholder" aria-hidden="true">
              <span className="cs-img-num">{study.num}</span>
              <span className="cs-img-product">{study.product}</span>
            </div>
            <div className="cs-img-hover-overlay">
              <div className="cs-img-cta">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
                <span>View Live</span>
              </div>
            </div>
          </div>
          <p className="cs-img-caption label">{study.tagline} — {study.year}</p>
        </a>
      </div>
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────── */
export default function CaseStudiesPage() {
  /**
   * FIX: Do NOT initialise Lenis here. SmoothScrollProvider in layout.tsx
   * handles Lenis for the entire app. Initialising it again here caused:
   *   - Two competing Lenis instances
   *   - Duplicate GSAP ticker calls
   *   - ScrollTrigger conflicts when navigating back to the homepage
   *
   * We DO need to trigger a ScrollTrigger.refresh() after this page mounts
   * so that any ScrollTrigger instances created by the homepage that are
   * still in GSAP's memory correctly recalculate positions.
   */
  useEffect(() => {
    const refresh = async () => {
      try {
        const gsapMod = await import('gsap')
        const { ScrollTrigger } = await import('gsap/ScrollTrigger')
        gsapMod.default.registerPlugin(ScrollTrigger)
        // Brief delay so the DOM is fully painted before measuring
        window.setTimeout(() => ScrollTrigger.refresh(), 100)
      } catch {
        // GSAP not loaded yet — no-op
      }
    }
    refresh()
  }, [])

  return (
    <>
      <main style={{ paddingTop: 'var(--nav-h)' }}>

        {/* ── Hero header ── */}
        <section className="cs-hero container">
          <div className="section-label" style={{ marginBottom: 'var(--sp-7)' }}>
            <span>Our work</span>
          </div>

          <div className="cs-hero-inner">
            <h1 className="display-xl cs-hero-title">
              Case<br />
              <span style={{ color: 'var(--acid)' }}>Studies</span>
            </h1>
            <div className="cs-hero-aside">
              <p className="body-lg" style={{ maxWidth: 420 }}>
                We build in overlooked sectors. Each product here started as a recurring operational
                complaint no one had turned into software yet.
              </p>
              <div style={{ marginTop: 'var(--sp-5)', display: 'flex', gap: 'var(--sp-3)' }}>
                <span className="badge">
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'var(--acid)', display: 'inline-block', flexShrink: 0,
                  }} />
                  {CASE_STUDIES.length} projects
                </span>
                <span className="badge">Medical · Ed-Tech</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Case studies list ── */}
        <section className="cs-list container">
          {CASE_STUDIES.map((study, i) => (
            <CaseStudyCard key={study.id} study={study} index={i} />
          ))}
          <div className="h-line" />
        </section>

        {/* ── CTA strip ── */}
        <section className="cs-cta container">
          <div className="cs-cta-inner">
            <div>
              <p className="label" style={{ color: 'var(--text-3)', marginBottom: 'var(--sp-3)' }}>
                Next sector · TBD
              </p>
              <h2 className="display-md" style={{ maxWidth: 560 }}>
                Working in a sector where the tooling hasn't kept up?
              </h2>
            </div>
            <a href="mailto:hello@indoverb.com" className="btn btn-acid">
              Tell us about it
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
          </div>
        </section>

      </main>

      {/* ── Inline styles ── */}
      <style>{`
        .cs-hero {
          padding-top: var(--sp-10);
          padding-bottom: var(--sp-9);
        }
        .cs-hero-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--sp-8);
          align-items: flex-end;
        }
        .cs-hero-title {
          line-height: 0.9;
        }
        .cs-list {
          padding-bottom: var(--sp-9);
        }
        .cs-card-inner {
          display: flex;
          gap: var(--sp-8);
          padding: var(--sp-9) 0;
          align-items: flex-start;
        }
        .cs-card-text {
          flex: 1 1 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .cs-card-meta {
          display: flex;
          align-items: center;
          gap: var(--sp-3);
          margin-bottom: var(--sp-4);
          flex-wrap: wrap;
        }
        .cs-divider {
          color: var(--text-3);
          font-size: 11px;
          margin: 0 2px;
        }
        .cs-product-name {
          line-height: 0.92;
          margin-bottom: var(--sp-3);
        }
        .cs-block {
          margin-bottom: var(--sp-5);
        }
        .cs-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--sp-2);
          margin-top: var(--sp-4);
        }
        .cs-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 500;
          color: var(--status-color, var(--acid));
          margin-left: auto;
        }
        .cs-status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--status-color, var(--acid));
          animation: blink 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        .cs-card-visual {
          flex: 0 0 46%;
          max-width: 46%;
          display: flex;
          flex-direction: column;
          gap: var(--sp-3);
          cursor: pointer;
        }
        .cs-img-wrap {
          position: relative;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          border: 0.5px solid var(--border);
          background: var(--bg-2);
        }
        .cs-img-wrap:hover .cs-img-hover-overlay { opacity: 1; }
        .cs-img-wrap:hover .cs-img-placeholder { transform: scale(1.025); }
        .cs-img-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--sp-3);
          background: linear-gradient(135deg, var(--bg-2) 0%, var(--bg-3) 100%);
          transition: transform 0.5s var(--ease-out-expo);
        }
        .cs-img-num {
          font-family: var(--font-display);
          font-size: clamp(64px, 10vw, 120px);
          color: rgba(255,255,255,0.04);
          line-height: 1;
          user-select: none;
        }
        .cs-img-product {
          font-family: var(--font-display);
          font-size: clamp(18px, 2.5vw, 32px);
          color: var(--border-2);
          letter-spacing: 0.06em;
          user-select: none;
        }
        .cs-img-hover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,229,255,0.07);
          border: 0.5px solid var(--acid-border);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s var(--ease-out-expo);
        }
        .cs-img-cta {
          display: flex;
          align-items: center;
          gap: var(--sp-2);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--acid);
          font-weight: 500;
          font-family: var(--font-body);
          padding: 10px 20px;
          border: 0.5px solid var(--acid-border);
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(6px);
        }
        .cs-img-caption {
          color: var(--text-3);
          font-size: 10px;
        }
        .cs-cta {
          padding-top: var(--sp-9);
          padding-bottom: var(--sp-10);
        }
        .cs-cta-inner {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: var(--sp-7);
          padding: var(--sp-8);
          border: 0.5px solid var(--border);
          background: var(--bg-1);
        }

        /* Tablet */
        @media (max-width: 900px) {
          .cs-hero-inner { grid-template-columns: 1fr; gap: var(--sp-6); }
          .cs-card-inner { flex-direction: column !important; gap: var(--sp-6); }
          .cs-card-visual { flex: unset; max-width: 100%; width: 100%; order: -1; }
          .cs-cta-inner { flex-direction: column; align-items: flex-start; }
        }

        /* Mobile */
        @media (max-width: 640px) {
          .cs-hero { padding-top: var(--sp-9); padding-bottom: var(--sp-7); }
          .cs-card-inner { padding: var(--sp-7) 0; }
          .cs-status { margin-left: 0; margin-top: var(--sp-2); }
          .cs-card-meta { flex-wrap: wrap; }
          .cs-cta { padding-top: var(--sp-7); padding-bottom: var(--sp-8); }
          .cs-cta-inner { padding: var(--sp-6); }
          .nav-links { display: none; }
        }

        @media (min-width: 900px) {
          .nav-cta { display: inline-flex !important; }
          .hamburger-btn { display: none !important; }
        }
      `}</style>
    </>
  )
}