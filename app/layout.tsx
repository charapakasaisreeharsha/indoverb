import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import SmoothScrollProvider from '@/components/SmoothScrollProvider'
import PageTransition from '@/components/PageTransition'

export const metadata: Metadata = {
  title: 'Indoverb — We Build Solutions for the Overlooked.',
  description:
    'Indoverb is a product studio that spots overlooked operational problems and builds focused software products around them. Currently shipping in medical and ed-tech.',
  keywords: [
    'product studio',
    'software products',
    'medical tech',
    'ed-tech',
    'FRIS',
    'e-sync',
    'India',
    'product building',
  ],
  authors: [{ name: 'Indoverb' }],
  openGraph: {
    title: 'Indoverb — We Build Solutions for the Overlooked.',
    description:
      'A product studio that finds operational gaps and builds software products around them.',
    url: 'https://indoverb.com',
    siteName: 'Indoverb',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Indoverb — We Build Solutions for the Overlooked.',
    description: 'Product studio. Medical & ed-tech. Real problems, real products.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Grain texture — fixed, above everything */}
        <div className="grain-overlay" aria-hidden="true" />

        {/*
          Nav lives at layout level — never unmounts between page
          transitions, so there's zero flash/jump when navigating.
        */}
        <Nav />

        {/*
          SmoothScrollProvider: re-initialises Lenis + kills all
          GSAP ScrollTrigger instances on every route change.
          This is the fix for grey sections after back-navigation.
        */}
        <SmoothScrollProvider />

        {/*
          Circle-wipe transition overlay — plays on navigation,
          never on first load.
        */}
        <PageTransition />

        {children}
      </body>
    </html>
  )
}