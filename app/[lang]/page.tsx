"use client"

import { useEffect, useState } from "react"
import { use } from "react" // Add this import
import { ProductCard } from "@/components/product-card"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { HeroSection } from "@/components/hero-section"
import Script from "next/script"
import { PackageOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import type { Locale } from "@/lib/i18n/i18n-config"
import { ViewCounter } from "@/components/view-counter"
import type { Product } from "@/lib/types"

export default function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  // Unwrap params using React.use()
  const { lang } = use(params)

  const [dictionary, setDictionary] = useState<any>(null)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dictionary
        const dict = await getDictionary(lang)
        setDictionary(dict)

        // Fetch products
        const response = await fetch(`/api/products?lang=${lang}`)
        const data = await response.json()
        setFeaturedProducts(data.products || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [lang])

  if (loading || !dictionary) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-[#ba1e29]"></div>
      </div>
    )
  }

  // Update the structured data to include product information
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ob cosmétique",
    url: `https://obcosmetique.com/${lang}`,
    potentialAction: {
      "@type": "SearchAction",
      target: `https://obcosmetique.com/${lang}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }

  // Create organization structured data
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ob cosmétique",
    url: `https://obcosmetique.com/${lang}`,
    logo: "https://obcosmetique.com/logo.png",
    sameAs: [
      "https://www.facebook.com/obcosmetique",
      "https://www.instagram.com/obcosmetique",
      "https://twitter.com/obcosmetique",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bureau N° 1 mosquee Khaled Bnou Alwalid lot assanawbar",
      addressLocality: "Marrakech",
      addressRegion: "Marrakech-Safi",
      postalCode: "40000",
      addressCountry: "MA",
    },
  }

  // Add product list structured data
  const productListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: featuredProducts.map((product, index) => {
      const productName = product.translations?.[lang]?.name || product.name
      const productDescription = product.translations?.[lang]?.description || product.description || ""

      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: productName,
          description: productDescription,
          image: product.image,
          url: `https://obcosmetique.com/${lang}/products/${product.slug}`,
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "MAD",
            availability: "https://schema.org/InStock",
          },
        },
      }
    }),
  }

  return (
    <>
      <Script id="website-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      <Script id="organization-structured-data" type="application/ld+json">
        {JSON.stringify(organizationData)}
      </Script>
      <Script id="product-list-structured-data" type="application/ld+json">
        {JSON.stringify(productListData)}
      </Script>
      <main className="flex min-h-screen flex-col">
        {/* Hero Section */}
        <HeroSection lang={lang} dictionary={dictionary} />

        {/* Products Showcase */}
        <section id="products" className="bg-neutral-50 py-12 sm:py-16">
          <div className="mx-auto w-full max-w-6xl px-4">
            <h2 className="mb-8 text-center text-2xl font-bold sm:mb-12 sm:text-3xl">
              {dictionary?.products?.title || "Featured Products"}
            </h2>

            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-4 justify-items-center">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} lang={lang} dictionary={dictionary} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-neutral-100 p-4">
                  <PackageOpen className="h-10 w-10 text-neutral-400" />
                </div>
                <h3 className="mb-2 text-xl font-medium text-neutral-800">
                  {dictionary?.products?.empty?.title || "No Products Available"}
                </h3>
                <p className="mb-6 max-w-md text-neutral-600">
                  {dictionary?.products?.empty?.description ||
                    "We're currently updating our product catalog. Please check back soon for our latest collection of premium cosmetics."}
                </p>
                <Button
                  className="bg-[#ba1e29] hover:bg-[#a01824]"
                  onClick={() => {
                    document.getElementById("newsletter")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  {dictionary?.products?.empty?.cta || "Join Our Newsletter"}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Signup Section */}
        <section id="newsletter" className="bg-neutral-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <NewsletterSignup lang={lang} dictionary={dictionary} />
          </div>
        </section>
        <div className="py-4 flex justify-center">
          <ViewCounter />
        </div>
      </main>
    </>
  )
}
