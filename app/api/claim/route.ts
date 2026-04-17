import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { handle } = await req.json()

  if (!handle || handle.length < 2) {
    return NextResponse.json({ error: 'Invalid handle' }, { status: 400 })
  }

  const { data } = await supabase
    .from('profiles')
    .select('handle')
    .eq('handle', handle)
    .single()

  return NextResponse.json({ exists: !!data })
}
