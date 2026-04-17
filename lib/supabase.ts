import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars — check your .env.local file')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
})

export type Layout = 'rows' | 'bubbles' | 'grid' | 'icons'
export type Theme = 'light' | 'dark' | 'purple' | 'teal' | 'coral'

export interface LinkItem {
  id: string
  label: string
  url: string
  color: string
  initials: string
  avatar_url?: string
  pinned?: boolean
  size?: 'small' | 'medium' | 'large'
}

export interface Profile {
  handle: string
  bio: string
  avatar_initials: string
  avatar_color: string
  links: LinkItem[]
  layout: Layout
  theme: Theme
}
