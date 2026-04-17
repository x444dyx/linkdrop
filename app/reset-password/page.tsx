'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

function ResetInner() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)
  const [handle, setHandle] = useState('')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
        // Get handle for this user so we can clear lockout
        if (session?.user?.email) {
          const serviceRes = await fetch('/api/auth/clear-lockout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: session.user.email }),
          })
          const d = await serviceRes.json()
          if (d.handle) setHandle(d.handle)
        }
      }
    })
  }, [])

  const reset = async () => {
    if (!password || !confirm) { setError('Fill in both fields'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (strength < 2) { setError('Password is too weak — add uppercase, numbers or symbols'); return }
    setLoading(true); setError('')

    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }

    setSuccess(true)
    setTimeout(() => router.push('/login'), 2500)
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
        <div style={{ marginBottom: 32 }}>
          <Link href="/landing" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 4 }}>
            <img src="/logo.png" alt="Linkdrop" style={{ width: 22, height: 22, opacity: 0.8 }} />
            <span style={{ fontSize: 9, color: '#888', letterSpacing: '0.12em' }}>← LINKDROP</span>
          </Link>
          <div style={{ fontSize: 20, color: '#f0f0f0', marginTop: 12, fontWeight: 300, fontFamily: "'DM Sans', sans-serif" }}>set new password</div>
        </div>

        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 4, overflow: 'hidden' }}>
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
            {success ? (
              <div style={{ fontSize: 11, color: '#0F6E56', letterSpacing: '0.06em', textAlign: 'center', padding: '12px 0' }}>
                PASSWORD UPDATED ✓<br />
                <span style={{ fontSize: 9, color: '#555', marginTop: 6, display: 'block' }}>redirecting to sign in...</span>
              </div>
            ) : !ready ? (
              <div style={{ fontSize: 10, color: '#555', letterSpacing: '0.06em', textAlign: 'center', padding: '12px 0' }}>
                LOADING RESET LINK...<br />
                <span style={{ fontSize: 9, color: '#444', marginTop: 6, display: 'block' }}>if this takes too long, request a new reset link</span>
              </div>
            ) : (
              <>
                <div>
                  <div style={{ fontSize: 9, color: '#555', marginBottom: 5, letterSpacing: '0.08em' }}>NEW PASSWORD</div>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="min 8 chars"
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
                        <div style={{ fontSize: 8, color: '#444' }}>
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
                  <div style={{ fontSize: 9, color: '#555', marginBottom: 5, letterSpacing: '0.08em' }}>CONFIRM PASSWORD</div>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === 'Enter' && reset()} placeholder="re-enter password"
                      style={{ width: '100%', padding: '9px 36px 9px 12px', background: '#1a1a1a', border: `1px solid ${confirm && confirm !== password ? '#D85A30' : confirm && confirm === password ? '#0F6E56' : '#2a2a2a'}`, borderRadius: 3, fontSize: 13, color: '#f0f0f0', fontFamily: "'DM Mono', monospace", outline: 'none', boxSizing: 'border-box' as const }} />
                    <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#555', fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em', padding: 0 }}>
                      {showPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                  {confirm && confirm === password && <div style={{ fontSize: 8, color: '#0F6E56', marginTop: 4, letterSpacing: '0.06em' }}>✓ PASSWORDS MATCH</div>}
                  {confirm && confirm !== password && <div style={{ fontSize: 8, color: '#D85A30', marginTop: 4, letterSpacing: '0.06em' }}>✗ PASSWORDS DO NOT MATCH</div>}
                </div>
                {error && <div style={{ fontSize: 10, color: '#D85A30', letterSpacing: '0.04em' }}>{error}</div>}
                <button onClick={reset} disabled={loading} style={{ padding: '10px', background: '#f0f0f0', color: '#111', border: 'none', borderRadius: 3, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
                  {loading ? 'UPDATING...' : 'SET NEW PASSWORD →'}
                </button>
              </>
            )}
          </div>

          <div style={{ padding: '10px 16px', borderTop: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 8, color: '#333', letterSpacing: '0.1em' }}>LINKDROP.AYTEELABS.COM</span>
            <span style={{ fontSize: 8, color: '#333', letterSpacing: '0.1em' }}>AYTEELABS.COM</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return <Suspense><ResetInner /></Suspense>
}
