'use client'
import { useState } from 'react'
import Link from 'next/link'

const SECTIONS = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'builder', label: 'Builder' },
  { id: 'links', label: 'Links' },
  { id: 'themes', label: 'Themes' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'explore', label: 'Explore' },
  { id: 'account', label: 'Account' },
  { id: 'faq', label: 'FAQ' },
]

const FAQ = [
  { q: 'Is Linkdrop free?', a: 'Yes. Completely free. No subscription, no credit card, no limits on links.' },
  { q: 'Can I change my handle after claiming it?', a: 'Not currently. Your handle is permanent once claimed. Choose carefully — it\'s part of your URL.' },
  { q: 'What happens if I forget my password?', a: 'Go to the login page and click "Forgot password". Enter your handle and the email you signed up with. We\'ll send a reset link immediately.' },
  { q: 'Can someone else edit my profile?', a: 'No. Your builder is protected by your password. Anyone who tries to access /builder?handle=yours gets redirected to the login page.' },
  { q: 'Will my profile go down if I close the browser?', a: 'No. Once published, your profile is live at your URL 24/7. It has nothing to do with your browser or device.' },
  { q: 'What image formats are supported for photos?', a: 'JPG, PNG and GIF up to 10MB for your profile photo. Images are stored securely and served via Supabase CDN.' },
  { q: 'Can I have multiple profiles?', a: 'You can claim multiple handles with different emails. Each handle has its own independent profile, password and analytics.' },
  { q: 'How does the copy theme feature work?', a: 'On the explore page, click "USE THEME" on any profile. Enter your own handle and password to verify it\'s you. The background and accent colours are copied instantly to your profile.' },
  { q: 'Does Linkdrop track my visitors?', a: 'We only count profile views (total visits to your page) and link clicks (per link). No personal data, no cookies, no third-party trackers.' },
  { q: 'Can I delete my account?', a: 'Yes. Go to Settings in your builder and scroll to "Danger zone". Enter your password to confirm. Your profile, links, analytics and auth account are all permanently deleted and your handle becomes available again.' },
]

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ paddingTop: 64, paddingBottom: 40, borderBottom: '1px solid #1a1a1a' }}>
      <h2 style={{ fontSize: 22, fontWeight: 300, color: '#f0f0f0', marginBottom: 24, fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em' }}>{title}</h2>
      {children}
    </div>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>{children}</p>
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 13, color: '#f0f0f0', marginBottom: 8, marginTop: 24, fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>{children}</h3>
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 3, fontSize: 10, color: '#888', fontFamily: "'DM Mono', monospace", marginRight: 4, marginBottom: 4 }}>{children}</span>
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '12px 16px', background: '#111', border: '1px solid #1e1e1e', borderLeft: '2px solid #f0f0f0', borderRadius: 3, marginBottom: 16 }}>
      <p style={{ fontSize: 12, color: '#888', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{children}</p>
    </div>
  )
}

