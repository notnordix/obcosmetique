import type React from "react"
import { Assistant } from "next/font/google"
import { i18n, type Locale } from "@/lib/i18n/i18n-config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import "../globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { cookies } from "next/headers"

// Import Assistant font
const assistant = Assistant({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-assistant",
  display: "swap",
})

// Update the metadata to be more dynamic based on language
export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }) {
  // Unwrap params using await
  const { lang } = await params

  const dictionary = await getDictionary(lang)

  return {
    title: `Ob cosmétique - ${dictionary.meta?.title || "Premium Natural Cosmetics"}`,
    description:
      dictionary.meta?.description ||
      "Discover our collection of premium natural cosmetics made with organic ingredients for radiant, healthy skin.",
    keywords:
      dictionary.meta?.keywords || "cosmetics, natural cosmetics, organic skincare, beauty products, Ob cosmétique",
    authors: [{ name: "Ob cosmétique" }],
    openGraph: {
      title: `Ob cosmétique - ${dictionary.meta?.title || "Premium Natural Cosmetics"}`,
      description:
        dictionary.meta?.description ||
        "Discover our collection of premium natural cosmetics made with organic ingredients for radiant, healthy skin.",
      url: "https://obcosmetique.com",
      siteName: "Ob cosmétique",
      images: [
        {
          url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2187&auto=format&fit=crop",
          width: 1200,
          height: 630,
          alt: `Ob cosmétique - ${dictionary.meta?.imageAlt || "Premium Natural Cosmetics"}`,
        },
      ],
      locale: lang === "fr" ? "fr_FR" : lang === "ar" ? "ar_MA" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Ob cosmétique - ${dictionary.meta?.title || "Premium Natural Cosmetics"}`,
      description:
        dictionary.meta?.description ||
        "Discover our collection of premium natural cosmetics made with organic ingredients for radiant, healthy skin.",
      images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2187&auto=format&fit=crop"],
    },
    alternates: {
      canonical: `https://obcosmetique.com/${lang}`,
      languages: {
        en: "https://obcosmetique.com/en",
        fr: "https://obcosmetique.com/fr",
        ar: "https://obcosmetique.com/ar",
      },
    },
    icons: {
      icon: "/favicon.ico",
    },
  }
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: Locale }>
}>) {
  // Unwrap params using await
  const { lang } = await params

  // Get the stored language preference from cookies
  const cookieStore = await cookies()
  const storedLocale = cookieStore.get("NEXT_LOCALE")?.value

  // Use the URL param language or fall back to stored preference or default
  const activeLocale = lang || storedLocale || i18n.defaultLocale

  // Fetch the dictionary based on the language parameter
  const dictionary = await getDictionary(activeLocale as Locale)

  // Set the direction based on the language
  const dir = activeLocale === "ar" ? "rtl" : "ltr"

  return (
    <html lang={activeLocale} dir={dir} className={assistant.variable}>
      <body className="font-assistant">
        {/* Pass the dictionary as a serializable prop */}
        <Header lang={activeLocale as Locale} dictionary={dictionary} />
        {children}
        <Footer lang={activeLocale as Locale} dictionary={dictionary} />
      </body>
    </html>
  )
}
