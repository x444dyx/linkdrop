'use client'
import type { Profile } from '@/lib/supabase'

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#111111' : '#f0f0f0'
}

export default function ProfilePreview({ profile, customBg, customAccent }: {
  profile: Profile
  customBg?: string
  customAccent?: string
}) {
  const { handle, bio, avatar_initials, avatar_color, links, layout, theme } = profile
  const avatarUrl = (profile as any).avatar_url || ''

  const bg = customBg || null
  const accent = customAccent || null

  const outerBg = '#0a0a0a'
  const cardBg = bg || '#111111'
  const isDark = bg ? getContrastColor(bg) === '#f0f0f0' : true
  const borderColor = accent ? accent + '33' : isDark ? '#2a2a2a' : '#cccccc44'
  const textPrimary = accent || (isDark ? '#f0f0f0' : '#111111')
  const textSecondary = accent ? accent + 'aa' : (isDark ? '#888888' : '#555555')
  const textMuted = accent ? accent + '55' : (isDark ? '#444444' : '#aaaaaa')
  const dotColor = accent || (isDark ? '#f0f0f0' : '#111111')

  return (
    <div style={{
      width: 340,
      background: outerBg,
      borderRadius: 4,
      padding: '16px 16px 0 16px',
      flexShrink: 0,
      backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
    }}>
      <div style={{
        width: '100%',
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: 4,
        overflow: 'hidden',
        fontFamily: "'DM Mono', monospace",
      }}>
        {/* Top bar */}
        <div style={{
          padding: '7px 12px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <img src="/logo.png" alt="" style={{ width: 10, height: 10, filter: isDark ? 'none' : 'invert(1)', opacity: 0.5 }} />
            <span style={{ fontSize: 9, color: textPrimary, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4 }}>linkdrop</span>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: i === 1 ? dotColor : borderColor }} />
            ))}
          </div>
        </div>

        {/* Profile */}
        <div style={{ padding: '14px 12px 10px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${borderColor}` }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: avatar_color, flexShrink: 0,
            overflow: 'hidden', position: 'relative',
            border: `1px solid ${borderColor}`,
          }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#fff' }}>{avatar_initials}</div>
            }
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary, marginBottom: 3, fontFamily: "'DM Sans', sans-serif" }}>@{handle}</div>
            <div style={{ fontSize: 11, color: textSecondary, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{bio}</div>
          </div>
        </div>

        {/* Links */}
        <div style={{ padding: layout === 'bubbles' || layout === 'icons' ? '8px 12px' : '4px 0' }}>
          {layout === 'rows' && links.map((link, i) => {
            const sz = link.size || 'small'
            const isLast = i === links.length - 1

            if (sz === 'large') return (
              <div key={link.id} style={{ borderBottom: !isLast ? `1px solid ${borderColor}` : 'none', overflow: 'hidden' }}>
                <div style={{ width: '100%', aspectRatio: '16/7', background: link.color, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {link.avatar_url
                    ? <img src={link.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                    : <span style={{ fontSize: 14, fontWeight: 500, color: '#fff', letterSpacing: '0.05em' }}>{link.initials}</span>
                  }
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', color: textPrimary }}>
                  <span style={{ fontSize: 10, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{link.label}</span>
                  <span style={{ fontSize: 8, opacity: 0.4 }}>→</span>
                </div>
              </div>
            )

            if (sz === 'medium') return (
              <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: !isLast ? `1px solid ${borderColor}` : 'none', fontSize: 10, color: textPrimary, fontFamily: "'DM Sans', sans-serif" }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: link.color, flexShrink: 0, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 500, color: '#fff' }}>
                  {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : link.initials}
                </div>
                <span style={{ flex: 1 }}>{link.label}</span>
                <span style={{ fontSize: 8, opacity: 0.4 }}>→</span>
              </div>
            )

            return (
              <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderBottom: !isLast ? `1px solid ${borderColor}` : 'none', fontSize: 9, color: textPrimary, fontFamily: "'DM Sans', sans-serif" }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: link.color, flexShrink: 0, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, fontWeight: 500, color: '#fff' }}>
                  {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : link.initials}
                </div>
                <span style={{ flex: 1 }}>{link.label}</span>
                <span style={{ fontSize: 7, opacity: 0.4 }}>→</span>
              </div>
            )
          })}

          {layout === 'bubbles' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {links.map(link => {
                const sz = link.size || 'small'
                if (sz === 'large') return (
                  <div key={link.id} style={{ width: '100%', border: `1px solid ${borderColor}`, borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: '100%', aspectRatio: '16/7', background: link.color, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 11, fontWeight: 500, color: '#fff' }}>{link.initials}</span>}
                    </div>
                    <div style={{ padding: '6px 10px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 9, fontWeight: 500, color: textPrimary, fontFamily: "'DM Sans', sans-serif" }}>{link.label}</span>
                      <span style={{ fontSize: 7, opacity: 0.4, color: textPrimary }}>→</span>
                    </div>
                  </div>
                )
                const avSize = sz === 'medium' ? 20 : 14
                const fSize = sz === 'medium' ? 10 : 8
                const pad = sz === 'medium' ? '5px 10px 5px 6px' : '3px 8px 3px 4px'
                return (
                  <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: pad, border: `1px solid ${borderColor}`, borderRadius: 99, fontSize: fSize, color: textPrimary, fontFamily: "'DM Sans', sans-serif" }}>
                    <div style={{ width: avSize, height: avSize, borderRadius: '50%', background: link.color, flexShrink: 0, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.floor(avSize * 0.4), fontWeight: 500, color: '#fff' }}>
                      {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : link.initials}
                    </div>
                    {link.label}
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
                      <div key={link.id} style={{ background: cardBg }}>
                        <div style={{ width: '100%', aspectRatio: '16/7', background: link.color, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 10, fontWeight: 500, color: '#fff' }}>{link.initials}</span>}
                        </div>
                        <div style={{ padding: '5px 10px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 8, fontWeight: 500, color: textPrimary, fontFamily: "'DM Sans', sans-serif" }}>{link.label}</span>
                          <span style={{ fontSize: 7, opacity: 0.4, color: textPrimary }}>→</span>
                        </div>
                      </div>
                    )
                    i++
                  } else {
                    const next = links[i + 1]
                    const pair = next && (next.size || 'small') !== 'large' ? [link, next] : [link]
                    const avSize = sz === 'medium' ? 26 : 20
                    rows.push(
                      <div key={link.id} style={{ display: 'grid', gridTemplateColumns: pair.length === 2 ? '1fr 1fr' : '1fr', gap: 1, background: borderColor }}>
                        {pair.map(l => (
                          <div key={l.id} style={{ aspectRatio: '1', background: cardBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            <div style={{ width: avSize, height: avSize, borderRadius: '50%', background: accent || l.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.floor(avSize * 0.3), fontWeight: 500, overflow: 'hidden', position: 'relative' }}>
                              {l.avatar_url ? <img src={l.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : l.initials}
                            </div>
                            <div style={{ fontSize: 7, color: textPrimary, textAlign: 'center', padding: '0 4px', fontFamily: "'DM Sans', sans-serif" }}>{l.label}</div>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {links.map(link => {
                const sz = link.size || 'small'
                const iconSize = sz === 'large' ? 48 : sz === 'medium' ? 36 : 26
                return (
                  <div key={link.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{ width: iconSize, height: iconSize, borderRadius: '50%', background: link.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.floor(iconSize * 0.3), fontWeight: 500, border: `1px solid ${borderColor}`, overflow: 'hidden', position: 'relative' }}>
                      {link.avatar_url ? <img src={link.avatar_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : link.initials}
                    </div>
                    <div style={{ fontSize: sz === 'large' ? 7 : 6, color: textPrimary, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", textAlign: 'center', maxWidth: iconSize + 10 }}>{link.label}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '7px 12px',
          borderTop: `1px solid ${borderColor}`,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 9, color: textPrimary, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.35 }}>linkdrop.ayteelabs.com</span>
          <span style={{ fontSize: 9, color: textPrimary, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.35 }}>ayteelabs.com</span>
        </div>
      </div>
    </div>
  )
}
