import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, recordFailedAttempt, clearAttempts } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const { handle, password } = await req.json()
  if (!handle || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const serviceClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  const anonClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const { locked } = await checkRateLimit(handle)
  if (locked) {
    return NextResponse.json({
      error: 'Account locked after too many failed attempts. Please reset your password via email.',
      locked: true,
    }, { status: 429 })
  }

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

  await clearAttempts(handle)

  // Return the token in the response body — client stores it in localStorage
  return NextResponse.json({
    success: true,
    handle,
    token: data.session!.access_token,
  })
}
