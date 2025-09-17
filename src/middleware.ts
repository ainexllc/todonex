import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Middleware no longer redirects /tasks requests to fix infinite loop issue
  // Authentication redirects are now handled at the component level
  return NextResponse.next()
}

export const config = {
  matcher: '/tasks/:path*'
}