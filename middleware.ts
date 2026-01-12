import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const locales = ['en', 'ar'] as const
type Locale = typeof locales[number]
const defaultLocale: Locale = 'en'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard']

// Public routes that don't require auth (auth pages themselves)
const authRoutes = ['/login', '/register', '/get-started', '/forgot-password', '/reset-password', '/verify-email', '/doctor-onboarding']

function getLocale(request: NextRequest): Locale {
    // 1. Check URL query parameter (for sharing/explicit language links)
    const urlLocale = request.nextUrl.searchParams.get('lang')
    if (urlLocale && locales.includes(urlLocale as Locale)) {
        return urlLocale as Locale
    }

    // 2. Check cookie (user's saved preference)
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
    if (cookieLocale && locales.includes(cookieLocale as Locale)) {
        return cookieLocale as Locale
    }

    // 3. Check accept-language header (browser preference)
    const acceptLanguage = request.headers.get('accept-language')
    if (acceptLanguage) {
        const preferredLocale = acceptLanguage
            .split(',')
            .map((lang) => lang.split(';')[0].trim().substring(0, 2).toLowerCase())
            .find((lang) => locales.includes(lang as Locale))

        if (preferredLocale) {
            return preferredLocale as Locale
        }
    }

    return defaultLocale
}

function isProtectedRoute(pathname: string): boolean {
    // Remove locale prefix for checking
    const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '')
    return protectedRoutes.some(route => pathWithoutLocale.startsWith(route))
}

function isAuthRoute(pathname: string): boolean {
    // Remove locale prefix for checking
    const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '')
    return authRoutes.some(route => pathWithoutLocale.startsWith(route))
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Skip auth callback route
    if (pathname.startsWith('/auth/callback')) {
        return NextResponse.next()
    }

    // Check if pathname already has a locale
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    // Get current locale from path or determine it
    let currentLocale: Locale = defaultLocale
    if (pathnameHasLocale) {
        currentLocale = pathname.split('/')[1] as Locale
    }

    // If no locale in path, redirect to add one
    if (!pathnameHasLocale) {
        const locale = getLocale(request)
        const newUrl = new URL(
            `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
            request.url
        )

        // Preserve query parameters
        request.nextUrl.searchParams.forEach((value, key) => {
            if (key !== 'lang') { // Don't include lang param in URL
                newUrl.searchParams.set(key, value)
            }
        })

        const response = NextResponse.redirect(newUrl)

        // Set or update the locale cookie
        response.cookies.set('NEXT_LOCALE', locale, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: 'lax',
        })

        return response
    }

    // Update Supabase session and get user
    const { supabaseResponse, user } = await updateSession(request)

    // Check authentication for protected routes
    if (isProtectedRoute(pathname)) {
        if (!user) {
            // Redirect to login if not authenticated
            const loginUrl = new URL(`/${currentLocale}/login`, request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }

        const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '')
        // Use database role (secure) - the role is now fetched from profiles table
        // in updateSession() instead of trusting user_metadata
        const role = user.role

        // Redirect /dashboard to role-specific dashboard
        if (pathWithoutLocale === '/dashboard' || pathWithoutLocale === '/dashboard/') {
            const dashboardUrl = new URL(`/${currentLocale}/dashboard/${role}`, request.url)
            return NextResponse.redirect(dashboardUrl)
        }

        // Role-based access control: users can only access their own dashboard
        const dashboardRoleMatch = pathWithoutLocale.match(/^\/dashboard\/(patient|doctor|admin)/)
        if (dashboardRoleMatch) {
            const requestedRole = dashboardRoleMatch[1]
            if (requestedRole !== role) {
                // Redirect to user's own dashboard if trying to access wrong role's dashboard
                const correctDashboardUrl = new URL(`/${currentLocale}/dashboard/${role}`, request.url)
                return NextResponse.redirect(correctDashboardUrl)
            }
        }
    }

    // Redirect authenticated users away from auth pages to dashboard
    if (isAuthRoute(pathname) && user) {
        // Use database role (secure)
        const role = user.role
        const dashboardUrl = new URL(`/${currentLocale}/dashboard/${role}`, request.url)
        return NextResponse.redirect(dashboardUrl)
    }

    // Sync locale cookie
    const existingCookie = request.cookies.get('NEXT_LOCALE')?.value
    if (existingCookie !== currentLocale) {
        supabaseResponse.cookies.set('NEXT_LOCALE', currentLocale, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: 'lax',
        })
    }

    // Add security headers
    supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
    supabaseResponse.headers.set('X-Frame-Options', 'SAMEORIGIN')
    supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block')
    supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    // Allow camera/microphone for video calls (Daily.co handles permissions within its iframe)
    supabaseResponse.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), display-capture=(self), geolocation=()')

    return supabaseResponse
}

export const config = {
    matcher: [
        // Skip all internal paths (_next, api, static files)
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
}
