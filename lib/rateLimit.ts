import { createClient } from '@supabase/supabase-js'

const MAX_ATTEMPTS = 5
const WINDOW_MINUTES = 30

export async function checkRateLimit(handle: string): Promise<{ locked: boolean; attempts: number }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('login_attempts')
    .select('id')
    .eq('handle', handle)
    .gte('attempted_at', windowStart)

  const attempts = data?.length || 0
  return { locked: attempts >= MAX_ATTEMPTS, attempts }
}

export async function recordFailedAttempt(handle: string): Promise<{ locked: boolean; remaining: number }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  await supabase.from('login_attempts').insert({ handle })

  const { locked, attempts } = await checkRateLimit(handle)
  return { locked, remaining: Math.max(0, MAX_ATTEMPTS - attempts) }
}

export async function clearAttempts(handle: string): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  await supabase.from('login_attempts').delete().eq('handle', handle)
}
