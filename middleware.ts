import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'ar'] as const
type Locale = typeof locales[number]
const defaultLocale: Locale = 'en'

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

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

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

    // Locale is in path, ensure cookie is synced
    const response = NextResponse.next()
    const existingCookie = request.cookies.get('NEXT_LOCALE')?.value

    // Update cookie if it doesn't match the URL locale
    if (existingCookie !== currentLocale) {
        response.cookies.set('NEXT_LOCALE', currentLocale, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: 'lax',
        })
    }

    return response
}

export const config = {
    matcher: [
        // Skip all internal paths (_next, api, static files)
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
}
