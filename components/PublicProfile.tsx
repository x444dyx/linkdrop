'use client'
import { useEffect, useState } from 'react'
import type { Profile } from '@/lib/supabase'

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#111111' : '#f0f0f0'
}

function ShareModal({ handle, avatarUrl, avatarInitials, avatarColor, bio, textPrimary, cardBg, borderColor, accent, isDark, onClose, linkLabel, linkUrl, linkAvatarUrl, linkColor, linkInitials }: any) {
  const [copied, setCopied] = useState(false)
  const profileUrl = `https://linkdrop.ayteelabs.com/${handle}`
  const linkAnchor = linkLabel ? `https://linkdrop.ayteelabs.com/${handle}#link-${linkLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : null
  const shareUrl = linkAnchor || profileUrl
  const shareTitle = linkLabel ? `${linkLabel} — @${handle} on Linkdrop` : `@${handle} on Linkdrop`
  const shareText = linkLabel ? `Check out "${linkLabel}" from @${handle}` : `Check out @${handle}'s Linkdrop`

  const copy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const SOCIALS = [
    { label: 'Copy link', icon: copied ? '✓' : '⎘', color: isDark ? '#2a2a2a' : '#e8e8e8', textColor: isDark ? '#f0f0f0' : '#111', action: copy },
    { label: 'X', icon: 'X', color: '#000', textColor: '#fff', action: () => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank') },
    { label: 'WhatsApp', icon: '●', color: '#25D366', textColor: '#fff', action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank') },
    { label: 'LinkedIn', icon: 'in', color: '#0077B5', textColor: '#fff', action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank') },
    { label: 'Facebook', icon: 'f', color: '#1877F2', textColor: '#fff', action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank') },
  ]

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', fontFamily: "'DM Sans', sans-serif" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: isDark ? '#111' : '#fff', borderRadius: '16px 16px 0 0', padding: '0 0 40px', overflow: 'hidden', animation: 'slideUp 0.25s ease' }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>

        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: isDark ? '#333' : '#ddd', margin: '12px auto 0' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 0' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#f0f0f0' : '#111' }}>
            {linkLabel ? 'Share link' : 'Share profile'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: isDark ? '#888' : '#888', lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {/* Preview card */}
        {!linkLabel && (
          <div style={{ margin: '16px 20px', borderRadius: 12, overflow: 'hidden', background: cardBg, border: `1px solid ${borderColor}` }}>
            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: avatarColor, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 500, color: '#fff' }}>
                {avatarUrl ? <img src={avatarUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : avatarInitials}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: textPrimary, marginBottom: 4 }}>@{handle}</div>
                {bio && <div style={{ fontSize: 12, color: isDark ? '#888' : '#666', maxWidth: 260 }}>{bio}</div>}
              </div>
              <div style={{ fontSize: 11, color: isDark ? '#555' : '#aaa', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
                linkdrop.ayteelabs.com/{handle}
              </div>
            </div>
          </div>
        )}

        {/* Link preview */}
        {linkLabel && (
          <div style={{ margin: '16px 20px', borderRadius: 12, overflow: 'hidden', background: isDark ? '#1a1a1a' : '#f5f5f5', border: `1px solid ${borderColor}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: linkColor || accent || '#534AB7', flexShrink: 0, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff' }}>
              {linkAvatarUrl
                ? <img src={linkAvatarUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                : linkInitials || '↗'
              }
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#f0f0f0' : '#111' }}>{linkLabel}</div>
              <div style={{ fontSize: 11, color: isDark ? '#666' : '#aaa', marginTop: 2 }}>{linkUrl}</div>
            </div>
          </div>
        )}

        {/* Share buttons */}
        <div style={{ display: 'flex', gap: 16, padding: '8px 20px', overflowX: 'auto' as const }}>
          {SOCIALS.map(s => (
            <button key={s.label} onClick={s.action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: s.label === 'X' ? 16 : 18, fontWeight: 700, color: s.textColor, border: s.label === 'Copy link' ? `1px solid ${isDark ? '#333' : '#ccc'}` : 'none', transition: 'opacity 0.15s' }}>
                {s.icon}
              </div>
              <span style={{ fontSize: 11, color: isDark ? '#888' : '#666', whiteSpace: 'nowrap' as const }}>{s.label === 'Copy link' && copied ? 'Copied!' : s.label}</span>
            </button>
          ))}
        </div>

        {/* Claim CTA */}
        {!linkLabel && (
          <div style={{ margin: '20px 20px 0', padding: '16px', background: isDark ? '#1a1a1a' : '#f5f5f5', borderRadius: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#f0f0f0' : '#111', marginBottom: 4 }}>Get your own Linkdrop</div>
            <div style={{ fontSize: 12, color: isDark ? '#888' : '#666', marginBottom: 12 }}>Free forever. Your links, your layout.</div>
            <a href="/claim" style={{ display: 'inline-block', padding: '8px 20px', background: isDark ? '#f0f0f0' : '#111', color: isDark ? '#111' : '#fff', borderRadius: 99, fontSize: 12, fontWeight: 600, textDecoration: 'none', letterSpacing: '0.02em' }}>Claim your handle →</a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PublicProfile({ profile, avatarUrl, customBg, customAccent }: {
  profile: Profile
  avatarUrl?: string
  customBg?: string
  customAccent?: string
}) {
  const { handle, bio, avatar_initials, avatar_color, links, layout, theme } = profile
  const [showShare, setShowShare] = useState(false)
  const [linkShare, setLinkShare] = useState<{ label: string; url: string; avatarUrl?: string; color?: string; initials?: string } | null>(null)

  const [highlightedLink, setHighlightedLink] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ handle: profile.handle }) })
  }, [])

  useEffect(() => {
    const hash = window.location.hash
    if (!hash || !hash.startsWith('#link-')) return
    const slug = hash.replace('#link-', '')
    const matched = links.find(l => l.label.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug)
    if (!matched) return

    let attempts = 0
    const interval = setInterval(() => {
      attempts++
      const el = document.getElementById(`link-${matched.id}`)
      if (el) {
        clearInterval(interval)
        setHighlightedLink(matched.id)
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      if (attempts > 20) clearInterval(interval)
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const trackClick = (linkId: string, url: string) => {
    fetch('/api/click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ handle: profile.handle, link_id: linkId }) })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const bg = customBg || null
  const accent = customAccent || null
  const cardBg = bg || '#111111'
  const isDark = bg ? getContrastColor(bg) === '#f0f0f0' : true
  const borderColor = accent ? accent + '33' : isDark ? '#2a2a2a' : '#cccccc44'
  const textPrimary = accent || (isDark ? '#f0f0f0' : '#111111')
  const textSecondary = accent ? accent + 'aa' : (isDark ? '#888888' : '#555555')
  const dotColor = accent || (isDark ? '#f0f0f0' : '#111111')

  const ShareBtn = ({ label, url, avatarUrl: linkAvatarUrl, color, initials }: { label: string; url: string; avatarUrl?: string; color?: string; initials?: string }) => (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); setLinkShare({ label, url, avatarUrl: linkAvatarUrl, color, initials }); setShowShare(true) }}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', opacity: 0.4, transition: 'opacity 0.15s', flexShrink: 0, color: textPrimary, fontSize: 14, display: 'flex', alignItems: 'center' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.4'}
      title="Share this link"
    >
      ···
    </button>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0c0c0c',
      backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: "'DM Mono', monospace",
    }}>
      <style>{`
        @keyframes shake {
          0%   { transform: translateX(0) }
          10%  { transform: translateX(-8px) }
          20%  { transform: translateX(8px) }
          30%  { transform: translateX(-7px) }
          40%  { transform: translateX(7px) }
          50%  { transform: translateX(-5px) }
          60%  { transform: translateX(5px) }
          70%  { transform: translateX(-3px) }
          80%  { transform: translateX(3px) }
          90%  { transform: translateX(-1px) }
          100% { transform: translateX(0) }
        }
        .link-highlighted {
          animation: shake 0.7s cubic-bezier(.36,.07,.19,.97) both !important;
          outline: 1px solid rgba(255,255,255,0.2) !important;
          outline-offset: -1px !important;
        }
      `}</style>
      <div style={{ width: '100%', maxWidth: 560, background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 4, overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Left — claim button */}
          <a href="/claim"
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = textPrimary; el.style.opacity = '1' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = borderColor; el.style.opacity = '0.7' }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', padding: '4px 10px', border: `1px solid ${borderColor}`, borderRadius: 99, transition: 'all 0.15s', opacity: 0.7 }}
          >
            <img src="/logo.png" alt="" style={{ width: 12, height: 12, filter: isDark ? 'none' : 'invert(1)', opacity: 0.8 }} />
            <span style={{ fontSize: 9, color: textPrimary, letterSpacing: '0.12em' }}>GET YOURS</span>
          </a>

          {/* Right — share button */}
          <button onClick={() => { setLinkShare(null); setShowShare(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: `1px solid ${borderColor}`, borderRadius: 99, padding: '5px 12px', cursor: 'pointer', transition: 'all 0.15s', opacity: 0.7 }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = textPrimary; el.style.opacity = '1' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = borderColor; el.style.opacity = '0.7' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            <span style={{ fontSize: 9, color: textPrimary, letterSpacing: '0.12em' }}>SHARE</span>
          </button>
        </div>

        {/* Profile section */}
        <div style={{ padding: '28px 28px 24px', display: 'flex', alignItems: 'center', gap: 20, borderBottom: `1px solid ${borderColor}` }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: avatar_color, flexShrink: 0, overflow: 'hidden', position: 'relative', border: `1px solid ${borderColor}` }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 500, color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>{avatar_initials}</div>
            }
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: textPrimary, letterSpacing: '0.01em', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>@{handle}</div>
            <div style={{ fontSize: 13, color: textSecondary, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>{bio}</div>
          </div>
        </div>

        {/* Links */}
        <div style={{ padding: layout === 'icons' ? '20px 28px' : layout === 'bubbles' ? '16px 28px' : '8px 0' }}>

          {layout === 'rows' && links.map((link, i) => {
            const sz = link.size || 'small'
            const isLast = i === links.length - 1

            if (sz === 'large') return (
              <div id={`link-${link.id}`} key={link.id} className={highlightedLink === link.id ? 'link-highlighted' : ''} style={{ borderBottom: !isLast ? `1px solid ${borderColor}` : 'none', position: 'relative', borderRadius: 2, transition: 'background 0.3s', background: highlightedLink === link.id ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)') : 'transparent' }} onClick={() => { setHighlightedLink(null); history.replaceState(null, '', window.location.pathname) }}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); trackClick(link.id, link.url) }}
                  style={{ display: 'block', textDecoration: 'none', transition: 'background 0.1s', overflow: 'hidden' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#ffffff06'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <div style={{ width: '100%', aspectRatio: '16/7', background: link.color, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} /> : <span style={{ fontSize: 28, fontWeight: 500, color: '#fff', letterSpacing: '0.05em', fontFamily: "'DM Mono', monospace" }}>{link.initials}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', color: textPrimary }}>
                    <span style={{ fontSize: 15, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{link.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ShareBtn label={link.label} url={link.url} avatarUrl={link.avatar_url} color={link.color} initials={link.initials} />
                      <span style={{ fontSize: 11, color: textPrimary, fontFamily: "'DM Mono', monospace", opacity: 0.4 }}>→</span>
                    </div>
                  </div>
                </a>
              </div>
            )

            if (sz === 'medium') return (
              <a id={`link-${link.id}`} key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); setHighlightedLink(null); history.replaceState(null, '', window.location.pathname); trackClick(link.id, link.url) }}
                className={highlightedLink === link.id ? 'link-highlighted' : ''}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 28px', borderBottom: !isLast ? `1px solid ${borderColor}` : 'none', textDecoration: 'none', color: textPrimary, fontSize: 14, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.1s', background: highlightedLink === link.id ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)') : 'transparent', borderRadius: 2 }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#ffffff06'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: link.color, flexShrink: 0, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: '#fff' }}>
                  {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : link.initials}
                </div>
                <span style={{ flex: 1 }}>{link.label}</span>
                <ShareBtn label={link.label} url={link.url} avatarUrl={link.avatar_url} color={link.color} initials={link.initials} />
                <span style={{ fontSize: 11, color: textPrimary, fontFamily: "'DM Mono', monospace", opacity: 0.4 }}>→</span>
              </a>
            )

            return (
              <a id={`link-${link.id}`} key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); setHighlightedLink(null); history.replaceState(null, '', window.location.pathname); trackClick(link.id, link.url) }}
                className={highlightedLink === link.id ? 'link-highlighted' : ''}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 28px', borderBottom: !isLast ? `1px solid ${borderColor}` : 'none', textDecoration: 'none', color: textPrimary, fontSize: 12, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.1s', background: highlightedLink === link.id ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)') : 'transparent', borderRadius: 2 }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#ffffff06'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: link.color, flexShrink: 0, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 500, color: '#fff' }}>
                  {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : link.initials}
                </div>
                <span style={{ flex: 1 }}>{link.label}</span>
                <ShareBtn label={link.label} url={link.url} avatarUrl={link.avatar_url} color={link.color} initials={link.initials} />
                <span style={{ fontSize: 10, color: textPrimary, fontFamily: "'DM Mono', monospace", opacity: 0.4 }}>→</span>
              </a>
            )
          })}

          {layout === 'bubbles' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {links.map(link => {
                const sz = link.size || 'small'
                if (sz === 'large') return (
                  <div id={`link-${link.id}`} key={link.id} className={highlightedLink === link.id ? 'link-highlighted' : ''} style={{ width: '100%', position: 'relative', borderRadius: 8, background: highlightedLink === link.id ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)') : 'transparent' }}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); trackClick(link.id, link.url) }} style={{ width: '100%', display: 'block', textDecoration: 'none', border: `1px solid ${borderColor}`, borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.1s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = accent || '#888'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = borderColor}>
                      <div style={{ width: '100%', aspectRatio: '16/7', background: link.color, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 24, fontWeight: 500, color: '#fff', fontFamily: "'DM Mono', monospace" }}>{link.initials}</span>}
                      </div>
                      <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: textPrimary, fontFamily: "'DM Sans', sans-serif" }}>{link.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ShareBtn label={link.label} url={link.url} avatarUrl={link.avatar_url} color={link.color} initials={link.initials} />
                          <span style={{ fontSize: 11, color: textPrimary, opacity: 0.4 }}>→</span>
                        </div>
                      </div>
                    </a>
                  </div>
                )
                const pad = sz === 'medium' ? '8px 14px' : '6px 12px'
                const fSize = sz === 'medium' ? 13 : 12
                const avSize = sz === 'medium' ? 28 : 22
                return (
                  <div id={`link-${link.id}`} key={link.id} className={highlightedLink === link.id ? 'link-highlighted' : ''} style={{ position: 'relative', display: 'flex', alignItems: 'center', borderRadius: 99, background: highlightedLink === link.id ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)') : 'transparent' }}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); trackClick(link.id, link.url) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: pad, border: `1px solid ${borderColor}`, borderRadius: 99, fontSize: fSize, color: textPrimary, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.1s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = accent || '#888'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = borderColor}>
                      <div style={{ width: avSize, height: avSize, borderRadius: '50%', background: link.color, flexShrink: 0, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.floor(avSize * 0.35), fontWeight: 500, color: '#fff' }}>
                        {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : link.initials}
                      </div>
                      {link.label}
                    </a>
                    <ShareBtn label={link.label} url={link.url} avatarUrl={link.avatar_url} color={link.color} initials={link.initials} />
                  </div>
                )
              })}
            </div>
          )}

          {layout === 'grid' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: borderColor }}>
              {(() => {
                const rows: any[] = []
                let i = 0
                while (i < links.length) {
                  const link = links[i]
                  const sz = link.size || 'small'
                  if (sz === 'large') {
                    rows.push(
                      <div id={`link-${link.id}`} key={link.id} className={highlightedLink === link.id ? 'link-highlighted' : ''} style={{ position: 'relative', background: highlightedLink === link.id ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)') : cardBg }}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); trackClick(link.id, link.url) }} style={{ display: 'block', background: cardBg, textDecoration: 'none', transition: 'background 0.1s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#ffffff06'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = cardBg}>
                          <div style={{ width: '100%', aspectRatio: '16/7', background: link.color, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 24, fontWeight: 500, color: '#fff', fontFamily: "'DM Mono', monospace" }}>{link.initials}</span>}
                          </div>
                          <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 14, fontWeight: 500, color: textPrimary, fontFamily: "'DM Sans', sans-serif" }}>{link.label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <ShareBtn label={link.label} url={link.url} avatarUrl={link.avatar_url} color={link.color} initials={link.initials} />
                              <span style={{ fontSize: 11, color: textPrimary, opacity: 0.4 }}>→</span>
                            </div>
                          </div>
                        </a>
                      </div>
                    )
                    i++
                  } else {
                    const next = links[i + 1]
                    const nextSz = next ? (next.size || 'small') : null
                    const avSize = sz === 'medium' ? 52 : 40
                    const avSizeNext = nextSz === 'medium' ? 52 : 40
                    const fSize = sz === 'medium' ? 12 : 11
                    const fSizeNext = nextSz === 'medium' ? 12 : 11
                    const pair = next && nextSz !== 'large' ? [link, next] : [link]
                    rows.push(
                      <div key={link.id} style={{ display: 'grid', gridTemplateColumns: pair.length === 2 ? '1fr 1fr' : '1fr', gap: 1, background: borderColor }}>
                        {pair.map((l, pi) => (
                          <div id={`link-${l.id}`} key={l.id} className={highlightedLink === l.id ? 'link-highlighted' : ''} style={{ position: 'relative', background: highlightedLink === l.id ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)') : cardBg }}>
                            <a href={l.url} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); trackClick(l.id, l.url) }}
                              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: (l.size||'small') === 'medium' ? '24px 16px' : '18px 16px', background: cardBg, textDecoration: 'none', transition: 'background 0.1s' }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#ffffff06'}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = cardBg}>
                              <div style={{ width: pi === 0 ? avSize : avSizeNext, height: pi === 0 ? avSize : avSizeNext, borderRadius: '50%', background: accent || l.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.floor((pi === 0 ? avSize : avSizeNext) * 0.28), fontWeight: 500, overflow: 'hidden', position: 'relative' }}>
                                {l.avatar_url ? <img src={l.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : l.initials}
                              </div>
                              <div style={{ fontSize: pi === 0 ? fSize : fSizeNext, color: textPrimary, textAlign: 'center', padding: '0 8px', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>{l.label}</div>
                            </a>
                            <div style={{ position: 'absolute', bottom: 6, right: 6 }}>
                              <ShareBtn label={l.label} url={l.url} avatarUrl={l.avatar_url} color={l.color} initials={l.initials} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                    i += pair.length
                  }
                }
                return rows
              })()}
            </div>
          )}

          {layout === 'icons' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
              {links.map(link => {
                const sz = link.size || 'small'
                const iconSize = sz === 'large' ? 80 : sz === 'medium' ? 60 : 44
                const fSize = sz === 'large' ? 11 : sz === 'medium' ? 10 : 9
                return (
                  <div id={`link-${link.id}`} key={link.id} className={highlightedLink === link.id ? 'link-highlighted' : ''} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative', borderRadius: 8, padding: 4, background: highlightedLink === link.id ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)') : 'transparent' }}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); trackClick(link.id, link.url) }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none', transition: 'opacity 0.1s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.6'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
                      <div style={{ width: iconSize, height: iconSize, borderRadius: '50%', background: link.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.floor(iconSize * 0.28), fontWeight: 500, border: `1px solid ${borderColor}`, overflow: 'hidden', position: 'relative' }}>
                        {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : link.initials}
                      </div>
                      <div style={{ fontSize: fSize, color: textPrimary, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", textAlign: 'center', maxWidth: iconSize + 20 }}>{link.label}</div>
                    </a>
                    <ShareBtn label={link.label} url={link.url} avatarUrl={link.avatar_url} color={link.color} initials={link.initials} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 28px', borderTop: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="https://linkdrop.ayteelabs.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: textPrimary, textDecoration: 'none', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.35 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.7'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.35'}>
            linkdrop.ayteelabs.com
          </a>
          <a href="https://ayteelabs.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: textPrimary, textDecoration: 'none', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.35 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.7'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.35'}>
            ayteelabs.com
          </a>
        </div>
      </div>

      {showShare && (
        <ShareModal
          handle={handle}
          avatarUrl={avatarUrl}
          avatarInitials={avatar_initials}
          avatarColor={avatar_color}
          bio={bio}
          textPrimary={textPrimary}
          cardBg={cardBg}
          borderColor={borderColor}
          accent={accent}
          isDark={isDark}
          onClose={() => { setShowShare(false); setLinkShare(null) }}
          linkLabel={linkShare?.label}
          linkUrl={linkShare?.url}
          linkAvatarUrl={linkShare?.avatarUrl}
          linkColor={linkShare?.color}
          linkInitials={linkShare?.initials}
        />
      )}
    </div>
  )
}
