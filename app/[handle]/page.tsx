import { createClient } from '@supabase/supabase-js'
import PublicProfile from '@/components/PublicProfile'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HandlePage({ params }: { params: { handle: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', params.handle)
    .single()

  if (error || !data) return notFound()

  return (
    <PublicProfile
      profile={{
        handle: data.handle,
        bio: data.bio,
        avatar_initials: data.avatar_initials,
        avatar_color: data.avatar_color,
        links: data.links,
        layout: data.layout,
        theme: data.theme,
      }}
      avatarUrl={data.avatar_url}
      customBg={data.custom_bg}
      customAccent={data.custom_accent}
    />
  )
}

export async function generateMetadata({ params }: { params: { handle: string } }) {
  return {
    title: `@${params.handle} — linkdrop`,
    description: `Check out @${params.handle}'s links on linkdrop`,
  }
}
