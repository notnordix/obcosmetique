"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, ShoppingBag } from "lucide-react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart"
import { Cart } from "./cart"
import { LocationMap } from "./location-map"
import type { Locale } from "@/lib/i18n/i18n-config"

// Define a default dictionary to use as fallback
const defaultDictionary = {
  header: {
    brand: "Ob cosmétique",
  },
  cart: {
    title: "Your Cart",
    empty: {
      title: "Your cart is empty",
      description: "Looks like you haven't added any products to your cart yet.",
      cta: "Continue Shopping",
    },
    total: "Total",
    checkout: "Checkout",
    item: "item",
    items: "items",
  },
  location: {
    title: "Our Location",
    marrakech: "Marrakech",
  },
  products: {
    price: "MAD",
  },
}

export function Header({
  lang,
  dictionary = defaultDictionary,
}: {
  lang: Locale
  dictionary: any
}) {
  const pathname = usePathname()
  const isProductPage = pathname.includes("/products/")

  // Replace these lines:
  // const { getItemCount } = useCart()

  // Replace this implementation:
  // const [itemCount, setItemCount] = useState(0)
  // useEffect(() => {
  //   // Update the count after hydration
  //   setItemCount(getItemCount())
  // }, [getItemCount])

  // With this implementation that subscribes to cart changes:
  const [mounted, setMounted] = useState(false)
  const itemCount = useCart((state) => state.getItemCount())

  // Add this effect to handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Scroll detection
  const { scrollY } = useScroll()
  const [visible, setVisible] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 100)
  })

  // Always show white header on product pages
  const showWhiteHeader = visible || isProductPage

  // Safely access dictionary values
  const brandName = dictionary?.header?.brand || "Ob cosmétique"

  return (
    <>
      <motion.header className="fixed top-0 left-0 right-0 z-40 w-full">
        {/* Desktop Navigation */}
        <motion.div
          animate={{
            backdropFilter: showWhiteHeader ? "blur(10px)" : "none",
            boxShadow: showWhiteHeader
              ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
              : "none",
            width: showWhiteHeader ? "75%" : "100%",
            y: showWhiteHeader ? 20 : 0,
            backgroundColor: showWhiteHeader ? "#FFFFFF" : "transparent",
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 50,
          }}
          style={{
            minWidth: "800px",
          }}
          className={cn(
            "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full px-4 py-4 lg:flex",
            showWhiteHeader ? "bg-white/80" : "bg-transparent",
          )}
        >
          {/* Location button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMapOpen(true)}
              className={`flex items-center transition-colors hover:text-[#ba1e29] ${
                showWhiteHeader ? "text-black" : "text-white"
              }`}
              aria-label="Show our location"
            >
              <MapPin className="h-5 w-5" />
            </button>
          </div>

          {/* Logo - centered */}
          <Link href={`/${lang}`} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
            <span className={`font-bold text-2xl ${showWhiteHeader ? "text-black" : "text-white"}`}>Ob cosmétique</span>
          </Link>

          {/* Cart button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsCartOpen(true)}
              className={`flex items-center transition-colors hover:text-[#ba1e29] ${
                showWhiteHeader ? "text-black" : "text-white"
              }`}
              aria-label="Open shopping cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {/* And then update the cart count display to only show after hydration:
              // Replace this line in the JSX:
              <span className="ml-1 text-sm">{itemCount}</span>

              // With this: */}
              <span className="ml-1 text-sm">{mounted ? itemCount : 0}</span>
            </button>
          </div>
        </motion.div>

        {/* Mobile Navigation */}
        <motion.div
          animate={{
            backdropFilter: showWhiteHeader ? "blur(10px)" : "none",
            boxShadow: showWhiteHeader
              ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
              : "none",
            width: showWhiteHeader ? "90%" : "100%",
            paddingRight: showWhiteHeader ? "12px" : "16px",
            paddingLeft: showWhiteHeader ? "12px" : "16px",
            borderRadius: showWhiteHeader ? "4px" : "2rem",
            y: showWhiteHeader ? 20 : 0,
            backgroundColor: showWhiteHeader ? "#FFFFFF" : "transparent",
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 50,
          }}
          className={cn(
            "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between px-0 py-4 lg:hidden",
            showWhiteHeader ? "bg-white/80" : "bg-transparent",
          )}
        >
          <div className="flex w-full flex-row items-center justify-between">
            {/* Mobile Location */}
            <button
              onClick={() => setIsMapOpen(true)}
              className={`flex items-center transition-colors hover:text-[#ba1e29] ${
                showWhiteHeader ? "text-black" : "text-white"
              }`}
              aria-label="Show our location"
            >
              <MapPin className="h-5 w-5" />
            </button>

            {/* Mobile Logo - centered */}
            <Link href={`/${lang}`} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
              <span className={`font-bold text-xl ${showWhiteHeader ? "text-black" : "text-white"}`}>
                Ob cosmétique
              </span>
            </Link>

            {/* Mobile Cart */}
            <div className="flex items-center">
              <button
                onClick={() => setIsCartOpen(true)}
                className={`flex items-center transition-colors hover:text-[#ba1e29] ${
                  showWhiteHeader ? "text-black" : "text-white"
                }`}
                aria-label="Open shopping cart"
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="ml-1 text-sm">{mounted ? itemCount : 0}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.header>

      {/* Cart Modal */}
      <Cart open={isCartOpen} onClose={() => setIsCartOpen(false)} lang={lang} dictionary={dictionary} />

      {/* Location Map Modal */}
      <LocationMap open={isMapOpen} onClose={() => setIsMapOpen(false)} lang={lang} dictionary={dictionary} />
    </>
  )
}
