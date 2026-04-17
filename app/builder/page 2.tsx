'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { LinkItem, Layout, Theme, Profile } from '@/lib/supabase'
import ProfilePreview from '@/components/ProfilePreview'

const THEME_OPTIONS: { value: Theme; label: string; color: string }[] = [
  { value: 'light', label: 'Light', color: '#f5f4f0' },
  { value: 'dark', label: 'Dark', color: '#111110' },
  { value: 'purple', label: 'Purple', color: '#534AB7' },
  { value: 'teal', label: 'Teal', color: '#0F6E56' },
  { value: 'coral', label: 'Coral', color: '#993C1D' },
]

const LAYOUT_OPTIONS: { value: Layout; label: string }[] = [
  { value: 'rows', label: 'Rows' },
  { value: 'bubbles', label: 'Bubbles' },
  { value: 'grid', label: 'Grid' },
  { value: 'icons', label: 'Icons' },
]

const AVATAR_COLORS = ['#111110','#534AB7','#0F6E56','#993C1D','#D4537E','#185FA5']

function BuilderInner() {
  const params = useSearchParams()
  const router = useRouter()
  const handle = params.get('handle') || ''

  const [bio, setBio] = useState('hey, this is me on the internet')
  const [avatarColor, setAvatarColor] = useState('#111110')
  const [links, setLinks] = useState<LinkItem[]>([
    { id: '1', label: 'My Website', url: 'https://', color: '#111110', initials: 'WB' },
  ])
  const [layout, setLayout] = useState<Layout>('rows')
  const [theme, setTheme] = useState<Theme>('light')
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [addingLink, setAddingLink] = useState(false)

  const avatarInitials = handle.slice(0, 2).toUpperCase()

  const profile: Profile = {
    handle,
    bio,
    avatar_initials: avatarInitials,
    avatar_color: avatarColor,
    links,
    layout,
    theme,
  }

  const addLink = () => {
    if (!newLabel.trim() || !newUrl.trim()) return
    const initials = newLabel.slice(0, 2).toUpperCase()
    const colors = ['#111110','#534AB7','#0F6E56','#993C1D','#D4537E','#185FA5','#FF5733','#0077B5']
    const color = colors[links.length % colors.length]
    setLinks(prev => [...prev, { id: Date.now().toString(), label: newLabel.trim(), url: newUrl.trim(), color, initials }])
    setNewLabel('')
    setNewUrl('')
    setAddingLink(false)
  }

  const removeLink = (id: string) => setLinks(prev => prev.filter(l => l.id !== id))

  const publish = async () => {
    setPublishing(true)
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      if (res.ok) {
        setPublished(true)
        setTimeout(() => setPublished(false), 3000)
      }
    } catch {}
    setPublishing(false)
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${handle}`)
  }

  const s = {
    label: { fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 8 },
    card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 12 },
    input: { width: '100%', padding: '10px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', outline: 'none' },
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
          linkdrop / <span style={{ color: 'var(--text-primary)' }}>@{handle}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={copyUrl} style={{ padding: '8px 14px', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            copy link
          </button>
          <button onClick={publish} disabled={publishing} style={{ padding: '8px 16px', background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: publishing ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)', opacity: publishing ? 0.7 : 1 }}>
            {publishing ? 'publishing...' : published ? 'published ✓' : 'publish'}
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', gap: 0, maxWidth: 960, margin: '0 auto', width: '100%', padding: '2rem 1.5rem', gap: '2rem', flexWrap: 'wrap' as const }}>

        <div style={{ flex: 1, minWidth: 280, maxWidth: 360 }}>

          <div style={s.card}>
            <div style={s.label}>Profile</div>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={2}
              placeholder="a short bio..."
              style={{ ...s.input, resize: 'none', lineHeight: 1.5 }}
            />
            <div style={{ marginTop: 10 }}>
              <div style={{ ...s.label, marginBottom: 6 }}>Avatar colour</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {AVATAR_COLORS.map(c => (
                  <div key={c} onClick={() => setAvatarColor(c)} style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: avatarColor === c ? '2px solid var(--text-primary)' : '2px solid transparent', outline: avatarColor === c ? '1px solid var(--bg)' : 'none', outlineOffset: -3 }} />
                ))}
              </div>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.label}>Layout</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {LAYOUT_OPTIONS.map(l => (
                <button key={l.value} onClick={() => setLayout(l.value)} style={{ flex: 1, padding: '8px 4px', background: layout === l.value ? 'var(--accent)' : 'var(--bg-surface)', color: layout === l.value ? 'var(--bg)' : 'var(--text-secondary)', border: '1px solid ' + (layout === l.value ? 'var(--accent)' : 'var(--border)'), borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div style={s.card}>
            <div style={s.label}>Theme</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {THEME_OPTIONS.map(t => (
                <div key={t.value} title={t.label} onClick={() => setTheme(t.value)} style={{ width: 26, height: 26, borderRadius: '50%', background: t.color, cursor: 'pointer', border: theme === t.value ? '2px solid var(--text-primary)' : '2px solid var(--border)', outline: theme === t.value ? '2px solid var(--bg-card)' : 'none', outlineOffset: -4, transition: 'all 0.15s' }} />
              ))}
            </div>
          </div>

          <div style={s.card}>
            <div style={s.label}>Links</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: links.length ? 10 : 0 }}>
              {links.map(link => (
                <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--bg-surface)', borderRadius: 8