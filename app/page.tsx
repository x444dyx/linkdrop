'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, inView }
}

function FadeIn({ children, delay = 0, y = 24 }: { children: React.ReactNode; delay?: number; y?: number }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : `translateY(${y}px)`,
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>
      {children}
    </div>
  )
}

const LAYOUTS = [
  { name: 'ROWS', desc: 'Clean stacked links with avatar circles' },
  { name: 'BUBBLES', desc: 'Pill-shaped tags that wrap naturally' },
  { name: 'GRID', desc: 'Two-column card grid with banners' },
  { name: 'ICONS', desc: 'Icon-first circular display' },
]

const FEATURES = [
  { icon: '⚡', title: 'Instant setup', desc: 'Claim a handle, set a password, start adding links. No forms, no onboarding, no bloat.' },
  { icon: '🎨', title: 'Full theming', desc: 'Five presets or set your own background and accent hex codes. Every profile looks completely different.' },
  { icon: '📌', title: 'Pin & reorder', desc: 'Pin important links to the top so they never move. Drag everything else into any order you want.' },
  { icon: '👆', title: 'Click analytics', desc: 'Every link click is tracked and shown in your builder. See exactly which links people are actually clicking — for free, no trackers.' },
  { icon: '👁', title: 'Profile views', desc: 'See how many times your profile page has been visited. Total view count shown live in your builder header.' },
  { icon: '🎭', title: 'Copy any theme', desc: 'Browse the explore page and spot a theme you love. One click to copy it to your own profile — just verify with your password.' },
  { icon: '📐', title: 'Link sizes', desc: 'Each link can be small, medium, or large — independently. Large links show a full banner image, just like Linktree.' },
  { icon: '📱', title: 'Branded QR code', desc: 'Generate a Linkdrop-branded QR code for your profile. Saved automatically. Download as PNG anytime.' },
  { icon: '🔒', title: 'Secure by default', desc: 'Your builder is password protected. Wrong password 5 times and the account locks. Reset via email anytime.' },
]

const STEPS = [
  { n: '01', title: 'Claim your handle', desc: 'Type the name you want. If it\'s free, it\'s yours. Set your email and password to secure it.' },
  { n: '02', title: 'Build your profile', desc: 'Add links, upload a photo, pick a layout, set your theme. Preview updates in real time.' },
  { n: '03', title: 'Publish & share', desc: 'Hit publish. Your page goes live at linkdrop.ayteelabs.com/yourhandle instantly.' },
]

