import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  const { handle, email } = await req.json()
  if (!handle || !email) return NextResponse.json({ error: 'Enter both your handle and email' }, { status: 400 })

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'That doesn\'t look like a valid email address' }, { status: 400 })
  }

  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Check handle exists and email matches
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('handle, email')
    .eq('handle', handle.toLowerCase())
    .single()

  if (!profile) {
    return NextResponse.json({ error: `Handle @${handle} not found` }, { status: 404 })
  }
  if (!profile.email) {
    return NextResponse.json({ error: `@${handle} has no email on file` }, { status: 400 })
  }
  if (profile.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: 'Email does not match our records for this handle' }, { status: 400 })
  }

  // Send reset email
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await anonClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
