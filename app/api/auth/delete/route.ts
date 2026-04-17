import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { handle, password } = await req.json()
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

  // Get email for this handle
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('email, user_id')
    .eq('handle', handle)
    .single()

  if (!profile) return NextResponse.json({ error: 'Handle not found' }, { status: 404 })
  if (!profile.email) return NextResponse.json({ error: 'No password set on this account' }, { status: 400 })

  // Verify password
  const { error: authError } = await anonClient.auth.signInWithPassword({
    email: profile.email,
    password,
  })
  if (authError) return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })

  // Delete profile row (frees the handle)
  await serviceClient.from('profiles').delete().eq('handle', handle)

  // Delete link clicks
  await serviceClient.from('link_clicks').delete().eq('handle', handle)

  // Delete auth user
  if (profile.user_id) {
    await serviceClient.auth.admin.deleteUser(profile.user_id)
  }

  return NextResponse.json({ success: true })
}
