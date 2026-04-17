import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // Auth is handled client-side in the builder page
  // Middleware was causing cookie timing issues on production
  return NextResponse.next()
}

export const config = {
  matcher: ['/builder'],
}
