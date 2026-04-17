import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
  const { handle, link_id } = await req.json()
  if (!handle || !link_id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  await supabase.from('link_clicks').insert({ handle, link_id })
  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
  const handle = req.nextUrl.searchParams.get('handle')
  if (!handle) return NextResponse.json({ error: 'Missing handle' }, { status: 400 })

  const { data } = await supabase
    .from('link_clicks')
    .select('link_id')
    .eq('handle', handle)

  const counts: Record<string, number> = {}
  data?.forEach(row => {
    counts[row.link_id] = (counts[row.link_id] || 0) + 1
  })

  return NextResponse.json({ counts })
}
