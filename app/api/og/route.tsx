import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle')

  let bio = 'your links, your layout.'
  let avatarUrl = ''
  let avatarInitials = 'LD'
  let avatarColor = '#534AB7'

  if (handle) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data } = await supabase
        .from('profiles')
        .select('bio, avatar_url, avatar_initials, avatar_color')
        .eq('handle', handle)
        .single()

      if (data) {
        bio = data.bio || bio
        avatarUrl = data.avatar_url || ''
        avatarInitials = data.avatar_initials || handle.slice(0, 2).toUpperCase()
        avatarColor = data.avatar_color || avatarColor
      }
    } catch {}
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0c0c0c',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          display: 'flex',
        }} />

        {/* Top LINKDROP label */}
        <div style={{
          position: 'absolute', top: 40, left: 60,
          fontSize: 14, color: '#444', letterSpacing: 8,
          display: 'flex',
        }}>
          LINKDROP
        </div>

        {/* Avatar */}
        <div style={{
          width: 120, height: 120, borderRadius: 60,
          background: avatarColor,
          overflow: 'hidden',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40, fontWeight: 500, color: '#fff',
          border: '2px solid rgba(255,255,255,0.1)',
        }}>
          {avatarUrl
            ? <img src={avatarUrl} width={120} height={120} style={{ objectFit: 'cover' }} />
            : avatarInitials
          }
        </div>

        {/* Handle */}
        <div style={{
          fontSize: 56, fontWeight: 300, color: '#f0f0f0',
          marginBottom: 16, display: 'flex',
          letterSpacing: -1,
        }}>
          @{handle || 'linkdrop'}
        </div>

        {/* Bio */}
        <div style={{
          fontSize: 26, color: '#666',
          maxWidth: 700, textAlign: 'center',
          lineHeight: 1.4, display: 'flex',
        }}>
          {bio.length > 80 ? bio.slice(0, 80) + '...' : bio}
        </div>

        {/* Bottom URL */}
        <div style={{
          position: 'absolute', bottom: 40,
          fontSize: 16, color: '#333', letterSpacing: 2,
          display: 'flex',
        }}>
          linkdrop.ayteelabs.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
