'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { LinkItem, Layout, Theme } from '@/lib/supabase'
import ProfilePreview from '@/components/ProfilePreview'
import AvatarUpload from '@/components/AvatarUpload'
import LinkAvatarUpload from '@/components/LinkAvatarUpload'
import QRCode from '@/components/QRCode'
import { createClient } from '@supabase/supabase-js'

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

const SOCIAL_QUICK = [
  { label: 'X', color: '#000', prefix: 'https://x.com/' },
  { label: 'Instagram', color: '#E1306C', prefix: 'https://instagram.com/' },
  { label: 'GitHub', color: '#666', prefix: 'https://github.com/' },
  { label: 'LinkedIn', color: '#0077B5', prefix: 'https://linkedin.com/in/' },
  { label: 'TikTok', color: '#010101', prefix: 'https://tiktok.com/@' },
  { label: 'YouTube', color: '#FF0000', prefix: 'https://youtube.com/@' },
]

function isValidHex(h: string) { return /^#[0-9A-Fa-f]{6}$/.test(h) }

function Section({ label, children, dark }: { label: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div style={{ borderBottom: `1px solid ${dark ? '#1e1e1e' : '#e8e8e8'}`, padding: '16px 0' }}>
      <div style={{ fontSize: 9, fontWeight: 500, color: dark ? '#444' : '#aaa', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>{label}</div>
      {children}
    </div>
  )
}

function BuilderInner() {
  const params = useSearchParams()
  const handle = params.get('handle') || ''

  const [bio, setBio] = useState('')
  const [avatarColor, setAvatarColor] = useState('#111110')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [links, setLinks] = useState<LinkItem[]>([])
  const [layout, setLayout] = useState<Layout>('rows')
  const [theme, setTheme] = useState<Theme>('light')
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [addingLink, setAddingLink] = useState(false)
  const [builderDark, setBuilderDark] = useState(false)
  const [customBg, setCustomBg] = useState('')
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left')
  const [customAccent, setCustomAccent] = useState('')
  const [bgHexInput, setBgHexInput] = useState('')
  const [accentHexInput, setAccentHexInput] = useState('')
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({})
  const [viewCount, setViewCount] = useState(0)
  const [qrUrl, setQrUrl] = useState('')
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'theme' | 'settings'>('profile')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [showDeletePassword, setShowDeletePassword] = useState(false)

  const avatarInitials = handle.slice(0, 2).toUpperCase()

  useEffect(() => {
    const storedSession = localStorage.getItem('ld_session')
    const storedHandle = localStorage.getItem('ld_handle')
    if (!storedSession) {
      window.location.href = `/login${handle ? `?handle=${handle}` : ''}`
      return
    }
    if (handle && storedHandle && storedHandle !== handle) {
      window.location.href = `/login?handle=${handle}&mismatch=1`
      return
    }
  }, [handle])

  useEffect(() => {
    const saved = localStorage.getItem('linkdrop-builder-dark')
    if (saved === 'true') setBuilderDark(true)
  }, [])

  useEffect(() => {
    if (!handle) return
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    supabase.from('profiles').select('*').eq('handle', handle).single().then(({ data }) => {
      if (!data) return
      if (data.bio) setBio(data.bio)
      if (data.avatar_color) setAvatarColor(data.avatar_color)
      if (data.avatar_url) setAvatarUrl(data.avatar_url)
      if (data.links?.length) setLinks(data.links)
      if (data.layout) setLayout(data.layout)
      if (data.theme) setTheme(data.theme)
      if (data.view_count) setViewCount(data.view_count)
      if (data.qr_url) setQrUrl(data.qr_url)
      if (data.text_align) setTextAlign(data.text_align)
      const presetMap: Record<string, { bg: string; accent: string }> = {
        light: { bg: '#f5f4f0', accent: '#111110' },
        dark: { bg: '#111110', accent: '#f0efeb' },
        purple: { bg: '#EEEDFE', accent: '#534AB7' },
        teal: { bg: '#E1F5EE', accent: '#0F6E56' },
        coral: { bg: '#FAECE7', accent: '#993C1D' },
      }
      if (data.custom_bg) { setCustomBg(data.custom_bg); setBgHexInput(data.custom_bg) }
      else if (data.theme && presetMap[data.theme]) { setCustomBg(presetMap[data.theme].bg); setBgHexInput(presetMap[data.theme].bg) }
      if (data.custom_accent) { setCustomAccent(data.custom_accent); setAccentHexInput(data.custom_accent) }
      else if (data.theme && presetMap[data.theme]) { setCustomAccent(presetMap[data.theme].accent); setAccentHexInput(presetMap[data.theme].accent) }
    })
  }, [handle])

  const refreshClicks = () => {
    if (!handle) return
    fetch(`/api/click?handle=${handle}`).then(r => r.json()).then(d => { if (d.counts) setClickCounts(d.counts) })
  }
  useEffect(() => { refreshClicks() }, [handle])

  const profile = {
    handle, bio,
    avatar_initials: avatarInitials,
    avatar_color: avatarColor,
    avatar_url: avatarUrl || undefined,
    links: links.map(l => ({ ...l })),
    layout, theme,
    custom_bg: customBg || undefined,
    custom_accent: customAccent || undefined,
    text_align: textAlign,
  } as any

  const addLink = () => {
    if (!newLabel.trim() || !newUrl.trim()) return
    const initials = newLabel.trim().slice(0, 2).toUpperCase()
    const colors = ['#111110','#534AB7','#0F6E56','#993C1D','#D4537E','#185FA5','#FF5733','#0077B5']
    const color = colors[links.length % colors.length]
    setLinks(prev => [...prev, { id: Date.now().toString(), label: newLabel.trim(), url: newUrl.trim(), color, initials }])
    setNewLabel(''); setNewUrl(''); setAddingLink(false)
  }

  const removeLink = (id: string) => setLinks(prev => prev.filter(l => l.id !== id))
  const updateLinkAvatar = (id: string, url: string) => setLinks(prev => prev.map(l => l.id === id ? { ...l, avatar_url: url || undefined } : l))
  const updateLinkSize = (id: string, size: 'small' | 'medium' | 'large') => setLinks(prev => prev.map(l => l.id === id ? { ...l, size } : l))
  const togglePin = (id: string) => {
    const currentPinned = links.find(l => l.pinned)
    const target = links.find(l => l.id === id)
    if (!target) return

    // Unpinning
    if (target.pinned) {
      setLinks(prev => prev.map(l => l.id === id ? { ...l, pinned: false } : l))
      return
    }

    // Already have a pinned link — warn before replacing
    if (currentPinned && currentPinned.id !== id) {
      const confirmed = window.confirm(
        `"${currentPinned.label}" is currently pinned.\n\nPinning "${target.label}" will unpin it and move it to where "${target.label}" currently sits.\n\nContinue?`
      )
      if (!confirmed) return
      setLinks(prev => {
        const arr = [...prev]
        const oldPinIdx = arr.findIndex(l => l.id === currentPinned.id) // position 0 (top)
        const newPinIdx = arr.findIndex(l => l.id === id) // e.g. position 6
        // Place unpinned old link at the new pin's position, pin new link at top
        const updatedOld = { ...arr[oldPinIdx], pinned: false }
        const updatedNew = { ...arr[newPinIdx], pinned: true }
        // Remove both from array
        const rest = arr.filter(l => l.id !== currentPinned.id && l.id !== id)
        // Re-insert old unpinned where new was (accounting for removal of old from top)
        const insertAt = newPinIdx - 1 // -1 because old pin was removed from index 0
        rest.splice(insertAt, 0, updatedOld)
        // New pin goes to top
        return [updatedNew, ...rest]
      })
      return
    }

    // No existing pin — just pin it
    setLinks(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, pinned: true } : l)
      return [...updated.filter(l => l.pinned), ...updated.filter(l => !l.pinned)]
    })
  }
  const startEdit = (link: any) => { setEditingLinkId(link.id); setEditLabel(link.label); setEditUrl(link.url) }
  const saveEdit = (id: string) => {
    if (!editLabel.trim()) return
    setLinks(prev => prev.map(l => l.id === id ? { ...l, label: editLabel.trim(), url: editUrl.trim(), initials: editLabel.trim().slice(0, 2).toUpperCase() } : l))
    setEditingLinkId(null)
  }
  const onDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData('linkId', id) }
  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (links.find(l => l.id === id)?.pinned) return
    setDragOverId(id)
  }
  const onDrop = (e: React.DragEvent, targetId: string) => {
    const draggedId = e.dataTransfer.getData('linkId')
    if (draggedId === targetId) return
    setLinks(prev => {
      if (prev.find(l => l.id === targetId)?.pinned) return prev
      const arr = [...prev]
      const fromIdx = arr.findIndex(l => l.id === draggedId)
      const toIdx = arr.findIndex(l => l.id === targetId)
      const pinnedCount = arr.filter(l => l.pinned).length
      if (toIdx < pinnedCount && !arr[fromIdx].pinned) return prev
      const [item] = arr.splice(fromIdx, 1)
      arr.splice(toIdx, 0, item)
      return arr
    })
    setDragOverId(null)
  }

  const publish = async () => {
    setPublishing(true)
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, avatar_url: avatarUrl || null, custom_bg: customBg || null, custom_accent: customAccent || null, qr_url: qrUrl || null }),
      })
      if (res.ok) { setPublished(true); setTimeout(() => setPublished(false), 3000) }
    } catch {}
    setPublishing(false)
  }

  const copyUrl = () => navigator.clipboard.writeText(`${window.location.origin}/${handle}`)
  const toggleBuilderDark = () => setBuilderDark(prev => { const next = !prev; localStorage.setItem('linkdrop-builder-dark', String(next)); return next })
  const deleteAccount = async () => {
    if (!deletePassword) { setDeleteError('Enter your password'); return }
    setDeleteLoading(true); setDeleteError('')
    const res = await fetch('/api/auth/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle, password: deletePassword }),
    })
    const data = await res.json()
    if (!res.ok) { setDeleteError(data.error); setDeleteLoading(false); return }
    // Clear cookies and redirect
    localStorage.removeItem('ld_session')
    localStorage.removeItem('ld_handle')
    window.location.href = '/'
  }

  const signOut = () => {
    localStorage.removeItem('ld_session')
    localStorage.removeItem('ld_handle')
    window.location.href = '/login'
  }
  const handleBgHexInput = (val: string) => { setBgHexInput(val); const hex = val.startsWith('#') ? val : '#' + val; if (isValidHex(hex)) { setCustomBg(hex); setTheme('light') } }
  const handleAccentHexInput = (val: string) => { setAccentHexInput(val); const hex = val.startsWith('#') ? val : '#' + val; if (isValidHex(hex)) setCustomAccent(hex) }

  const D = builderDark
  const uiBg = D ? '#0c0c0c' : '#f5f4f0'
  const uiPanel = D ? '#111' : '#ffffff'
  const uiBorder = D ? '#1e1e1e' : '#e0e0e0'
  const uiBorderStrong = D ? '#2a2a2a' : '#cccccc'
  const uiText = D ? '#f0f0f0' : '#111111'
  const uiMuted = D ? '#888' : '#777'
  const uiDim = D ? '#666' : '#aaaaaa'
  const uiSurface = D ? '#1a1a1a' : '#f0f0f0'
  const uiInputBg = D ? '#1a1a1a' : '#ffffff'
  const uiTabActive = D ? '#1e1e1e' : '#e8e8e8'

  const inp: React.CSSProperties = { width: '100%', padding: '8px 10px', background: uiInputBg, border: `1px solid ${uiBorderStrong}`, borderRadius: 3, fontSize: 12, color: uiText, fontFamily: "'DM Sans', sans-serif", outline: 'none' }
  const hexInp: React.CSSProperties = { width: 72, padding: '4px 8px', background: uiInputBg, border: `1px solid ${uiBorderStrong}`, borderRadius: 3, fontSize: 11, color: uiText, fontFamily: "'DM Mono', monospace", outline: 'none' }

  return (
    <div style={{ minHeight: '100vh', background: uiBg, display: 'flex', flexDirection: 'column', fontFamily: "'DM Mono', monospace", transition: 'background 0.2s' }}>

      {/* Header */}
      <header style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${uiBorder}`, background: uiBg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/logo.png" alt="Linkdrop" style={{ width: 18, height: 18, filter: D ? 'none' : 'invert(1)', opacity: 0.9 }} />
            <span style={{ fontSize: 10, color: uiMuted, letterSpacing: '0.1em' }}>LINKDROP</span>
          </div>
          <span style={{ color: uiBorderStrong }}>/</span>
          <span style={{ fontSize: 11, color: uiText }}>@{handle}</span>
          <span style={{ fontSize: 8, color: uiDim, fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>v1.4.0</span>
          {viewCount > 0 && (
            <span style={{ fontSize: 9, color: uiMuted, background: uiSurface, border: `1px solid ${uiBorder}`, borderRadius: 3, padding: '2px 7px' }}>
              {viewCount.toLocaleString()} views
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={toggleBuilderDark} style={{ padding: '6px 10px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 3, fontSize: 12, cursor: 'pointer', color: '#888' }}>
            {builderDark ? '☀️' : '🌙'}
          </button>
          <button onClick={signOut} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 3, fontSize: 9, color: '#aaa', cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
            SIGN OUT
          </button>
          <button onClick={copyUrl} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 3, fontSize: 10, color: '#888', cursor: 'pointer', letterSpacing: '0.08em' }}>
            COPY LINK
          </button>
          <button onClick={publish} disabled={publishing} style={{ padding: '6px 16px', background: published ? '#0F6E56' : '#f0f0f0', color: published ? '#fff' : '#111', border: 'none', borderRadius: 3, fontSize: 10, fontWeight: 600, cursor: publishing ? 'not-allowed' : 'pointer', letterSpacing: '0.08em', opacity: publishing ? 0.7 : 1, transition: 'all 0.2s' }}>
            {publishing ? 'SAVING...' : published ? 'SAVED ✓' : 'PUBLISH'}
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', gap: 0 }}>

        {/* Left panel — tabs */}
        <div style={{ width: 320, borderRight: `1px solid ${uiBorder}`, display: 'flex', flexDirection: 'column', flexShrink: 0, background: uiPanel }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${uiBorder}` }}>
            {(['profile', 'links', 'theme', 'settings'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '8px 4px', background: activeTab === tab ? uiTabActive : 'transparent',
                border: 'none', borderBottom: activeTab === tab ? `1px solid ${uiText}` : `1px solid transparent`,
                color: activeTab === tab ? uiText : '#888', fontSize: 10, cursor: 'pointer',
                fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.15s',
              }}>{tab}</button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <>
                <Section dark={D} label="Bio">
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} placeholder="a short bio..." style={{ ...inp, resize: 'vertical', lineHeight: 1.5, minHeight: 60, maxHeight: 200 }} />
                </Section>

                <Section dark={D} label="Photo">
                  <AvatarUpload handle={handle} currentUrl={avatarUrl} initials={avatarInitials} color={avatarColor} onUploaded={url => setAvatarUrl(url)} />
                </Section>

                {!avatarUrl && (
                  <Section dark={D} label="Avatar colour">
                    <div style={{ display: 'flex', gap: 6 }}>
                      {AVATAR_COLORS.map(c => (
                        <div key={c} onClick={() => setAvatarColor(c)} style={{ width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer', border: avatarColor === c ? '2px solid #f0f0f0' : '2px solid transparent', outline: avatarColor === c ? '1px solid #0c0c0c' : 'none', outlineOffset: -3 }} />
                      ))}
                    </div>
                  </Section>
                )}

              </>
            )}

            {/* LINKS TAB */}
            {activeTab === 'links' && (
              <>
                <Section dark={D} label="Social quick-add">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {SOCIAL_QUICK.map(s => (
                      <button key={s.label} onClick={() => {
                        const username = prompt(`${s.label} username:`)
                        if (!username) return
                        const colors = ['#111110','#534AB7','#0F6E56','#993C1D','#D4537E','#185FA5','#FF5733','#0077B5']
                        setLinks(prev => [...prev, { id: Date.now().toString(), label: s.label, url: s.prefix + username.replace('@',''), color: s.color, initials: s.label.slice(0,2).toUpperCase() }])
                      }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', background: uiSurface, border: `1px solid ${uiBorderStrong}`, borderRadius: 3, fontSize: 9, color: uiMuted, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                        {s.label.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </Section>

                <Section dark={D} label={`Links · ${links.length}`}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                    {links.map(link => (
                      <div key={link.id} draggable onDragStart={e => onDragStart(e, link.id)} onDragOver={e => onDragOver(e, link.id)} onDrop={e => onDrop(e, link.id)} onDragLeave={() => setDragOverId(null)}
                        style={{ background: dragOverId === link.id ? uiTabActive : uiSurface, border: `1px solid ${dragOverId === link.id ? uiBorderStrong : uiBorder}`, borderRadius: 3, overflow: 'hidden', transition: 'all 0.1s' }}>

                        {/* Link header row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px' }}>
                          <span style={{ fontSize: 10, color: '#666', cursor: 'grab' }}>⠿</span>
                          {link.pinned && <span style={{ fontSize: 8, color: '#f0f0f0', background: '#333', border: '1px solid #444', borderRadius: 2, padding: '1px 5px', letterSpacing: '0.04em' }}>PINNED</span>}
                          <span style={{ flex: 1, fontSize: 11, color: uiText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.label}</span>
                          {clickCounts[link.id] > 0 && <span style={{ fontSize: 8, color: uiMuted, background: uiSurface, border: `1px solid ${uiBorder}`, borderRadius: 2, padding: '1px 5px', flexShrink: 0 }}>{clickCounts[link.id]} clicks</span>}
                          <button onClick={() => startEdit(link)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: uiMuted, fontSize: 10, padding: '0 2px' }}>✎</button>
                          <button onClick={() => togglePin(link.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: link.pinned ? uiText : uiMuted, fontSize: 10, padding: '0 2px' }}>📌</button>
                          <button onClick={() => removeLink(link.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: uiMuted, fontSize: 13, padding: '0 2px', lineHeight: 1 }}>×</button>
                        </div>

                        {/* Edit fields */}
                        {editingLinkId === link.id && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 10px 8px' }}>
                            <input value={editLabel} onChange={e => setEditLabel(e.target.value)} placeholder="Label" style={inp} />
                            <input value={editUrl} onChange={e => setEditUrl(e.target.value)} placeholder="URL" onKeyDown={e => e.key === 'Enter' && saveEdit(link.id)} style={inp} />
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button onClick={() => saveEdit(link.id)} style={{ flex: 1, padding: '5px', background: '#f0f0f0', color: '#111', border: 'none', borderRadius: 3, fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em' }}>SAVE</button>
                              <button onClick={() => setEditingLinkId(null)} style={{ flex: 1, padding: '5px', background: 'transparent', color: '#aaa', border: '1px solid #2a2a2a', borderRadius: 3, fontSize: 9, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em' }}>CANCEL</button>
                            </div>
                          </div>
                        )}

                        {/* Size + avatar */}
                        <div style={{ padding: '0 10px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', gap: 3 }}>
                            {(['small','medium','large'] as const).map(sz => (
                              <button key={sz} onClick={() => updateLinkSize(link.id, sz)} style={{ flex: 1, padding: '3px', background: (link.size || 'small') === sz ? '#f0f0f0' : 'transparent', color: (link.size || 'small') === sz ? '#111' : '#444', border: '1px solid ' + ((link.size || 'small') === sz ? '#f0f0f0' : '#2a2a2a'), borderRadius: 2, fontSize: 8, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                {sz}
                              </button>
                            ))}
                          </div>
                          <LinkAvatarUpload handle={handle} linkId={link.id} currentUrl={link.avatar_url} initials={link.initials} color={link.color} onUploaded={url => updateLinkAvatar(link.id, url)} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {addingLink ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <input placeholder="Label" value={newLabel} onChange={e => setNewLabel(e.target.value)} style={inp} />
                      <input placeholder="URL (https://...)" value={newUrl} onChange={e => setNewUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLink()} style={inp} />
                      <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                        <button onClick={addLink} style={{ flex: 1, padding: '7px', background: '#f0f0f0', color: '#111', border: 'none', borderRadius: 3, fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em' }}>ADD</button>
                        <button onClick={() => setAddingLink(false)} style={{ flex: 1, padding: '7px', background: 'transparent', color: '#aaa', border: '1px solid #2a2a2a', borderRadius: 3, fontSize: 9, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em' }}>CANCEL</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddingLink(true)} style={{ width: '100%', padding: '8px', background: 'transparent', border: `1px dashed ${uiBorderStrong}`, borderRadius: 3, fontSize: 9, color: uiMuted, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
                      + ADD CUSTOM LINK
                    </button>
                  )}

                  <div style={{ marginTop: 8, textAlign: 'right' }}>
                    <button onClick={refreshClicks} style={{ fontSize: 9, color: D ? '#aaa' : '#666', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em' }}>↻ REFRESH CLICKS</button>
                  </div>
                </Section>
              </>
            )}

            {/* THEME TAB */}
            {activeTab === 'theme' && (
              <>
                <Section dark={D} label="Layout">
                  <p style={{ fontSize: 10, color: D ? '#aaa' : '#666', marginBottom: 10, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>Choose how your links are displayed. Rows stacks links vertically. Bubbles wraps them as pills. Grid shows a two-column card view. Icons displays circular avatars.</p>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {LAYOUT_OPTIONS.map(l => (
                      <button key={l.value} onClick={() => setLayout(l.value)} style={{ flex: 1, padding: '6px 4px', background: layout === l.value ? '#f0f0f0' : 'transparent', color: layout === l.value ? '#111' : '#555', border: '1px solid ' + (layout === l.value ? '#f0f0f0' : '#2a2a2a'), borderRadius: 3, fontSize: 9, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s' }}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </Section>

                <Section dark={D} label="Text alignment">
                  <p style={{ fontSize: 10, color: uiMuted, marginBottom: 10, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>Controls alignment of your profile info and links. Centre moves the avatar above the bio and centres all content.</p>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {([
                      { value: 'left', icon: '▤', label: 'LEFT' },
                      { value: 'center', icon: '▥', label: 'CENTRE' },
                      { value: 'right', icon: '▦', label: 'RIGHT' },
                    ] as const).map(a => (
                      <button key={a.value} onClick={() => setTextAlign(a.value)} style={{ flex: 1, padding: '6px 4px', background: textAlign === a.value ? '#f0f0f0' : 'transparent', color: textAlign === a.value ? '#111' : '#555', border: '1px solid ' + (textAlign === a.value ? '#f0f0f0' : '#2a2a2a'), borderRadius: 3, fontSize: 9, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', transition: 'all 0.15s' }}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </Section>

                <Section dark={D} label="Presets">
                  <div style={{ display: 'flex', gap: 8 }}>
                    {THEME_OPTIONS.map(t => (
                      <div key={t.value} title={t.label} onClick={() => {
                        setTheme(t.value)
                        const pm: Record<string, { bg: string; accent: string }> = { light: { bg: '#f5f4f0', accent: '#111110' }, dark: { bg: '#111110', accent: '#f0efeb' }, purple: { bg: '#EEEDFE', accent: '#534AB7' }, teal: { bg: '#E1F5EE', accent: '#0F6E56' }, coral: { bg: '#FAECE7', accent: '#993C1D' } }
                        const p = pm[t.value]; setCustomBg(p.bg); setBgHexInput(p.bg); setCustomAccent(p.accent); setAccentHexInput(p.accent)
                      }} style={{ width: 24, height: 24, borderRadius: '50%', background: t.color, cursor: 'pointer', border: theme === t.value && !customBg ? '2px solid #f0f0f0' : '2px solid #2a2a2a', transition: 'all 0.15s' }} />
                    ))}
                  </div>
                </Section>

                <Section dark={D} label="Custom colours">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Background', val: customBg || '#f5f4f0', hexVal: bgHexInput || customBg || '#f5f4f0', onColor: (v: string) => { setCustomBg(v); setBgHexInput(v); setTheme('light') }, onHex: handleBgHexInput },
                      { label: 'Accent', val: customAccent || '#111110', hexVal: accentHexInput || customAccent || '#111110', onColor: (v: string) => { setCustomAccent(v); setAccentHexInput(v) }, onHex: handleAccentHexInput },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 10, color: '#666', letterSpacing: '0.06em' }}>{row.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input type="color" value={row.val} onChange={e => row.onColor(e.target.value)} style={{ width: 24, height: 24, padding: 1, border: '1px solid #2a2a2a', borderRadius: 3, cursor: 'pointer', background: 'transparent' }} />
                          <input type="text" value={row.hexVal} onChange={e => row.onHex(e.target.value)} maxLength={7} style={hexInp} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
                <Section dark={D} label="Explore">
                  <p style={{ fontSize: 10, color: D ? '#aaa' : '#666', marginBottom: 10, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>Browse other Linkdrop profiles for theme inspiration. You can copy any theme directly to your profile with one click — password verified.</p>
                  <a href="/explore" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'transparent', color: uiMuted, border: `1px solid ${uiBorderStrong}`, borderRadius: 3, fontSize: 9, textDecoration: 'none', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
                    VIEW EXPLORE PAGE →
                  </a>
                </Section>
              </>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <>
                <Section dark={D} label="Your link">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: uiSurface, border: `1px solid ${uiBorder}`, borderRadius: 3 }}>
                    <span style={{ fontSize: 10, color: D ? '#aaa' : '#666' }}>linkdrop.ayteelabs.com/<strong style={{ color: uiText }}>{handle}</strong></span>
                    <button onClick={copyUrl} style={{ fontSize: 9, color: uiMuted, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}>COPY</button>
                  </div>
                </Section>

                <Section dark={D} label="QR Code">
                  <QRCode handle={handle} savedQrUrl={qrUrl} onSaved={url => setQrUrl(url)} />
                </Section>

                <Section dark={D} label="Danger zone">
                  {!showDeleteModal ? (
                    <button onClick={() => { setShowDeleteModal(true); setDeleteError('') }} style={{ padding: '7px 14px', background: 'transparent', color: '#D85A30', border: '1px solid #D85A30', borderRadius: 3, fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
                      DELETE ACCOUNT
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px', background: D ? '#1a0a0a' : '#fff0ee', border: '1px solid #D85A30', borderRadius: 3 }}>
                      <div style={{ fontSize: 9, color: '#D85A30', letterSpacing: '0.06em', lineHeight: 1.6 }}>
                        THIS CANNOT BE UNDONE. @{handle} will be deleted and the handle freed.
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showDeletePassword ? 'text' : 'password'}
                          placeholder="enter your password to confirm"
                          value={deletePassword}
                          onChange={e => { setDeletePassword(e.target.value); setDeleteError('') }}
                          onKeyDown={e => e.key === 'Enter' && deleteAccount()}
                          autoFocus
                          style={{ width: '100%', padding: '8px 36px 8px 10px', background: D ? '#2a0a0a' : '#fff', border: '1px solid #D85A30', borderRadius: 3, fontSize: 11, color: D ? '#f0f0f0' : '#111', fontFamily: "'DM Mono', monospace", outline: 'none', boxSizing: 'border-box' as const }}
                        />
                        <button type="button" onClick={() => setShowDeletePassword(s => !s)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#D85A30', fontFamily: "'DM Mono', monospace", padding: 0 }}>
                          {showDeletePassword ? 'HIDE' : 'SHOW'}
                        </button>
                      </div>
                      {deleteError && <div style={{ fontSize: 9, color: '#D85A30', letterSpacing: '0.04em' }}>{deleteError}</div>}
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={deleteAccount} disabled={deleteLoading} style={{ flex: 1, padding: '7px', background: '#D85A30', color: '#fff', border: 'none', borderRadius: 3, fontSize: 9, fontWeight: 600, cursor: deleteLoading ? 'not-allowed' : 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', opacity: deleteLoading ? 0.7 : 1 }}>
                          {deleteLoading ? 'DELETING...' : 'CONFIRM DELETE'}
                        </button>
                        <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError('') }} style={{ flex: 1, padding: '7px', background: 'transparent', color: uiMuted, border: `1px solid ${uiBorderStrong}`, borderRadius: 3, fontSize: 9, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
                          CANCEL
                        </button>
                      </div>
                    </div>
                  )}
                </Section>
              </>
            )}
          </div>
        </div>

        {/* Right panel — preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: uiBg, backgroundImage: `linear-gradient(${D ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px), linear-gradient(90deg, ${D ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px)`, backgroundSize: '32px 32px', gap: 12 }}>
          <div style={{ fontSize: 9, color: uiDim, letterSpacing: '0.12em', textTransform: 'uppercase' }}>preview</div>
          <ProfilePreview profile={profile} customBg={customBg} customAccent={customAccent} />
        </div>
      </div>
    </div>
  )
}

export default function BuilderPage() {
  return <Suspense><BuilderInner /></Suspense>
}
