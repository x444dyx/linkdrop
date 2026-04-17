import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
  const { handle, qr_url } = await req.json()
  if (!handle || !qr_url) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  await supabase.from('profiles').update({ qr_url }).eq('handle', handle)
  return NextResponse.json({ success: true })
}
