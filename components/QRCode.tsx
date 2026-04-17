'use client'
import { useState, useEffect, useRef } from 'react'

export default function QRCode({ handle, savedQrUrl, onSaved }: {
  handle: string
  savedQrUrl?: string
  onSaved: (url: string) => void
}) {
  const [qrDataUrl, setQrDataUrl] = useState(savedQrUrl || '')
  const [generating, setGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (savedQrUrl && savedQrUrl !== qrDataUrl) setQrDataUrl(savedQrUrl)
  }, [savedQrUrl])

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${handle}`
    : `https://linkdrop.ayteelabs.com/${handle}`

  const generateQR = async () => {
    setGenerating(true)
    try {
      const SIZE = 500
      const QR_SIZE = 340
      const PADDING = 24
      const FOOTER = 96

      // Fetch raw QR as image
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&data=${encodeURIComponent(profileUrl)}&bgcolor=111111&color=f0efeb&margin=0&qzone=1`
      const qrRes = await fetch(qrApiUrl)
      const qrBlob = await qrRes.blob()
      const qrObjectUrl = URL.createObjectURL(qrBlob)

      const qrImg = new Image()
      qrImg.onload = async () => {
        const canvas = document.createElement('canvas')
        canvas.width = SIZE
        canvas.height = SIZE + FOOTER
        const ctx = canvas.getContext('2d')!

        // Background
        ctx.fillStyle = '#111111'
        ctx.fillRect(0, 0, SIZE, SIZE + FOOTER)

        // Subtle grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.03)'
        ctx.lineWidth = 1
        for (let x = 0; x < SIZE; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, SIZE + FOOTER); ctx.stroke() }
        for (let y = 0; y < SIZE + FOOTER; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SIZE, y); ctx.stroke() }

        // Outer card border
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 1
        ctx.strokeRect(0.5, 0.5, SIZE - 1, SIZE + FOOTER - 1)

        // Top bar
        ctx.fillStyle = 'rgba(255,255,255,0.04)'
        ctx.fillRect(0, 0, SIZE, 36)
        ctx.strokeStyle = 'rgba(255,255,255,0.06)'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(0, 36); ctx.lineTo(SIZE, 36); ctx.stroke()

        // Top bar — LINKDROP label
        ctx.fillStyle = '#555555'
        ctx.font = '500 10px "DM Mono", monospace'
        ctx.letterSpacing = '4px'
        ctx.textAlign = 'left'
        ctx.fillText('LINKDROP', PADDING, 23)

        // Top bar — dots
        const dotX = SIZE - PADDING
        ;[0, 10, 20].forEach((offset, i) => {
          ctx.beginPath()
          ctx.arc(dotX - offset, 18, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = i === 0 ? '#f0efeb' : '#2a2a2a'
          ctx.fill()
        })

        // QR code image centred
        const qrX = (SIZE - QR_SIZE) / 2
        const qrY = 36 + (SIZE - 36 - QR_SIZE) / 2
        ctx.drawImage(qrImg, qrX, qrY, QR_SIZE, QR_SIZE)

        // Center logo dot overlay on QR
        const centerX = SIZE / 2
        const centerY = 36 + (SIZE - 36) / 2
        const dotR = 22
        ctx.fillStyle = '#111111'
        ctx.beginPath(); ctx.arc(centerX, centerY, dotR + 4, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#f0efeb'
        ctx.beginPath(); ctx.arc(centerX, centerY, dotR, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#111111'
        ctx.beginPath(); ctx.arc(centerX, centerY, dotR - 8, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#f0efeb'
        ctx.beginPath(); ctx.arc(centerX, centerY, 5, 0, Math.PI * 2); ctx.fill()

        // Footer divider
        ctx.strokeStyle = 'rgba(255,255,255,0.06)'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(0, SIZE); ctx.lineTo(SIZE, SIZE); ctx.stroke()

        // Footer — handle
        ctx.fillStyle = '#f0efeb'
        ctx.font = '500 16px "DM Sans", sans-serif'
        ctx.letterSpacing = '0px'
        ctx.textAlign = 'center'
        ctx.fillText(`@${handle}`, SIZE / 2, SIZE + 34)

        // Footer — URL
        ctx.fillStyle = '#555555'
        ctx.font = '400 10px "DM Mono", monospace'
        ctx.letterSpacing = '1px'
        ctx.fillText('linkdrop.ayteelabs.com', SIZE / 2, SIZE + 56)

        // Footer — three dots
        ;[-10, 0, 10].forEach((offset, i) => {
          ctx.beginPath()
          ctx.arc(SIZE / 2 + offset, SIZE + 76, 2, 0, Math.PI * 2)
          ctx.fillStyle = i === 1 ? '#f0efeb' : '#2a2a2a'
          ctx.fill()
        })

        const dataUrl = canvas.toDataURL('image/png')
        setQrDataUrl(dataUrl)
        onSaved(dataUrl)

        // Auto-save to Supabase
        await fetch('/api/save-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ handle, qr_url: dataUrl }),
        })

        URL.revokeObjectURL(qrObjectUrl)
        setGenerating(false)
      }
      qrImg.src = qrObjectUrl
    } catch (err) {
      console.error(err)
      setGenerating(false)
    }
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `linkdrop-${handle}.png`
    a.click()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {qrDataUrl ? (
        <>
          <img src={qrDataUrl} alt="QR Code" style={{ width: 140, height: 'auto', borderRadius: 4, border: '1px solid #1e1e1e' }} />
          <div style={{ display: 'flex', gap: 5 }}>
            <button onClick={download} style={{ flex: 1, padding: '5px 8px', background: '#f0f0f0', color: '#111', border: 'none', borderRadius: 3, fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em' }}>
              DOWNLOAD
            </button>
            <button onClick={generateQR} disabled={generating} style={{ flex: 1, padding: '5px 8px', background: 'transparent', color: '#555', border: '1px solid #2a2a2a', borderRadius: 3, fontSize: 9, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', opacity: generating ? 0.5 : 1 }}>
              {generating ? '...' : 'REGEN'}
            </button>
          </div>
        </>
      ) : (
        <button onClick={generateQR} disabled={generating} style={{ padding: '7px 12px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 3, fontSize: 9, color: '#888', cursor: generating ? 'not-allowed' : 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', opacity: generating ? 0.6 : 1 }}>
          {generating ? 'GENERATING...' : 'GENERATE QR CODE'}
        </button>
      )}
    </div>
  )
}
