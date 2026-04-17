'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'claim' | 'secure'

function LayoutIcon({ type }: { type: 'rows' | 'bubbles' | 'grid' | 'icons' }) {
  const size = 36
  const color = 'rgba(255,255,255,0.15)'
  if (type === 'rows') return (
    <div style={{ width: size, height: size, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5, margin: '0 auto' }}>
      {[1,2,3].map(i => <div key={i} style={{ height: 3, background: color, borderRadius: 2 }} />)}
    </div>
  )
  if (type === 'bubbles') return (
    <div style={{ width: size, height: size, display: 'flex', flexWrap: 'wrap', gap: 4, alignContent: 'center', justifyContent: 'center', margin: '0 auto' }}>
      {[16,12,20,14].map((w,i) => <div key={i} style={{ height: 8, width: w, background: color, borderRadius: 99 }} />)}
    </div>
  )
  if (type === 'grid') return (
    <div style={{ width: size, height: size, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 4, margin: '0 auto' }}>
      {[1,2,3,4].map(i => <div key={i} style={{ background: color, borderRadius: 2 }} />)}
    </div>
  )
  return (
    <div style={{ width: size, height: size, display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
      {[1,2,3].map(i => <div key={i} style={{ width: 9, height: 9, background: color, borderRadius: '50%' }} />)}
    </div>
  )
}

export default function Home() {
  const [step, setStep] = useState<Step>('claim')
  const [handle, setHandle] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const getStrength = (p: string) => {
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  }
  const strength = getStrength(password)
  const strengthLabel = ['', 'WEAK', 'FAIR', 'GOOD', 'STRONG'][strength]
  const strengthColor = ['', '#D85A30', '#BA7517', '#1D9E75', '#0F6E56'][strength]

  const checkHandle = async () => {
    const clean = handle.toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (!clean || clean.length < 2) { setError('At least 2 characters, letters and numbers only'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ handle: clean }) })
    const data = await res.json()
    setLoading(false)
    if (data.exists) { setError('That handle is taken. Try another.'); return }
    setHandle(clean)
    setStep('secure')
  }

  const claimAndSecure = async () => {
    if (!email || !password || !confirmPassword) { setError('Fill in all fields'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Invalid email address format"); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (strength < 2) { setError('Password is too weak — add uppercase, numbers or symbols'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')

    // First create the profile
    const publishRes = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle, bio: 'hey, this is me on the internet',
        avatar_initials: handle.slice(0, 2).toUpperCase(),
        avatar_color: '#111110', links: [], layout: 'rows', theme: 'dark',
      }),
    })
    if (!publishRes.ok) { setError('Failed to create profile'); setLoading(false); return }

    // Then sign up
    const signupRes = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle, email, password }),
    })
    const data = await signupRes.json()
    if (!signupRes.ok) { setError(data.error); setLoading(false); return }

    localStorage.setItem('ld_session', data.token)
    localStorage.setItem('ld_handle', handle)
    window.location.href = `/builder?handle=${handle}`
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0c0c0c',
      backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: "'DM Mono', monospace",
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480, width: '100%' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: '1.5rem' }}>
          <img src="/logo.png" alt="Linkdrop" style={{ width: 28, height: 28, opacity: 0.9 }} />
          <span style={{ fontSize: 10, color: '#f0f0f0', letterSpacing: '0.15em' }}>LINKDROP</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1rem', color: '#f0f0f0', fontFamily: "'DM Sans', sans-serif" }}>
          your links,<br />your layout.
        </h1>

        <p style={{ fontSize: 13, color: '#555', marginBottom: '2.5rem', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
          No bloat. Pick rows, bubbles, grid or icons.<br />Claim your handle and go.
        </p>

        {step === 'claim' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', background: '#111', border: '1px solid #1e1e1e', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
              <span style={{ padding: '0 12px 0 16px', fontSize: 12, color: '#444', borderRight: '1px solid #1e1e1e', whiteSpace: 'nowrap' }}>
                linkdrop.ayteelabs.com/
              </span>
              <input
                type="text"
                placeholder="yourname"
                value={handle}
                onChange={e => { setHandle(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && checkHandle()}
                style={{ flex: 1, padding: '13px 12px', background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: '#f0f0f0', fontFamily: "'DM Mono', monospace" }}
              />
              <button onClick={checkHandle} disabled={loading} style={{ padding: '13px 20px', background: '#f0f0f0', color: '#111', border: 'none', fontSize: 10, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', whiteSpace: 'nowrap', opacity: loading ? 0.6 : 1 }}>
                {loading ? '...' : 'CLAIM →'}
              </button>
            </div>
            {error && <p style={{ fontSize: 11, color: '#D85A30', marginBottom: 8, letterSpacing: '0.04em' }}>{error}</p>}
            <p style={{ fontSize: 10, color: '#333', marginTop: 8 }}>one handle · one password · yours forever</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: '3rem' }}>
              {(['rows', 'bubbles', 'grid', 'icons'] as const).map(layout => (
                <div key={layout} style={{ textAlign: 'center' }}>
                  <LayoutIcon type={layout} />
                  <div style={{ fontSize: 9, color: '#333', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{layout}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem' }}>
              <a href="/login" style={{ fontSize: 9, color: '#444', textDecoration: 'none', letterSpacing: '0.08em' }}>ALREADY HAVE A HANDLE? SIGN IN →</a>
            </div>
          </>
        ) : (
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 4, overflow: 'hidden', textAlign: 'left' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src="/logo.png" alt="" style={{ width: 14, height: 14, opacity: 0.6 }} />
                <span style={{ fontSize: 9, color: '#888', letterSpacing: '0.12em' }}>SECURE @{handle.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                {[1,2,3].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: i === 1 ? '#f0f0f0' : '#2a2a2a' }} />)}
              </div>
            </div>

            <div style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 10, color: '#666', lineHeight: 1.6, letterSpacing: '0.04em', marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
                Set a password so only you can edit @{handle}. Use your email if you ever need to reset it.
              </p>

              <div>
                <div style={{ fontSize: 9, color: '#555', marginBottom: 4, letterSpacing: '0.08em' }}>EMAIL</div>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }} placeholder="you@example.com"
                  style={{ width: '100%', padding: '9px 12px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 3, fontSize: 13, color: '#f0f0f0', fontFamily: "'DM Mono', monospace", outline: 'none', boxSizing: 'border-box' as const }} />
              </div>

              <div>
                <div style={{ fontSize: 9, color: '#555', marginBottom: 4, letterSpacing: '0.08em' }}>PASSWORD</div>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError('') }} placeholder="min 8 chars"
                    style={{ width: '100%', padding: '9px 36px 9px 12px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 3, fontSize: 13, color: '#f0f0f0', fontFamily: "'DM Mono', monospace", outline: 'none', boxSizing: 'border-box' as const }} />
                  <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#555', fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em', padding: 0 }}>
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
                {password.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColor : '#2a2a2a', transition: 'background 0.2s' }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 8, color: '#444', letterSpacing: '0.06em' }}>
                        {[
                          { label: '8+ chars', ok: password.length >= 8 },
                          { label: 'UPPER', ok: /[A-Z]/.test(password) },
                          { label: '123', ok: /[0-9]/.test(password) },
                          { label: '!@#', ok: /[^A-Za-z0-9]/.test(password) },
                        ].map(r => (
                          <span key={r.label} style={{ marginRight: 8, color: r.ok ? '#0F6E56' : '#444' }}>{r.ok ? '✓' : '·'} {r.label}</span>
                        ))}
                      </div>
                      {strength > 0 && <span style={{ fontSize: 8, color: strengthColor, letterSpacing: '0.08em', fontWeight: 600 }}>{strengthLabel}</span>}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: 9, color: '#555', marginBottom: 4, letterSpacing: '0.08em' }}>CONFIRM PASSWORD</div>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && claimAndSecure()} placeholder="re-enter password"
                    style={{ width: '100%', padding: '9px 36px 9px 12px', background: '#1a1a1a', border: `1px solid ${confirmPassword && confirmPassword !== password ? '#D85A30' : confirmPassword && confirmPassword === password ? '#0F6E56' : '#2a2a2a'}`, borderRadius: 3, fontSize: 13, color: '#f0f0f0', fontFamily: "'DM Mono', monospace", outline: 'none', boxSizing: 'border-box' as const }} />
                  <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#555', fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em', padding: 0 }}>
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
                {confirmPassword && confirmPassword === password && (
                  <div style={{ fontSize: 8, color: '#0F6E56', marginTop: 4, letterSpacing: '0.06em' }}>✓ PASSWORDS MATCH</div>
                )}
                {confirmPassword && confirmPassword !== password && (
                  <div style={{ fontSize: 8, color: '#D85A30', marginTop: 4, letterSpacing: '0.06em' }}>✗ PASSWORDS DO NOT MATCH</div>
                )}
              </div>

              {error && <div style={{ fontSize: 10, color: '#D85A30', letterSpacing: '0.04em' }}>{error}</div>}

              <button onClick={claimAndSecure} disabled={loading} style={{ padding: '11px', background: '#f0f0f0', color: '#111', border: 'none', borderRadius: 3, fontSize: 10, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
                {loading ? 'CREATING...' : 'CLAIM & BUILD →'}
              </button>

              <button onClick={() => { setStep('claim'); setError('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#444', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', padding: 0 }}>
                ← PICK A DIFFERENT HANDLE
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
