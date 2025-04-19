import type { Product } from "@/lib/types"
import { ProductCard } from "./product-card"
import { PackageOpen } from "lucide-react"
import type { Locale } from "@/lib/i18n/i18n-config"

export function MoreProducts({ products, lang, dictionary }: { products: Product[]; lang: Locale; dictionary: any }) {
  if (!products || products.length === 0) {
    return (
      <section aria-labelledby="no-related-products" className="py-8">
        <h2 id="no-related-products" className="sr-only">
          No related products
        </h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 rounded-full bg-neutral-100 p-4">
            <PackageOpen className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-neutral-700">{dictionary.product.notFound.title}</h3>
          <p className="text-neutral-500">{dictionary.product.notFound.description}</p>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="related-products-heading">
      <h2 id="related-products-heading" className="sr-only">
        Related products
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-center">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} lang={lang} dictionary={dictionary} />
        ))}
      </div>
    </section>
  )
}
