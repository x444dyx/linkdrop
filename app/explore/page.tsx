'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ProfilePreview from '@/components/ProfilePreview'

const SCALE = 0.82

function ScaledPreview({ profile, footer }: { profile: any; footer: React.ReactNode }) {
  return (
    <div style={{ width: 340 * SCALE, display: 'flex', flexDirection: 'column' }}>
      <Link href={`/${profile.handle}`} style={{ textDecoration: 'none', display: 'block', borderRadius: 6, overflow: 'hidden', transition: 'transform 0.15s' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
      >
        <div style={{ zoom: SCALE, pointerEvents: 'none' }}>
          <ProfilePreview
            profile={{
              handle: profile.handle,
              bio: profile.bio || '',
              avatar_initials: profile.avatar_initials || '',
              avatar_color: profile.avatar_color || '#111',
              avatar_url: profile.avatar_url,
              links: profile.links || [],
              layout: profile.layout || 'rows',
              theme: profile.theme || 'dark',
            } as any}
            customBg={profile.custom_bg}
            customAccent={profile.custom_accent}
          />
        </div>
      </Link>
      <div style={{ padding: '4px 0', width: '100%' }}>{footer}</div>
    </div>
  )
}

type SortOption = 'newest' | 'updated' | 'views'

const PRESETS: Record<string, { bg: string; accent: string }> = {
  light: { bg: '#f5f4f0', accent: '#111110' },
  dark: { bg: '#111110', accent: '#f0efeb' },
  purple: { bg: '#EEEDFE', accent: '#534AB7' },
  teal: { bg: '#E1F5EE', accent: '#0F6E56' },
  coral: { bg: '#FAECE7', accent: '#993C1D' },
}
const presetBg = (theme: string) => PRESETS[theme]?.bg || '#111110'
const presetAccent = (theme: string) => PRESETS[theme]?.accent || '#f0efeb'

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<SortOption>('newest')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [dark, setDark] = useState(true)
  const [copiedHandle, setCopiedHandle] = useState<string | null>(null)
  const [showCopyModal, setShowCopyModal] = useState<any | null>(null)
  const [yourHandle, setYourHandle] = useState('')
  const [yourPassword, setYourPassword] = useState('')
  const [applyLoading, setApplyLoading] = useState(false)
  const router = useRouter()

  const fetchProfiles = () => {
    setLoading(true)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase
      .from('profiles')
      .select('handle, bio, avatar_initials, avatar_color, avatar_url, links, layout, theme, custom_bg, custom_accent, created_at, updated_at, view_count')
      .order('updated_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data) {
          setProfiles(data.filter((p: any) => p.links?.length > 0 || p.bio))
        }
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchProfiles()
    // Re-fetch when user comes back to this tab
    const onFocus = () => fetchProfiles()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const sorted = useMemo(() => {
    let list = [...profiles]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.handle?.toLowerCase().includes(q) ||
        p.bio?.toLowerCase().includes(q) ||
        p.links?.some((l: any) => l.label?.toLowerCase().includes(q))
      )
    }
    if (sort === 'newest') list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (sort === 'updated') list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    if (sort === 'views') list.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    return list
  }, [profiles, sort, search])

  const applyTheme = async () => {
    if (!yourHandle.trim() || !yourPassword.trim() || !showCopyModal) return
    setApplyLoading(true)
    const handle = yourHandle.trim().toLowerCase()
    const res = await fetch('/api/auth/apply-theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle,
        password: yourPassword,
        theme: showCopyModal.theme,
        custom_bg: showCopyModal.custom_bg || presetBg(showCopyModal.theme),
        custom_accent: showCopyModal.custom_accent || presetAccent(showCopyModal.theme),
      }),
    })
    const data = await res.json()
    setApplyLoading(false)
    if (!res.ok) {
      const msg = data.locked
        ? `${data.error}

Go to linkdrop.ayteelabs.com/login to reset your password.`
        : data.error
      alert(msg)
      return
    }
    setShowCopyModal(null)
    setYourHandle(''); setYourPassword('')
    // Check if already logged in as this handle
    const cookieHandle = document.cookie.split(';').find(c => c.trim().startsWith('ld_handle='))?.split('=')[1]
    if (cookieHandle === handle) {
      window.location.href = `/builder?handle=${handle}`
    } else {
      // Log them in first then redirect to builder
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, password: yourPassword }),
      })
      if (loginRes.ok) {
        window.location.href = `/builder?handle=${handle}`
      } else {
        window.location.href = `/${handle}`
      }
    }
  }

  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'NEWEST' },
    { value: 'updated', label: 'RECENTLY UPDATED' },
    { value: 'views', label: 'MOST VIEWED' },
  ]

  const bg = dark ? '#0c0c0c' : '#f5f4f0'
  const border = dark ? '#1e1e1e' : '#e0e0e0'
  const textPrimary = dark ? '#f0f0f0' : '#111111'
  const textMuted = dark ? '#444' : '#aaaaaa'
  const textDim = dark ? '#333' : '#cccccc'
  const controlBg = dark ? '#1a1a1a' : '#ffffff'
  const controlBorder = dark ? '#2a2a2a' : '#d0d0d0'
  const gridLine = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'

  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      backgroundImage: `linear-gradient(${gridLine} 1px, transparent 1px), linear-gradient(90deg, ${gridLine} 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      fontFamily: "'DM Mono', monospace",
      transition: 'background 0.2s',
    }}>

      {/* Copy theme modal */}
      {showCopyModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: dark ? '#111' : '#fff', border: `1px solid ${border}`, borderRadius: 4, padding: 24, width: 320, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 11, color: textPrimary, letterSpacing: '0.08em' }}>COPY THEME FROM @{showCopyModal.handle.toUpperCase()}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: showCopyModal.custom_bg || '#111', border: `1px solid ${border}` }} />
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: showCopyModal.custom_accent || '#f0f0f0', border: `1px solid ${border}` }} />
              <span style={{ fontSize: 9, color: textMuted, letterSpacing: '0.06em' }}>BG · ACCENT</span>
            </div>
            <div style={{ fontSize: 9, color: textMuted, lineHeight: 1.6, letterSpacing: '0.04em' }}>
              Enter your handle and password to apply this theme. Your links and content won't change.
            </div>
            <input
              type="text"
              placeholder="your handle (e.g. adil)"
              value={yourHandle}
              onChange={e => setYourHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              autoFocus
              style={{ padding: '8px 10px', background: dark ? '#1a1a1a' : '#f5f5f5', border: `1px solid ${controlBorder}`, borderRadius: 3, fontSize: 11, color: textPrimary, fontFamily: "'DM Mono', monospace", outline: 'none' }}
            />
            <input
              type="password"
              placeholder="your password"
              value={yourPassword}
              onChange={e => setYourPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyTheme()}
              style={{ padding: '8px 10px', background: dark ? '#1a1a1a' : '#f5f5f5', border: `1px solid ${controlBorder}`, borderRadius: 3, fontSize: 11, color: textPrimary, fontFamily: "'DM Mono', monospace", outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={applyTheme} disabled={applyLoading || !yourHandle || !yourPassword} style={{ flex: 1, padding: '8px', background: textPrimary, color: bg, border: 'none', borderRadius: 3, fontSize: 9, fontWeight: 600, cursor: applyLoading ? 'not-allowed' : 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', opacity: (!yourHandle || !yourPassword) ? 0.5 : 1 }}>
                {applyLoading ? 'VERIFYING...' : 'APPLY THEME →'}
              </button>
              <button onClick={() => { setShowCopyModal(null); setYourHandle(''); setYourPassword('') }} style={{ flex: 1, padding: '8px', background: 'transparent', color: textMuted, border: `1px solid ${controlBorder}`, borderRadius: 3, fontSize: 9, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${border}`, padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: bg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/claim" style={{ fontSize: 9, color: textMuted, textDecoration: 'none', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <img src="/logo.png" alt="" style={{ width: 14, height: 14, filter: dark ? 'none' : 'invert(1)', opacity: 0.7 }} />
            ← LINKDROP
          </Link>
          <span style={{ color: border }}>/</span>
          <span style={{ fontSize: 9, color: textPrimary, letterSpacing: '0.12em' }}>EXPLORE</span>
          {!loading && (
            <span style={{ fontSize: 9, color: textMuted, background: controlBg, border: `1px solid ${border}`, borderRadius: 2, padding: '2px 6px' }}>
              {sorted.length} profiles
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => setDark(d => !d)} style={{ padding: '6px 10px', background: 'transparent', border: `1px solid ${controlBorder}`, borderRadius: 3, fontSize: 12, cursor: 'pointer', color: textMuted }}>
            {dark ? '☀️' : '🌙'}
          </button>
          <Link href="/claim" style={{ padding: '6px 14px', background: 'transparent', color: textPrimary, border: `1px solid ${controlBorder}`, borderRadius: 3, fontSize: 9, fontWeight: 500, textDecoration: 'none', letterSpacing: '0.08em' }}>
            CLAIM YOURS →
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 32px' }}>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' as const }}>
          <div style={{ display: 'flex', gap: 1, background: controlBg, border: `1px solid ${border}`, borderRadius: 3, overflow: 'hidden' }}>
            {SORT_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setSort(opt.value)} style={{
                padding: '6px 12px', background: sort === opt.value ? (dark ? '#1e1e1e' : '#f0f0f0') : 'transparent',
                color: sort === opt.value ? textPrimary : textMuted,
                border: 'none', borderRight: `1px solid ${border}`,
                fontSize: 8, cursor: 'pointer', fontFamily: "'DM Mono', monospace",
                letterSpacing: '0.08em', transition: 'all 0.1s', whiteSpace: 'nowrap' as const,
              }}>
                {opt.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: 280, background: controlBg, border: `1px solid ${border}`, borderRadius: 3, overflow: 'hidden' }}>
            <span style={{ padding: '6px 10px', fontSize: 10, color: textMuted }}>⌕</span>
            <input
              type="text"
              placeholder="search handles, bios, links..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setSearch(searchInput); if (e.key === 'Escape') { setSearch(''); setSearchInput('') } }}
              style={{ flex: 1, padding: '6px 0', background: 'transparent', border: 'none', outline: 'none', fontSize: 9, color: textPrimary, fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em' }}
            />
            {searchInput && (
              <button onClick={() => setSearch(searchInput)} style={{ padding: '6px 10px', background: textPrimary, color: bg, border: 'none', fontSize: 8, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', fontWeight: 600 }}>GO</button>
            )}
          </div>

          {search && (
            <button onClick={() => { setSearch(''); setSearchInput('') }} style={{ padding: '6px 10px', background: 'transparent', color: textMuted, border: `1px solid ${border}`, borderRadius: 3, fontSize: 8, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em' }}>
              CLEAR ×
            </button>
          )}
        </div>

        {search && (
          <div style={{ fontSize: 9, color: textMuted, marginBottom: 16, letterSpacing: '0.08em' }}>
            SHOWING RESULTS FOR "{search.toUpperCase()}" — {sorted.length} found
          </div>
        )}

        {loading && <div style={{ textAlign: 'center', padding: '4rem', color: textMuted, fontSize: 9, letterSpacing: '0.1em' }}>LOADING...</div>}
        {!loading && sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: textMuted, fontSize: 9, letterSpacing: '0.1em' }}>
            {search ? `NO RESULTS FOR "${search.toUpperCase()}"` : 'NO PROFILES YET — BE THE FIRST'}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 24, justifyContent: 'center' }}>
          {sorted.map(profile => (
            <ScaledPreview key={profile.handle} profile={profile} footer={
              <div style={{ padding: '6px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 9, color: dark ? '#aaa' : '#555', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', flexShrink: 0 }}>@{profile.handle}</span>
                    {profile.view_count > 0 && (
                      <span style={{ fontSize: 8, color: dark ? '#444' : '#bbb', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' }}>{profile.view_count} views</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                    <button
                      onClick={() => { setShowCopyModal(profile); setYourHandle('') }}
                      style={{ padding: '3px 8px', background: 'transparent', color: dark ? '#aaa' : '#555', border: `1px solid ${dark ? '#333' : '#ccc'}`, borderRadius: 2, fontSize: 8, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s', whiteSpace: 'nowrap' as const }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#f0f0f0'; el.style.borderColor = '#f0f0f0' }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = dark ? '#aaa' : '#555'; el.style.borderColor = dark ? '#333' : '#ccc' }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: profile.custom_bg || '#111', border: `1px solid ${border}`, flexShrink: 0 }} />
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: profile.custom_accent || '#f0f0f0', border: `1px solid ${border}`, flexShrink: 0 }} />
                      USE THEME
                    </button>
                    <Link href={`/${profile.handle}`} style={{ fontSize: 8, color: dark ? '#aaa' : '#555', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em', textDecoration: 'none', transition: 'color 0.15s', padding: '3px 6px', border: `1px solid ${dark ? '#333' : '#ccc'}`, borderRadius: 2, whiteSpace: 'nowrap' as const }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f0f0f0'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = dark ? '#aaa' : '#555'}
                    >VIEW →</Link>
                  </div>
                </div>
              } />
          ))}
        </div>
      </div>
    </div>
  )
}
