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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase
    .from('profiles')
    .select('handle, bio, avatar_url, avatar_color, links')
    .eq('handle', params.handle)
    .single()

  if (!data) return { title: 'linkdrop' }

  const handle = data.handle
  const bio = data.bio || `@${handle}'s links on Linkdrop`
  const url = `https://linkdrop.ayteelabs.com/${handle}`
  const image = data.avatar_url || `https://linkdrop.ayteelabs.com/logo.png`
  const linkCount = data.links?.length || 0
  const description = bio + (linkCount > 0 ? ` · ${linkCount} link${linkCount === 1 ? '' : 's'}` : '')

  return {
    title: `@${handle} — Linkdrop`,
    description,
    openGraph: {
      title: `@${handle} on Linkdrop`,
      description,
      url,
      siteName: 'Linkdrop',
      images: [
        {
          url: image,
          width: 400,
          height: 400,
          alt: `@${handle}'s profile photo`,
        }
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      site: '@ayteelabs',
      title: `@${handle} on Linkdrop`,
      description,
      images: [image],
    },
  }
}
