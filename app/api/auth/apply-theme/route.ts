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

  const { locked } = await checkRateLimit(handle)
  if (locked) {
    return NextResponse.json({ error: 'Account locked. Reset your password via email.', locked: true }, { status: 429 })
  }

  const { data: profile } = await serviceClient.from('profiles').select('email, handle').eq('handle', handle).single()
  if (!profile) return NextResponse.json({ error: `Handle @${handle} not found` }, { status: 404 })
  if (!profile.email) return NextResponse.json({ error: `@${handle} has no password set` }, { status: 400 })

  const { error: authError } = await anonClient.auth.signInWithPassword({ email: profile.email, password })
  if (authError) {
    const { locked: nowLocked, remaining } = await recordFailedAttempt(handle)
    if (nowLocked) return NextResponse.json({ error: 'Account locked. Reset your password via email.', locked: true }, { status: 429 })
    return NextResponse.json({ error: `Incorrect password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`, remaining }, { status: 401 })
  }

  await clearAttempts(handle)

  // Update using the exact handle from DB to avoid any casing issues
  const { error: updateError, data: updateData } = await serviceClient
    .from('profiles')
    .update({ theme, custom_bg, custom_accent })
    .eq('handle', profile.handle)
    .select()

  if (updateError) {
    console.error('Update error:', updateError)
    return NextResponse.json({ error: 'Failed to save theme: ' + updateError.message }, { status: 500 })
  }

  console.log('Theme updated:', profile.handle, { theme, custom_bg, custom_accent }, updateData)
  return NextResponse.json({ success: true, handle: profile.handle })
}
