"use client"

import { useEffect, useState } from "react"
import { use } from "react" // Add this import
import { useRouter } from "next/navigation"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { MoreProducts } from "@/components/more-products"
import { Check, Truck } from "lucide-react"
import Script from "next/script"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import type { Locale } from "@/lib/i18n/i18n-config"
import type { Product } from "@/lib/types"

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; lang: Locale }>
}) {
  // Unwrap params using React.use()
  const { slug, lang } = use(params)

  const router = useRouter()
  const [dictionary, setDictionary] = useState<any>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dictionary
        const dict = await getDictionary(lang)
        setDictionary(dict)

        // Fetch product and related products
        const response = await fetch(`/api/products/${slug}?lang=${lang}`)

        if (!response.ok) {
          if (response.status === 404) {
            router.push(`/${lang}/products/not-found`)
            return
          }
          throw new Error("Failed to fetch product")
        }

        const data = await response.json()
        setProduct(data.product)
        setRelatedProducts(data.relatedProducts || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        router.push(`/${lang}/products/not-found`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [lang, slug, router])

  if (loading || !dictionary || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-[#ba1e29]"></div>
      </div>
    )
  }

  // Get translated product data if available
  const productName = product.translations?.[lang]?.name || product.name
  const productDescription = product.translations?.[lang]?.description || product.description
  const productFullDescription = product.translations?.[lang]?.fullDescription || product.fullDescription
  const productIngredients = product.translations?.[lang]?.ingredients || product.ingredients || []

  // Ensure we have images - combine main image with additional images
  const allImages = [product.image]
  if (product.images && product.images.length > 0) {
    allImages.push(...product.images)
  }

  // Create structured data for product
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    description: productDescription,
    image: allImages,
    sku: product.id,
    mpn: product.id,
    brand: {
      "@type": "Brand",
      name: "Ob cosmétique",
    },
    offers: {
      "@type": "Offer",
      url: `https://obcosmetique.com/${lang}/products/${product.slug}`,
      price: product.price,
      priceCurrency: "MAD",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Ob cosmétique",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "27",
    },
    review: {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
      },
      author: {
        "@type": "Person",
        name: "Beauty Expert",
      },
      reviewBody: "This product is amazing for all skin types. The natural ingredients make a real difference.",
    },
  }

  return (
    <>
      <Script id="product-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      <main className="mx-auto max-w-6xl px-4 pt-32 pb-16 md:pt-36">
        <div className="mb-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Left column - Product images */}
            <div className="md:sticky md:top-24 md:self-start">
              <ProductImageGallery images={allImages} productName={productName} />
            </div>

            {/* Right column - Product info with improved layout */}
            <div className="flex flex-col">
              {/* Product header */}
              <div className="mb-6">
                <div className="mb-2 flex items-center">
                  <span className="rounded-full bg-[#ba1e29]/10 px-3 py-1 text-xs font-medium text-[#ba1e29]">
                    {dictionary.products.premiumQuality}
                  </span>
                </div>

                <h1 className="mb-2 text-3xl font-bold">{productName}</h1>
                <p className="text-2xl font-medium text-[#ba1e29]">
                  {product.price.toFixed(2)} {dictionary.products.price}
                </p>
              </div>

              {/* Product ingredients */}
              <div className="mb-6 rounded-lg border border-neutral-200 p-4">
                <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-neutral-500">
                  {dictionary.product.highlights}
                </h2>
                <ul className="space-y-2">
                  {productIngredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      <span className="text-sm">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Product description */}
              <div className="mb-8">
                <div className="mb-4">
                  <h2 className="mb-3 text-lg font-medium">{dictionary.product.about}</h2>
                  <p className="text-neutral-600">{productDescription}</p>
                </div>

                <div className="rounded-lg bg-neutral-50 p-5">
                  <div className="prose text-sm text-neutral-600">
                    <p>{productFullDescription}</p>
                  </div>
                </div>
              </div>

              {/* Shipping info - Updated with greener icon */}
              <div className="mb-8 flex items-center rounded-lg border border-neutral-200 p-4 text-sm">
                <div className="mr-4 rounded-full bg-green-100 p-2">
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{dictionary.product.shipping}</p>
                  <p className="text-neutral-500">{dictionary.product.shippingInfo}</p>
                </div>
              </div>

              {/* Add to cart button */}
              <div className="mt-auto">
                <AddToCartButton product={product} lang={lang} dictionary={dictionary} />
              </div>
            </div>
          </div>
        </div>

        {/* More Products Section */}
        <div className="border-t pt-12">
          <h2 className="mb-8 text-center text-2xl font-bold">{dictionary.product.relatedTitle}</h2>
          <MoreProducts products={relatedProducts} lang={lang} dictionary={dictionary} />
        </div>
      </main>
    </>
  )
}
