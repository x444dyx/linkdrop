'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function CropModal({ src, onDone, onCancel }: {
  src: string
  onDone: (blob: Blob, previewUrl: string) => void
  onCancel: () => void
}) {
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [posStart, setPosStart] = useState({ x: 0, y: 0 })
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })
  const imgRef = useRef<HTMLImageElement>(null)
  const CROP_SIZE = 260

  const onImgLoad = () => {
    const img = imgRef.current
    if (!img) return
    const nw = img.naturalWidth
    const nh = img.naturalHeight
    setNaturalSize({ w: nw, h: nh })
    // fit image into crop area by default
    const fitScale = Math.max(CROP_SIZE / nw, CROP_SIZE / nh)
    setScale(fitScale)
  }

  const dispW = naturalSize.w * scale
  const dispH = naturalSize.h * scale
  const imgLeft = CROP_SIZE / 2 + pos.x - dispW / 2
  const imgTop  = CROP_SIZE / 2 + pos.y - dispH / 2

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setPosStart({ ...pos })
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    setPos({
      x: posStart.x + (e.clientX - dragStart.x),
      y: posStart.y + (e.clientY - dragStart.y),
    })
  }
  const onTouchStart = (e: React.TouchEvent) => {
    setDragging(true)
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    setPosStart({ ...pos })
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return
    setPos({
      x: posStart.x + (e.touches[0].clientX - dragStart.x),
      y: posStart.y + (e.touches[0].clientY - dragStart.y),
    })
  }

  const crop = () => {
    const img = imgRef.current
    if (!img || naturalSize.w === 0) return

    const OUT = 400
    const canvas = document.createElement('canvas')
    canvas.width = OUT
    canvas.height = OUT
    const ctx = canvas.getContext('2d')!

    // clip to circle
    ctx.beginPath()
    ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2)
    ctx.clip()

    // scale from CROP_SIZE display space to OUT canvas space
    const ratio = OUT / CROP_SIZE
    ctx.drawImage(img, imgLeft * ratio, imgTop * ratio, dispW * ratio, dispH * ratio)

    canvas.toBlob(blob => {
      if (!blob) return
      const reader = new FileReader()
      reader.onload = e => onDone(blob, e.target?.result as string)
      reader.readAsDataURL(blob)
    }, 'image/jpeg', 0.92)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 16, padding: 24,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        width: 360, maxWidth: '100%',
      }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Crop your photo</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Drag to reposition · use slider to zoom</div>

        <div
          style={{
            width: CROP_SIZE, height: CROP_SIZE,
            position: 'relative', overflow: 'hidden',
            cursor: dragging ? 'grabbing' : 'grab',
            background: '#222', borderRadius: '50%',
            flexShrink: 0,
            border: '3px solid #fff',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={() => setDragging(false)}
        >
          <img
            ref={imgRef}
            src={src}
            alt=""
            draggable={false}
            onLoad={onImgLoad}
            style={{
              position: 'absolute',
              width: dispW > 0 ? `${dispW}px` : 'auto',
              height: 'auto',
              left: `${imgLeft}px`,
              top: `${imgTop}px`,
              userSelect: 'none',
              pointerEvents: 'none',
              maxWidth: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Zoom</span>
          <input
            type="range" min="0.1" max="5" step="0.01"
            value={scale}
            onChange={e => setScale(parseFloat(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 36 }}>
            {Math.round(scale * 100)}%
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            cancel
          </button>
          <button onClick={crop} disabled={naturalSize.w === 0} style={{ flex: 1, padding: '10px', background: 'var(--accent)', color: 'var(--bg-card)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: naturalSize.w === 0 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)', opacity: naturalSize.w === 0 ? 0.5 : 1 }}>
            save
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AvatarUpload({ handle, currentUrl, initials, color, onUploaded }: {
  handle: string
  currentUrl?: string
  initials: string
  color: string
  onUploaded: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl || '')
  const [cropSrc, setCropSrc] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (currentUrl && currentUrl !== preview) setPreview(currentUrl)
  }, [currentUrl])

  const onFileSelected = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { alert('Image must be under 10MB'); return }
    const reader = new FileReader()
    reader.onload = e => setCropSrc(e.target?.result as string)
    reader.readAsDataURL(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  const uploadBlob = async (blob: Blob, previewDataUrl: string) => {
    setCropSrc('')
    setPreview(previewDataUrl)
    onUploaded(previewDataUrl)
    setUploading(true)

    const path = `${handle}/avatar.jpg`
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })

    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const finalUrl = data.publicUrl + '?t=' + Date.now()
    setPreview(finalUrl)
    onUploaded(finalUrl)
    setUploading(false)
  }

  return (
    <>
      {cropSrc && <CropModal src={cropSrc} onDone={uploadBlob} onCancel={() => setCropSrc('')} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: color,
            color: '#fff', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 14, fontWeight: 500,
            cursor: uploading ? 'not-allowed' : 'pointer',
            border: '2px dashed var(--border-strong)',
            flexShrink: 0, overflow: 'hidden', position: 'relative',
          }}
        >
          {preview
            ? <img src={preview} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials
          }
          {uploading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', zIndex: 1 }}>
              ...
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={() => inputRef.current?.click()} disabled={uploading}
            style={{ padding: '6px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)' }}>
            {uploading ? 'uploading...' : preview ? 'change photo' : 'upload photo'}
          </button>
          {preview && (
            <button onClick={() => { setPreview(''); onUploaded('') }}
              style={{ padding: '4px 12px', background: 'transparent', border: 'none', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left' }}>
              remove
            </button>
          )}
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>JPG, PNG or GIF · max 10MB</span>
        </div>

        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) onFileSelected(f) }} />
      </div>
    </>
  )
}
