"use client"

import Link from "next/link"
import { Instagram, Facebook, Globe } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { Locale } from "@/lib/i18n/i18n-config"
import { setCookie } from "cookies-next"

type Language = {
  code: string
  name: string
  native: string
}

const languages: Language[] = [
  { code: "en", name: "English", native: "English" },
  { code: "fr", name: "French", native: "Français" },
  { code: "ar", name: "Arabic", native: "العربية" },
]

// Define a default dictionary to use as fallback
const defaultDictionary = {
  header: {
    brand: "Ob cosmétique",
  },
  footer: {
    tagline: "Premium natural cosmetics",
    copyright: "All rights reserved.",
  },
}

export function Footer({
  lang,
  dictionary = defaultDictionary,
}: {
  lang: Locale
  dictionary: any
}) {
  const currentYear = new Date().getFullYear()
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    languages.find((l) => l.code === lang) || languages[0],
  )
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleLanguageDropdown = () => {
    setIsLanguageOpen(!isLanguageOpen)
  }

  const selectLanguage = (language: Language) => {
    setCurrentLanguage(language)
    setIsLanguageOpen(false)

    // Get the current path without the language prefix
    const pathWithoutLang = pathname.replace(/^\/[^/]+/, "")

    // Save the language preference in a cookie
    setCookie("NEXT_LOCALE", language.code, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    })

    // Navigate to the same page but with the new language
    router.push(`/${language.code}${pathWithoutLang}`)
  }

  // Safely access dictionary values
  const brandName = dictionary?.header?.brand || "Ob cosmétique"
  const tagline = dictionary?.footer?.tagline || "Premium natural cosmetics"
  const copyright = dictionary?.footer?.copyright || "All rights reserved."

  return (
    <footer className="bg-[#ba1e29] py-12 text-white">
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Social Media Icons - Left on desktop */}
          <div className="flex order-2 md:order-1 space-x-4 justify-center md:justify-start">
            {[
              { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/centre_oumaima_bouzaher/" },
              { icon: Facebook, label: "Facebook", href: "https://web.facebook.com/profile.php?id=100027554776873" },
            ].map((social) => (
              <Link
                key={social.label}
                href={social.href}
                className="rounded-full p-2 text-white/90 transition-colors hover:bg-white/10"
                aria-label={`Follow us on ${social.label}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <social.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>

          {/* Brand - Centered */}
          <div className="text-center order-1 md:order-2">
            <Link href={`/${lang}`} className="text-2xl font-bold text-white">
              Ob cosmétique
            </Link>
            <p className="mt-2 text-sm text-white/80">{tagline}</p>
          </div>

          {/* Language Switcher - Right on desktop */}
          <div className="order-3 relative" ref={dropdownRef}>
            <button
              onClick={toggleLanguageDropdown}
              className="flex items-center space-x-2 rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
              aria-expanded={isLanguageOpen}
              aria-haspopup="true"
            >
              <Globe className="h-4 w-4 mr-2" />
              <span>{currentLanguage.native}</span>
              <svg
                className={`h-4 w-4 transition-transform ${isLanguageOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isLanguageOpen && (
              <div className="absolute bottom-full mb-2 right-0 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => selectLanguage(language)}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        currentLanguage.code === language.code
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      role="menuitem"
                    >
                      {language.native} ({language.name})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-white/80">
          &copy; {currentYear} {brandName}. {copyright}
        </div>
      </div>
    </footer>
  )
}
