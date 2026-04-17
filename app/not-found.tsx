import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      fontFamily: 'var(--font-sans)',
      gap: 16,
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        linkdrop
      </div>
      <h1 style={{ fontSize: 48, fontWeight: 300, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
        404
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
        This handle doesn&apos;t exist yet.
      </p>
      <Link href="/" style={{
        marginTop: 8,
        padding: '10px 20px',
        background: 'var(--accent)',
        color: 'var(--bg)',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        textDecoration: 'none',
      }}>
        claim it →
      </Link>
    </div>
  )
}
