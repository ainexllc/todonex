import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Redirect any /tasks or /tasks/* requests to / permanently (308)
  if (pathname.startsWith('/tasks')) {
    const url = new URL('/', request.url)
    // Preserve query parameters
    url.search = search
    return NextResponse.redirect(url, 308)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/tasks/:path*'
}