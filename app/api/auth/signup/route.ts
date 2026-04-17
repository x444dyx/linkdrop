import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { handle, email, password } = await req.json()
  if (!handle || !email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  if (!/[A-Z]/.test(password) && !/[0-9]/.test(password) && !/[^A-Za-z0-9]/.test(password)) {
    return NextResponse.json({ error: 'Password is too weak' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Check email not already in use
  const { data: existingUser } = await supabase.auth.admin.listUsers()
  const emailTaken = existingUser?.users?.some((u: any) => u.email === email)
  if (emailTaken) return NextResponse.json({ error: 'That email is already registered. Try signing in instead.' }, { status: 409 })

  // Check handle exists
  const { data: profile } = await supabase.from('profiles').select('handle, email').eq('handle', handle).single()
  if (!profile) return NextResponse.json({ error: 'Handle not found. Claim it first.' }, { status: 404 })
  if (profile.email) return NextResponse.json({ error: 'This handle is already password protected.' }, { status: 409 })

  // Create Supabase auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { handle },
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  // Link user to profile
  await supabase.from('profiles').update({ email, user_id: authData.user.id }).eq('handle', handle)

  // Set session cookie
  const { data: sessionData } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  // Sign them in directly
  const anonClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({ email, password })

  if (signInError) return NextResponse.json({ error: signInError.message }, { status: 400 })

  const res = NextResponse.json({ success: true, handle })
  res.cookies.set('ld_session', signInData.session!.access_token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/'
  })
  res.cookies.set('ld_handle', handle, {
    httpOnly: false, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/'
  })
  return res
}
