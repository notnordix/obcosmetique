import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { i18n } from "./lib/i18n/i18n-config"
import { match as matchLocale } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"

function getLocale(request: NextRequest): string {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  // Use negotiator and intl-localematcher to get best locale
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages()

  // Ensure we have at least one language in case the headers are missing
  if (!languages || languages.length === 0) {
    languages = [i18n.defaultLocale]
  }

  // Get supported locales
  const locales: string[] = [...i18n.locales]

  try {
    // Try to match the user's preferred language with our supported locales
    const matchedLocale = matchLocale(languages, locales, i18n.defaultLocale)
    return matchedLocale
  } catch (error) {
    console.error("Error matching locale:", error)
    return i18n.defaultLocale
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for static assets, API routes, and admin routes
  if (
    pathname.startsWith("/_next") ||
    pathname.includes("/api/") ||
    pathname.includes(".") || // Skip files with extensions like .jpg, .png, etc.
    pathname.startsWith("/admin") // Skip admin routes
  ) {
    return NextResponse.next()
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = [...i18n.locales].every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    // Get the preferred locale based on the user's browser settings
    const locale = getLocale(request)

    // Store the detected locale in a cookie for future visits
    const response = NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`, request.url),
    )

    // Set a cookie to remember the user's language preference
    response.cookies.set("NEXT_LOCALE", locale, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    })

    return response
  }

  return NextResponse.next()
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
