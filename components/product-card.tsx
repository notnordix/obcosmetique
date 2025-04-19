"use client"

import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"
import { Lens } from "./ui/lens"
import type { Locale } from "@/lib/i18n/i18n-config"

export function ProductCard({ product, lang, dictionary }: { product: Product; lang: Locale; dictionary: any }) {
  // Get translated product data if available
  const productName = product.translations?.[lang]?.name || product.name
  const productDescription = product.translations?.[lang]?.description || product.description || ""

  // Truncate description to 80 characters for all screen sizes
  const truncatedDescription =
    productDescription.length > 80 ? `${productDescription.substring(0, 80)}...` : productDescription

  return (
    <Link
      href={`/${lang}/products/${product.slug}`}
      className="card group relative h-[250px] w-[160px] sm:h-[300px] sm:w-[180px] md:h-[340px] md:w-[230px] lg:h-[350px] lg:w-[240px] overflow-hidden rounded-[20px] border border-neutral-200 bg-white p-0 transition-all duration-500 hover:-translate-y-2 hover:border-[#ba1e29]/20 hover:shadow-lg"
      aria-label={`View ${productName} - ${product.price.toFixed(2)} ${dictionary.products.price}`}
    >
      {/* Shine effect */}
      <div className="card__shine absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:animate-shine group-hover:opacity-100" />

      {/* Glow effect */}
      <div className="card__glow absolute -inset-[10px] bg-radial-gradient-purple opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="card__content relative z-[2] flex h-full flex-col gap-1 sm:gap-2 p-3 sm:p-4 md:p-5 lg:p-6">
        {/* Badge */}
        <div className="card__badge absolute right-2 top-2 sm:right-3 sm:top-3 z-10 scale-80 rounded-full bg-[#ba1e29] px-2 py-1 text-[0.6em] sm:text-[0.7em] md:text-[0.75em] font-semibold text-white opacity-0 transition-all duration-400 delay-100 group-hover:scale-100 group-hover:opacity-100">
          {dictionary.products.premiumQuality}
        </div>

        {/* Image with lens effect */}
        <Lens>
          <div className="card__image relative h-[110px] sm:h-[140px] md:h-[170px] lg:h-[180px] w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#8b5cf6] transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-[1.03] group-hover:shadow-md">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={productName}
              fill
              sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 230px, 240px"
              className="object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1)_0%,transparent_30%),repeating-linear-gradient(45deg,rgba(139,92,246,0.1)_0px,rgba(139,92,246,0.1)_2px,transparent_2px,transparent_4px)] opacity-50" />
          </div>
        </Lens>

        {/* Text content */}
        <div className="card__text flex h-[60px] sm:h-[80px] md:h-[90px] flex-col gap-1 overflow-hidden mt-2">
          <h3 className="card__title m-0 truncate text-[0.85em] sm:text-[0.95em] md:text-[1.1em] lg:text-[1.15em] font-bold text-neutral-800 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#ba1e29]">
            {productName}
          </h3>
          <p className="card__description m-0 line-clamp-3 text-[0.65em] sm:text-[0.7em] md:text-[0.75em] lg:text-[0.8em] text-neutral-600 opacity-70 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
            {truncatedDescription}
          </p>
        </div>

        {/* Footer */}
        <div className="card__footer mt-auto flex items-center justify-between">
          <div className="card__price text-[0.8em] sm:text-[0.85em] md:text-[0.95em] lg:text-[1em] font-bold text-neutral-800 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#ba1e29]">
            {product.price.toFixed(2)} {dictionary.products.price}
          </div>
        </div>
      </div>
    </Link>
  )
}
