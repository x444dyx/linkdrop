'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function LoginInner() {
  const params = useSearchParams()
  const router = useRouter()
  const handle = params.get('handle') || ''
  const mismatch = params.get('mismatch') === '1'

  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [inputHandle, setInputHandle] = useState(handle)
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [locked, setLocked] = useState(false)
  const [forgotHandle, setForgotHandle] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const login = async () => {
    if (!inputHandle || !password) { setError('Enter your handle and password'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle: inputHandle.toLowerCase(), password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
      if (data.locked) setLocked(true)
      setLoading(false)
      return
    }
    // Small delay to ensure cookie is committed before navigation
    await new Promise(resolve => setTimeout(resolve, 100))
    window.location.href = `/builder?handle=${inputHandle.toLowerCase()}`
  }

  const forgot = async () => {
    if (!forgotHandle) { setError('Enter your handle'); return }
    if (!email) { setError('Enter your email'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/auth/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle: forgotHandle.toLowerCase(), email }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setSuccess('Reset link sent — check your email')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0c0c0c',
      backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Mono', monospace", padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/landing" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 4 }}>
            <img src="/logo.png" alt="Linkdrop" style={{ width: 22, height: 22, opacity: 0.8 }} />
            <span style={{ fontSize: 9, color: '#888', letterSpacing: '0.12em' }}>← LINKDROP</span>
          </Link>
          <div style={{ fontSize: 20, color: '#f0f0f0', marginTop: 12, fontWeight: 300, letterSpacing: '-0.01em', fontFamily: "'DM Sans', sans-serif" }}>
            {mode === 'login' ? 'sign in' : 'reset password'}
          </div>
          {handle && <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>editing @{handle}</div>}
          {mismatch && <div style={{ fontSize: 10, color: '#993C1D', marginTop: 4, letterSpacing: '0.04em' }}>you need to sign in to edit @{handle}</div>}
        </div>

        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 4, overflow: 'hidden' }}>

          {/* Top bar */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src="/logo.png" alt="" style={{ width: 14, height: 14, opacity: 0.6 }} />
              <span style={{ fontSize: 9, color: '#888', letterSpacing: '0.12em' }}>LINKDROP</span>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {[1,2,3].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: i === 1 ? '#f0f0f0' : '#2a2a2a' }} />)}
            </div>
          </div>

          <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

            {mode === 'login' ? (
              <>
                <div>
                  <div style={{ fontSize: 9, color: '#555', marginBottom: 5, letterSpacing: '0.08em' }}>HANDLE</div>
                  <input
                    value={inputHandle}
                    onChange={e => setInputHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="yourhandle"
                    style={{ width: '100%', padding: '9px 12px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 3, fontSize: 13, color: '#f0f0f0', fontFamily: "'DM Mono', monospace", outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#555', marginBottom: 5, letterSpacing: '0.08em' }}>PASSWORD</div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && login()}
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '9px 36px 9px 12px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 3, fontSize: 13, color: '#f0f0f0', fontFamily: "'DM Mono', monospace", outline: 'none', boxSizing: 'border-box' }}
                    />
                    <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#555', fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em', padding: 0 }}>
                      {showPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                {error && (
                  <div style={{ fontSize: 10, color: '#D85A30', letterSpacing: '0.04em', lineHeight: 1.5 }}>{error}</div>
                )}

                {locked && (
                  <div style={{ background: '#1a0a0a', border: '1px solid #D85A30', borderRadius: 3, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 9, color: '#D85A30', letterSpacing: '0.06em' }}>ACCOUNT LOCKED</div>
                    <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.04em', lineHeight: 1.5 }}>Too many failed attempts. Reset your password to regain access.</div>
                    <button onClick={() => { setMode('forgot'); setLocked(false); setError('') }} style={{ padding: '7px', background: '#D85A30', color: '#fff', border: 'none', borderRadius: 3, fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
                      RESET PASSWORD VIA EMAIL →
                    </button>
                  </div>
                )}

                <button onClick={login} disabled={loading || locked} style={{ padding: '10px', background: '#f0f0f0', color: '#111', border: 'none', borderRadius: 3, fontSize: 10, fontWeight: 600, cursor: (loading || locked) ? 'not-allowed' : 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', opacity: (loading || locked) ? 0.5 : 1, marginTop: 4 }}>
                  {loading ? 'SIGNING IN...' : 'SIGN IN →'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <button onClick={() => { setMode('forgot'); setError('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#555', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', padding: 0 }}>
                    FORGOT PASSWORD
                  </button>
                  <Link href="/claim" style={{ fontSize: 9, color: '#555', textDecoration: 'none', letterSpacing: '0.06em' }}>
                    CLAIM NEW HANDLE
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 10, color: '#888', lineHeight: 1.6, letterSpacing: '0.04em' }}>
                  Enter your handle and the email you used when claiming it. We'll verify both before sending a reset link.
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#555', marginBottom: 5, letterSpacing: '0.08em' }}>HANDLE</div>
                  <input
                    type="text"
                    value={forgotHandle}
                    onChange={e => { setForgotHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')); setError('') }}
                    placeholder="yourhandle"
                    style={{ width: '100%', padding: '9px 12px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 3, fontSize: 13, color: '#f0f0f0', fontFamily: "'DM Mono', monospace", outline: 'none', boxSizing: 'border-box' as const }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 9, color: '#555', marginBottom: 5, letterSpacing: '0.08em' }}>EMAIL</div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && forgot()}
                    placeholder="you@example.com"
                    style={{ width: '100%', padding: '9px 12px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 3, fontSize: 13, color: '#f0f0f0', fontFamily: "'DM Mono', monospace", outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                {error && <div style={{ fontSize: 10, color: '#D85A30', letterSpacing: '0.04em' }}>{error}</div>}
                {success && <div style={{ fontSize: 10, color: '#0F6E56', letterSpacing: '0.04em' }}>{success}</div>}

                <button onClick={forgot} disabled={loading || !!success} style={{ padding: '10px', background: '#f0f0f0', color: '#111', border: 'none', borderRadius: 3, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
                  {loading ? 'SENDING...' : 'SEND RESET LINK →'}
                </button>

                <button onClick={() => { setMode('login'); setError(''); setSuccess(''); setForgotHandle('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#555', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', padding: 0, textAlign: 'left' }}>
                  ← BACK TO SIGN IN
                </button>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 8, color: '#333', letterSpacing: '0.1em' }}>LINKDROP.AYTEELABS.COM</span>
            <span style={{ fontSize: 8, color: '#333', letterSpacing: '0.1em' }}>AYTEELABS.COM</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginInner /></Suspense>
}