export default function DocsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: "'DM Mono', monospace" }}>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1a1a1a' }}>
        <Link href="/landing" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo.png" alt="Linkdrop" style={{ width: 20, height: 20, opacity: 0.9 }} />
          <span style={{ fontSize: 10, color: '#f0f0f0', letterSpacing: '0.12em' }}>LINKDROP</span>
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/explore" style={{ fontSize: 9, color: '#555', textDecoration: 'none', letterSpacing: '0.1em', padding: '6px 12px' }}>EXPLORE</Link>
          <Link href="/login" style={{ fontSize: 9, color: '#888', textDecoration: 'none', letterSpacing: '0.1em', padding: '6px 12px', border: '1px solid #222', borderRadius: 3 }}>SIGN IN</Link>
          <Link href="/claim" style={{ fontSize: 9, color: '#111', background: '#f0f0f0', textDecoration: 'none', letterSpacing: '0.1em', padding: '7px 14px', borderRadius: 3, fontWeight: 600 }}>CLAIM →</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 40px 80px', display: 'flex', gap: 60 }}>

        {/* Sidebar */}
        <div style={{ width: 180, flexShrink: 0, position: 'sticky', top: 80, height: 'fit-content', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 8, color: '#444', letterSpacing: '0.15em', marginBottom: 12 }}>ON THIS PAGE</div>
          {SECTIONS.map(s => (
            <a key={s.id} href={`#${s.id}`} style={{ fontSize: 10, color: '#555', textDecoration: 'none', padding: '5px 0', letterSpacing: '0.06em', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f0f0f0'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#555'}
            >{s.label.toUpperCase()}</a>
          ))}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #1a1a1a' }}>
            <Link href="/claim" style={{ fontSize: 9, color: '#f0f0f0', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 3, padding: '7px 12px', textDecoration: 'none', letterSpacing: '0.08em', display: 'block', textAlign: 'center' as const }}>
              CLAIM YOUR HANDLE →
            </Link>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header */}
          <div style={{ paddingBottom: 40, borderBottom: '1px solid #1a1a1a' }}>
            <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.2em', marginBottom: 12 }}>DOCUMENTATION</div>
            <h1 style={{ fontSize: 36, fontWeight: 300, color: '#f0f0f0', marginBottom: 16, fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Linkdrop docs
            </h1>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", maxWidth: 560 }}>
              Everything you need to know about setting up, customising and sharing your Linkdrop profile.
            </p>
          </div>

          {/* Getting Started */}
          <Section id="getting-started" title="Getting Started">
            <P>Linkdrop is a minimal link-in-bio tool. You get one URL — <Tag>linkdrop.ayteelabs.com/yourhandle</Tag> — and you fill it with links, a photo, a bio, and a theme. No account required to browse, but you need a handle to build a profile.</P>

            <H3>Claiming a handle</H3>
            <P>Go to the homepage. Type your desired handle in the URL bar — letters, numbers and underscores only. If it's available, you'll move to step two.</P>
            <P>On step two, enter your email and a password. Your email is used only for password resets — it's never shown publicly. Hit <Tag>CLAIM & BUILD →</Tag> and you land straight in your builder.</P>

            <Note>Handles are permanent. You can't rename or transfer them. If you delete your account, the handle becomes available for someone else to claim.</Note>

            <H3>Password requirements</H3>
            <P>Passwords must be at least 8 characters and pass a strength check. The strength meter shows live feedback — aim for GOOD or STRONG. Requirements: 8+ characters, one uppercase letter, one number, one special character.</P>

            <H3>Returning to your builder</H3>
            <P>Go to <Tag>linkdrop.ayteelabs.com/login</Tag>. Enter your handle and password. You'll be taken straight to your builder. Your session lasts 30 days before you need to sign in again.</P>
          </Section>

          {/* Builder */}
          <Section id="builder" title="Builder">
            <P>The builder is your editing interface. It's split into four tabs — Profile, Links, Theme and Settings — with a live preview on the right that updates instantly as you make changes.</P>

            <H3>Profile tab</H3>
            <P>Set your bio (keep it short — one or two lines works best), upload a profile photo with the built-in crop tool, choose an avatar background colour, and pick your layout.</P>

            <H3>Links tab</H3>
            <P>Add custom links or use the Quick Add buttons for X, Instagram, GitHub, LinkedIn, TikTok and YouTube. Each social button prompts for your username and builds the URL automatically.</P>

            <H3>Theme tab</H3>
            <P>Choose from five presets (Light, Dark, Purple, Teal, Coral) or set exact hex codes for background and accent. The accent colour controls text, borders and interactive elements throughout your profile.</P>

            <H3>Settings tab</H3>
            <P>Copy your profile URL, generate and download your branded QR code, view the explore page, or delete your account.</P>

            <H3>Publishing</H3>
            <P>Hit <Tag>PUBLISH</Tag> in the top right. Changes go live immediately. The preview in the builder matches exactly what visitors will see.</P>

            <Note>The builder auto-saves your dark/light mode preference to your browser. Your layout, theme and links only save when you hit Publish.</Note>
          </Section>

          {/* Links */}
          <Section id="links" title="Links">
            <H3>Adding links</H3>
            <P>Click <Tag>+ ADD CUSTOM LINK</Tag> or use the Quick Add buttons. Every link needs a label and a URL. The label is what visitors see; the URL is where they go.</P>

            <H3>Link sizes</H3>
            <P>Each link has three size options:</P>
            <P><Tag>SMALL</Tag> — compact row, tight padding, small avatar circle.</P>
            <P><Tag>MEDIUM</Tag> — taller row, larger avatar, more breathing room.</P>
            <P><Tag>LARGE</Tag> — full banner card with image at top, label below. Works like Linktree's featured links.</P>

            <H3>Link images</H3>
            <P>Each link can have its own image. For large links this becomes a wide banner. For small/medium it's the avatar circle. Click <Tag>change</Tag> under any link to upload.</P>

            <H3>Pinning links</H3>
            <P>Click the 📌 icon to pin a link to the top. Pinned links can't be reordered below unpinned ones. Unpin to move freely again.</P>

            <H3>Reordering</H3>
            <P>Drag links by the ⠿ handle on the left. Pinned links are locked — you can't drag an unpinned link above them.</P>

            <H3>Editing links</H3>
            <P>Click the ✎ icon to edit a link's label and URL inline. Hit Save or press Enter to confirm. Editing updates the initials automatically.</P>

            <H3>Click tracking</H3>
            <P>Every click on a link from your public profile page is recorded. The count shows next to the link label in the builder. Hit <Tag>↻ REFRESH CLICKS</Tag> to update the counts without reloading the page.</P>
          </Section>

          {/* Themes */}
          <Section id="themes" title="Themes">
            <H3>Preset themes</H3>
            <P>Five built-in presets — Light, Dark, Purple, Teal and Coral. Clicking a preset sets both the background and accent colour at once.</P>

            <H3>Custom colours</H3>
            <P>Use the colour pickers or type hex codes directly. Background controls the card and page colour. Accent controls text, link borders and interactive highlights throughout your profile.</P>

            <Note>The contrast between background and accent determines readability. Very similar colours will make your profile hard to read. The preview updates live so you can check before publishing.</Note>

            <H3>Copying a theme from Explore</H3>
            <P>Go to <Tag>/explore</Tag>. Find a profile whose theme you like. Click <Tag>USE THEME</Tag>. Enter your handle and password to confirm — this prevents anyone from changing your theme without permission. The colours are applied immediately and you're redirected to your builder.</P>
          </Section>

          {/* Analytics */}
          <Section id="analytics" title="Analytics">
            <H3>Profile views</H3>
            <P>Every visit to your public profile page (<Tag>/yourhandle</Tag>) increments your view counter. The total is shown in your builder header bar next to your handle. It also shows on your card in the explore page.</P>

            <H3>Link clicks</H3>
            <P>Every time a visitor clicks a link on your public profile, it's recorded against that specific link. Click counts appear as small badges next to each link in your builder's Links tab.</P>
            <P>Clicks are tracked per-link so you can see which links perform best. Use <Tag>↻ REFRESH CLICKS</Tag> to pull the latest counts without a full page reload.</P>

            <Note>Analytics are private — only visible in your builder. Visitors see no tracking notices, no popups and no cookies. We store only the handle and link ID, never any visitor personal data.</Note>

            <H3>Sorting by views on Explore</H3>
            <P>The explore page has a <Tag>MOST VIEWED</Tag> sort option that ranks profiles by total view count. Building up views over time moves your profile higher in that ranking.</P>
          </Section>

          {/* Explore */}
          <Section id="explore" title="Explore">
            <P>The explore page at <Tag>/explore</Tag> shows all published Linkdrop profiles. It's public — no login needed to browse.</P>

            <H3>Sorting</H3>
            <P><Tag>NEWEST</Tag> — profiles ordered by when they were created, newest first.</P>
            <P><Tag>RECENTLY UPDATED</Tag> — profiles ordered by last publish date. Active profiles stay near the top.</P>
            <P><Tag>MOST VIEWED</Tag> — profiles ordered by total view count.</P>

            <H3>Search</H3>
            <P>Type in the search bar and press Enter or click GO. Search checks handle names, bios and link labels. Press Escape or click CLEAR to reset.</P>

            <H3>Copy theme</H3>
            <P>Click <Tag>USE THEME</Tag> on any profile card. Enter your handle and your password. The background and accent colours from that profile are copied to yours. Your links, bio, layout and photo are not affected — only the colours change.</P>

            <Note>The copy theme feature requires your password to prevent anyone from changing your theme without permission. Wrong password attempts are counted — 5 failures locks your account until you reset your password.</Note>
          </Section>

          {/* Account */}
          <Section id="account" title="Account">
            <H3>Changing your password</H3>
            <P>Go to <Tag>/login</Tag> and click <Tag>FORGOT PASSWORD</Tag>. Enter your handle and the email you signed up with — both must match. A reset link is sent to your email. The reset page has the same strength meter as signup.</P>

            <H3>Account lockout</H3>
            <P>After 5 incorrect password attempts within 30 minutes, your account is locked. You can't sign in until you reset your password via email. Successful login clears the attempt count. Successful password reset also clears the lockout immediately.</P>

            <H3>Deleting your account</H3>
            <P>Go to your builder → Settings tab → scroll to <Tag>DANGER ZONE</Tag>. Click <Tag>DELETE ACCOUNT</Tag>. Enter your password to confirm. This permanently deletes your profile, all link click data, and your auth account. Your handle is freed immediately.</P>

            <Note>Account deletion is permanent and cannot be undone. There is no grace period or recovery option.</Note>
          </Section>

          {/* FAQ */}
          <Section id="faq" title="FAQ">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {FAQ.map((item, i) => (
                <div key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', textAlign: 'left' as const, padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ fontSize: 13, color: '#e0e0e0', fontFamily: "'DM Sans', sans-serif" }}>{item.q}</span>
                    <span style={{ fontSize: 14, color: '#444', flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ paddingBottom: 16 }}>
                      <p style={{ fontSize: 13, color: '#888', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Bottom CTA */}
          <div style={{ paddingTop: 64, textAlign: 'center' as const }}>
            <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.15em', marginBottom: 16 }}>READY?</div>
            <h2 style={{ fontSize: 28, fontWeight: 300, color: '#f0f0f0', marginBottom: 12, fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em' }}>claim your handle.</h2>
            <p style={{ fontSize: 12, color: '#555', marginBottom: 28, letterSpacing: '0.06em' }}>one handle · one password · yours forever</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <Link href="/claim" style={{ padding: '10px 24px', background: '#f0f0f0', color: '#111', textDecoration: 'none', borderRadius: 3, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em' }}>GET STARTED →</Link>
              <Link href="/login" style={{ padding: '10px 24px', background: 'transparent', color: '#666', textDecoration: 'none', border: '1px solid #222', borderRadius: 3, fontSize: 9, letterSpacing: '0.12em' }}>SIGN IN</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
