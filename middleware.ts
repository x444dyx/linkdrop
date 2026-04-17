import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl

  if (pathname === '/builder') {
    const handle = searchParams.get('handle')
    const session = req.cookies.get('ld_session')?.value
    const cookieHandle = req.cookies.get('ld_handle')?.value

    // No session — redirect to login
    if (!session) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      if (handle) url.searchParams.set('handle', handle)
      return NextResponse.redirect(url)
    }

    // Session handle doesn't match requested handle
    if (handle && cookieHandle && cookieHandle !== handle) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('handle', handle)
      url.searchParams.set('mismatch', '1')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/builder'],
}