export default function LandingPage() {
  const [activeLayout, setActiveLayout] = useState(0)
  const [typed, setTyped] = useState('')
  const [tick, setTick] = useState(true)
  const handles = ['yourname', 'adil', 'creator', 'studio', 'dev']
  const [hIdx, setHIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [charIdx, setCharIdx] = useState(0)

  useEffect(() => {
    const target = handles[hIdx]
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (charIdx < target.length) {
          setTyped(target.slice(0, charIdx + 1))
          setCharIdx(i => i + 1)
        } else {
          setTimeout(() => setDeleting(true), 1200)
        }
      } else {
        if (charIdx > 0) {
          setTyped(target.slice(0, charIdx - 1))
          setCharIdx(i => i - 1)
        } else {
          setDeleting(false)
          setHIdx(h => (h + 1) % handles.length)
        }
      }
    }, deleting ? 55 : 95)
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, hIdx])

  useEffect(() => {
    const t = setInterval(() => setTick(x => !x), 530)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveLayout(l => (l + 1) % LAYOUTS.length), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: "'DM Mono', monospace", overflowX: 'hidden' }}>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="Linkdrop" style={{ width: 22, height: 22, opacity: 0.9 }} />
          <span style={{ fontSize: 11, color: '#f0f0f0', letterSpacing: '0.12em' }}>LINKDROP</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/explore" style={{ fontSize: 9, color: '#555', textDecoration: 'none', letterSpacing: '0.1em', padding: '6px 12px' }}>EXPLORE</Link>
          <Link href="/docs" style={{ fontSize: 9, color: '#555', textDecoration: 'none', letterSpacing: '0.1em', padding: '6px 12px' }}>DOCS</Link>
          <Link href="/login" style={{ fontSize: 9, color: '#bbb', textDecoration: 'none', letterSpacing: '0.1em', padding: '6px 12px', border: '1px solid #333', borderRadius: 3 }}>SIGN IN</Link>
          <Link href="/claim" style={{ fontSize: 9, color: '#111', background: '#f0f0f0', textDecoration: 'none', letterSpacing: '0.1em', padding: '7px 14px', borderRadius: 3, fontWeight: 600 }}>CLAIM →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 40px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`, backgroundSize: '40px 40px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, background: 'radial-gradient(circle, rgba(255,255,255,0.035) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ animation: 'float 4s ease-in-out infinite', marginBottom: 40, position: 'relative', zIndex: 1, animationFillMode: 'both' }}>
          <img src="/logo.png" alt="Linkdrop" style={{ width: 100, height: 100, opacity: 0.95, filter: 'drop-shadow(0 0 50px rgba(255,255,255,0.12))' }} />
        </div>

        <div style={{ textAlign: 'center', maxWidth: 680, position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, color: '#f0f0f0', letterSpacing: '0.2em', marginBottom: 24, animation: 'fadeUp 0.7s ease 0.05s both' }}>LINK IN BIO · SIMPLE · AYTEELABS</div>

          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.04em', color: '#f0f0f0', marginBottom: 24, fontFamily: "'DM Sans', sans-serif", animation: 'fadeUp 0.7s ease 0.15s both' }}>
            your links,<br />your layout.
          </h1>

          <p style={{ fontSize: 14, color: '#888', lineHeight: 1.8, marginBottom: 48, fontFamily: "'DM Sans', sans-serif", animation: 'fadeUp 0.7s ease 0.25s both' }}>
            No bloat. No templates. Four layouts.<br />Claim a handle and go live in under a minute.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', background: '#0e0e0e', border: '1px solid #1e1e1e', borderRadius: 4, overflow: 'hidden', maxWidth: 500, margin: '0 auto 16px', animation: 'fadeUp 0.7s ease 0.35s both', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
            <span style={{ padding: '14px 16px', fontSize: 11, color: '#555', borderRight: '1px solid #1a1a1a', whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '0.02em' }}>linkdrop.ayteelabs.com/</span>
            <span style={{ flex: 1, padding: '14px 12px', fontSize: 14, color: '#f0f0f0', minWidth: 80 }}>
              {typed}<span style={{ opacity: tick ? 1 : 0 }}>|</span>
            </span>
            <Link href="/claim" style={{ padding: '14px 22px', background: '#f0f0f0', color: '#111', textDecoration: 'none', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', whiteSpace: 'nowrap', flexShrink: 0 }}>CLAIM →</Link>
          </div>

          <p style={{ fontSize: 11, color: '#f0f0f0', letterSpacing: '0.1em', animation: 'fadeUp 0.7s ease 0.45s both', opacity: 0.6 }}>one handle · one password · yours forever</p>
        </div>

        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'pulse 2s ease-in-out infinite' }}>
          <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, transparent, #2a2a2a)' }} />
          <div style={{ fontSize: 7, color: '#555', letterSpacing: '0.15em' }}>SCROLL</div>
        </div>
      </section>

      {/* Layouts */}
      <section style={{ padding: '100px 40px', borderTop: '1px solid #141414' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ fontSize: 10, color: '#888', letterSpacing: '0.2em', marginBottom: 14 }}>02 — LAYOUTS</div>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: '#f0f0f0', marginBottom: 12, fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.1 }}>four ways to show<br />your links.</h2>
            <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, maxWidth: 400, marginBottom: 56, fontFamily: "'DM Sans', sans-serif" }}>Switch layouts with one click. Mix sizes within any layout. Every link can have its own image.</p>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: '#141414', borderRadius: 3, overflow: 'hidden' }}>
            {LAYOUTS.map((l, i) => (
              <FadeIn key={l.name} delay={i * 0.07}>
                <div onClick={() => setActiveLayout(i)} style={{ padding: '28px 32px', background: activeLayout === i ? '#111' : '#0c0c0c', cursor: 'pointer', transition: 'all 0.35s', borderLeft: `2px solid ${activeLayout === i ? '#f0f0f0' : 'transparent'}` }}>
                  <div style={{ fontSize: 8, color: activeLayout === i ? '#f0f0f0' : '#777', letterSpacing: '0.15em', marginBottom: 8, transition: 'color 0.35s' }}>{l.name}</div>
                  <div style={{ fontSize: 12, color: activeLayout === i ? '#888' : '#555', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, transition: 'color 0.35s' }}>{l.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 40px', borderTop: '1px solid #141414' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ fontSize: 10, color: '#888', letterSpacing: '0.2em', marginBottom: 14 }}>03 — FEATURES</div>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: '#f0f0f0', marginBottom: 56, fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.1 }}>everything you need.<br />nothing you don&apos;t.</h2>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#141414' }}>
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.06}>
                <div style={{ padding: '28px', background: '#0c0c0c', transition: 'background 0.2s', cursor: 'default' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#101010'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#0c0c0c'}>
                  <div style={{ fontSize: 18, marginBottom: 12 }}>{f.icon}</div>
                  <div style={{ fontSize: 10, color: '#f0f0f0', letterSpacing: '0.08em', marginBottom: 8 }}>{f.title.toUpperCase()}</div>
                  <div style={{ fontSize: 13, color: '#777', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>{f.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '100px 40px', borderTop: '1px solid #141414' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ fontSize: 10, color: '#888', letterSpacing: '0.2em', marginBottom: 14 }}>04 — HOW IT WORKS</div>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: '#f0f0f0', marginBottom: 56, fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.1 }}>live in under<br />a minute.</h2>
          </FadeIn>
          {STEPS.map((step, i) => (
            <FadeIn key={step.n} delay={i * 0.1}>
              <div style={{ display: 'flex', gap: 40, padding: '32px 0', borderBottom: '1px solid #141414', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.1em', flexShrink: 0, marginTop: 3, fontFamily: "'DM Mono', monospace" }}>{step.n}</div>
                <div>
                  <div style={{ fontSize: 14, color: '#f0f0f0', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>{step.title}</div>
                  <div style={{ fontSize: 12, color: '#888', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", maxWidth: 480 }}>{step.desc}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Explore CTA */}
      <section style={{ padding: '100px 40px', borderTop: '1px solid #141414' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ fontSize: 10, color: '#888', letterSpacing: '0.2em', marginBottom: 14 }}>05 — EXPLORE</div>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: '#f0f0f0', marginBottom: 14, fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.1 }}>see what others<br />have built.</h2>
            <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, maxWidth: 420, marginBottom: 32, fontFamily: "'DM Sans', sans-serif" }}>Browse real profiles. Sort by newest, most viewed, or recently updated. Copy any theme to your own profile — password verified.</p>
            <Link href="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'transparent', color: '#aaa', border: '1px solid #333', borderRadius: 3, fontSize: 9, textDecoration: 'none', letterSpacing: '0.1em', transition: 'all 0.2s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#f0f0f0'; el.style.color = '#f0f0f0' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#222'; el.style.color = '#888' }}
            >VIEW EXPLORE PAGE →</Link>
          </FadeIn>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '140px 40px', borderTop: '1px solid #141414', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 500, background: 'radial-gradient(ellipse, rgba(255,255,255,0.025) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <FadeIn>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
              <img src="/logo.png" alt="" style={{ width: 72, height: 72, opacity: 0.85, filter: 'drop-shadow(0 0 32px rgba(255,255,255,0.15))' }} />
            </div>
            <h2 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 300, color: '#f0f0f0', marginBottom: 14, fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.04em', lineHeight: 1.1 }}>claim your handle.</h2>
            <p style={{ fontSize: 12, color: '#aaa', marginBottom: 40, letterSpacing: '0.1em' }}>one handle · one password · yours forever</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' as const }}>
              <Link href="/claim" style={{ padding: '12px 28px', background: '#f0f0f0', color: '#111', textDecoration: 'none', borderRadius: 3, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', transition: 'opacity 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
              >GET STARTED →</Link>
              <Link href="/login" style={{ padding: '12px 28px', background: 'transparent', color: '#999', textDecoration: 'none', border: '1px solid #333', borderRadius: 3, fontSize: 9, letterSpacing: '0.12em', transition: 'all 0.2s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#333'; el.style.color = '#888' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#1e1e1e'; el.style.color = '#555' }}
              >SIGN IN</Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '28px 40px', borderTop: '1px solid #141414', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo.png" alt="" style={{ width: 14, height: 14, opacity: 0.5 }} />
          <span style={{ fontSize: 8, color: '#aaa', letterSpacing: '0.12em' }}>LINKDROP</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['EXPLORE', '/explore'], ['DOCS', '/docs'], ['SIGN IN', '/login'], ['CLAIM', '/']].map(([label, href]) => (
            <Link key={label} href={href} style={{ fontSize: 8, color: '#555', textDecoration: 'none', letterSpacing: '0.1em', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f0f0f0'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#555'}
            >{label}</Link>
          ))}
        </div>
        <a href="https://ayteelabs.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 8, color: '#555', letterSpacing: '0.1em', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f0f0f0'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#555'}>AYTEELABS.COM</a>
      </footer>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        *{box-sizing:border-box;margin:0;padding:0}
      `}</style>
    </div>
  )
}
