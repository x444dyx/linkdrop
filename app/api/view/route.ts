import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
  const { handle } = await req.json()
  if (!handle) return NextResponse.json({ error: 'Missing handle' }, { status: 400 })

  await supabase.rpc('increment_views', { p_handle: handle })
  return NextResponse.json({ success: true })
}
