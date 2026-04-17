import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  // Use service role to bypass RLS on publish
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, key, { auth: { persistSession: false } })

  const body = await req.json()
  const { handle, bio, avatar_initials, avatar_color, avatar_url, links, layout, theme, custom_bg, custom_accent, qr_url, text_align } = body

  if (!handle || !links) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      handle, bio, avatar_initials, avatar_color,
      avatar_url: avatar_url || null,
      links, layout, theme,
      custom_bg: custom_bg || null,
      custom_accent: custom_accent || null,
      qr_url: qr_url || null,
      text_align: text_align || 'left',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'handle' })
    .select()

  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
