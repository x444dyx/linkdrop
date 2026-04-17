'use client'
import { useEffect } from 'react'
import type { Profile } from '@/lib/supabase'

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#111111' : '#f0f0f0'
}

export default function PublicProfile({ profile, avatarUrl, customBg, customAccent }: {
  profile: Profile
  avatarUrl?: string
  customBg?: string
  customAccent?: string
}) {
  const { handle, bio, avatar_initials, avatar_color, links, layout, theme } = profile

  useEffect(() => {
    fetch('/api/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ handle: profile.handle }) })
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
  const textMuted = accent ? accent + '55' : (isDark ? '#555555' : '#aaaaaa')
  const dotColor = accent || (isDark ? '#f0f0f0' : '#111111')

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0c0c0c',
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: "'DM Mono', monospace",
    }}>
      <div style={{
        width: '100%',
        maxWidth: 560,
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: 4,
        overflow: 'hidden',
      }}>

        {/* Top bar */}
        <div style={{
          padding: '12px 20px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <img src="/logo.png" alt="" style={{ width: 14, height: 14, filter: isDark ? 'none' : 'invert(1)', opacity: 0.5 }} />
            <span style={{ fontSize: 10, color: textPrimary, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.4 }}>linkdrop</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i === 1 ? dotColor : borderColor }} />
            ))}
          </div>
        </div>

        {/* Profile section */}
        <div style={{
          padding: '28px 28px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          borderBottom: `1px solid ${borderColor}`,
        }}>
          <div style={{
            width: 80, height: 80,
            borderRadius: '50%',
            background: avatar_color,
            flexShrink: 0,
            overflow: 'hidden',
            position: 'relative',
            border: `1px solid ${borderColor}`,
          }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 500, color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>{avatar_initials}</div>
            }
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: textPrimary, letterSpacing: '0.01em', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
              @{handle}
            </div>
            <div style={{ fontSize: 13, color: textSecondary, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
              {bio}
            </div>
          </div>
        </div>

        {/* Links */}
        <div style={{ padding: layout === 'icons' ? '20px 28px' : layout === 'bubbles' ? '16px 28px' : '8px 0' }}>

          {layout === 'rows' && links.map((link, i) => {
            const sz = link.size || 'small'
            const isLast = i === links.length - 1

            if (sz === 'large') return (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); trackClick(link.id, link.url) }}
                style={{
                  display: 'block', textDecoration: 'none',
                  borderBottom: !isLast ? `1px solid ${borderColor}` : 'none',
                  transition: 'background 0.1s', overflow: 'hidden',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#ffffff06'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                {/* Banner */}
                <div style={{ width: '100%', aspectRatio: '16/7', background: link.color, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {link.avatar_url
                    ? <img src={link.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                    : <span style={{ fontSize: 28, fontWeight: 500, color: '#fff', letterSpacing: '0.05em', fontFamily: "'DM Mono', monospace" }}>{link.initials}</span>
                  }
                </div>
                {/* Label row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', color: textPrimary }}>
                  <span style={{ fontSize: 15, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.02em' }}>{link.label}</span>
                  <span style={{ fontSize: 11, color: textPrimary, fontFamily: "'DM Mono', monospace", opacity: 0.4 }}>→</span>
                </div>
              </a>
            )

            if (sz === 'medium') return (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); trackClick(link.id, link.url) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 28px',
                  borderBottom: !isLast ? `1px solid ${borderColor}` : 'none',
                  textDecoration: 'none', color: textPrimary,
                  fontSize: 14, letterSpacing: '0.03em',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#ffffff06'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: link.color, flexShrink: 0, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: '#fff' }}>
                  {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : link.initials}
                </div>
                <span style={{ flex: 1 }}>{link.label}</span>
                <span style={{ fontSize: 11, color: textPrimary, fontFamily: "'DM Mono', monospace", opacity: 0.4 }}>→</span>
              </a>
            )

            return (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); trackClick(link.id, link.url) }}
                onClick={e => { e.preventDefault(); trackClick(link.id, link.url) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 28px',
                  borderBottom: !isLast ? `1px solid ${borderColor}` : 'none',
                  textDecoration: 'none', color: textPrimary,
                  fontSize: 12, letterSpacing: '0.03em',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#ffffff06'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: link.color, flexShrink: 0, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 500, color: '#fff' }}>
                  {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : link.initials}
                </div>
                <span style={{ flex: 1 }}>{link.label}</span>
                <span style={{ fontSize: 10, color: textPrimary, fontFamily: "'DM Mono', monospace", opacity: 0.4 }}>→</span>
              </a>
            )
          })}

          {layout === 'bubbles' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {links.map(link => {
                const sz = link.size || 'small'
                if (sz === 'large') return (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); trackClick(link.id, link.url) }} style={{ width: '100%', display: 'block', textDecoration: 'none', border: `1px solid ${borderColor}`, borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.1s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = accent || '#888'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = borderColor}>
                    <div style={{ width: '100%', aspectRatio: '16/7', background: link.color, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 24, fontWeight: 500, color: '#fff', fontFamily: "'DM Mono', monospace" }}>{link.initials}</span>}
                    </div>
                    <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: textPrimary, fontFamily: "'DM Sans', sans-serif" }}>{link.label}</span>
                      <span style={{ fontSize: 11, color: textPrimary, opacity: 0.4 }}>→</span>
                    </div>
                  </a>
                )
                const avSize = sz === 'medium' ? 32 : 22
                const fSize = sz === 'medium' ? 14 : 12
                const pad = sz === 'medium' ? '9px 18px 9px 10px' : '6px 14px 6px 7px'
                return (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); trackClick(link.id, link.url) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: pad, border: `1px solid ${borderColor}`, borderRadius: 99, fontSize: fSize, color: textPrimary, textDecoration: 'none', letterSpacing: '0.03em', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.1s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = accent || '#888'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = borderColor}>
                    <div style={{ width: avSize, height: avSize, borderRadius: '50%', background: link.color, flexShrink: 0, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.floor(avSize * 0.35), fontWeight: 500, color: '#fff' }}>
                      {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : link.initials}
                    </div>
                    {link.label}
                  </a>
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
                      <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); trackClick(link.id, link.url) }} style={{ display: 'block', background: cardBg, textDecoration: 'none', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#ffffff06'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = cardBg}>
                        <div style={{ width: '100%', aspectRatio: '16/7', background: link.color, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 24, fontWeight: 500, color: '#fff', fontFamily: "'DM Mono', monospace" }}>{link.initials}</span>}
                        </div>
                        <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 14, fontWeight: 500, color: textPrimary, fontFamily: "'DM Sans', sans-serif" }}>{link.label}</span>
                          <span style={{ fontSize: 11, color: textPrimary, opacity: 0.4 }}>→</span>
                        </div>
                      </a>
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
                          <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); trackClick(l.id, l.url) }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: (l.size||'small') === 'medium' ? '24px 16px' : '18px 16px', background: cardBg, textDecoration: 'none', transition: 'background 0.1s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#ffffff06'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = cardBg}>
                            <div style={{ width: pi === 0 ? avSize : avSizeNext, height: pi === 0 ? avSize : avSizeNext, borderRadius: '50%', background: accent || l.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.floor((pi === 0 ? avSize : avSizeNext) * 0.28), fontWeight: 500, overflow: 'hidden', position: 'relative' }}>
                              {l.avatar_url ? <img src={l.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : l.initials}
                            </div>
                            <div style={{ fontSize: pi === 0 ? fSize : fSizeNext, color: textPrimary, textAlign: 'center', padding: '0 8px', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>{l.label}</div>
                          </a>
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
                const initFSize = Math.floor(iconSize * 0.28)
                return (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); trackClick(link.id, link.url) }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none', transition: 'opacity 0.1s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.6'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
                    <div style={{ width: iconSize, height: iconSize, borderRadius: '50%', background: link.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: initFSize, fontWeight: 500, border: `1px solid ${borderColor}`, overflow: 'hidden', position: 'relative' }}>
                      {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : link.initials}
                    </div>
                    <div style={{ fontSize: fSize, color: textPrimary, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", textAlign: 'center', maxWidth: iconSize + 20 }}>
                      {link.label}
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 28px',
          borderTop: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <a href="https://linkdrop.ayteelabs.com" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 9, color: textPrimary, textDecoration: 'none', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.35 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.35' }}
          >
            linkdrop.ayteelabs.com
          </a>
          <a href="https://ayteelabs.com" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 9, color: textPrimary, textDecoration: 'none', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.35 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.35' }}
          >
            ayteelabs.com
          </a>
        </div>
      </div>
    </div>
  )
}
