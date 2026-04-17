import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, recordFailedAttempt, clearAttempts } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const { handle, password, theme, custom_bg, custom_accent } = await req.json()
  if (!handle || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Check rate limit
  const { locked } = await checkRateLimit(handle)
  if (locked) {
    return NextResponse.json({
      error: 'Account locked after too many failed attempts. Reset your password via email.',
      locked: true,
    }, { status: 429 })
  }

  const { data: profile } = await serviceClient.from('profiles').select('email').eq('handle', handle).single()
  if (!profile) return NextResponse.json({ error: `Handle @${handle} not found` }, { status: 404 })
  if (!profile.email) return NextResponse.json({ error: `@${handle} has no password set` }, { status: 400 })

  const { error: authError } = await anonClient.auth.signInWithPassword({ email: profile.email, password })

  if (authError) {
    const { locked: nowLocked, remaining } = await recordFailedAttempt(handle)
    if (nowLocked) {
      return NextResponse.json({
        error: 'Account locked after too many failed attempts. Reset your password via email.',
        locked: true,
      }, { status: 429 })
    }
    return NextResponse.json({
      error: `Incorrect password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before lockout.`,
      remaining,
    }, { status: 401 })
  }

  // Success — clear attempts and apply theme
  await clearAttempts(handle)
  await serviceClient.from('profiles').update({
    theme, custom_bg: custom_bg || null, custom_accent: custom_accent || null
  }).eq('handle', handle)

  return NextResponse.json({ success: true })
}
