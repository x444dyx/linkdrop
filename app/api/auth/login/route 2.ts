import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, recordFailedAttempt, clearAttempts } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const { handle, password } = await req.json()
  if (!handle || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const serviceClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  const anonClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  // Check if locked
  const { locked, attempts } = await checkRateLimit(handle)
  if (locked) {
    return NextResponse.json({
      error: 'Account locked after too many failed attempts. Please reset your password via email.',
      locked: true,
    }, { status: 429 })
  }

  // Get email for this handle
  const { data: profile } = await serviceClient.from('profiles').select('email, handle').eq('handle', handle).single()
  if (!profile) return NextResponse.json({ error: 'Handle not found' }, { status: 404 })
  if (!profile.email) return NextResponse.json({ error: 'This handle has no password set. Go to the claim page.' }, { status: 400 })

  const { data, error } = await anonClient.auth.signInWithPassword({ email: profile.email, password })

  if (error) {
    const { locked: nowLocked, remaining } = await recordFailedAttempt(handle)
    if (nowLocked) {
      return NextResponse.json({
        error: 'Account locked after too many failed attempts. Please reset your password via email.',
        locked: true,
      }, { status: 429 })
    }
    return NextResponse.json({
      error: `Incorrect password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before lockout.`,
      remaining,
    }, { status: 401 })
  }

  // Success — clear failed attempts
  await clearAttempts(handle)

  const res = NextResponse.json({ success: true, handle })
  const isProd = process.env.NODE_ENV === 'production'
  res.cookies.set('ld_session', data.session!.access_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  res.cookies.set('ld_handle', handle, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return res
}
