import { getProducts } from "@/lib/products-db"
import { i18n } from "@/lib/i18n/i18n-config"

export default async function sitemap() {
  const baseUrl = "https://obcosmetique.com"

  // Get products from database
  const products = await getProducts()

  // Generate home pages for each language
  const homePages = i18n.locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
  }))

  // Generate product pages for each language
  const productPages = products.flatMap((product) =>
    i18n.locales.map((locale) => ({
      url: `${baseUrl}/${locale}/products/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    })),
  )

  return [...homePages, ...productPages]
}
