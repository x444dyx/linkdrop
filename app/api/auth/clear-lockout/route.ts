import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Find handle for this email
  const { data: profile } = await supabase
    .from('profiles')
    .select('handle')
    .eq('email', email)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Clear all login attempts for this handle
  await supabase.from('login_attempts').delete().eq('handle', profile.handle)

  return NextResponse.json({ success: true, handle: profile.handle })
}
