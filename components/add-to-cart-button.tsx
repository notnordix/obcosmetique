"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/lib/cart"
import type { Product } from "@/lib/types"
import { Check, Minus, Plus, ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"
import type { Locale } from "@/lib/i18n/i18n-config"

export function AddToCartButton({ product, lang, dictionary }: { product: Product; lang: Locale; dictionary: any }) {
  // Get translated product data if available
  const productName = product.translations?.[lang]?.name || product.name
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1)
    setAdded(false)
  }, [product.id])

  const handleAddToCart = () => {
    addItem(product, quantity)
    setAdded(true)

    // Reset after showing success state
    setTimeout(() => {
      setAdded(false)
    }, 2000)
  }

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 10)) // Max 10 items
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1)) // Min 1 item
  }

  // Set text direction based on language
  const textDirection = lang === "ar" ? "rtl" : "ltr"

  return (
    <div className="space-y-4" style={{ direction: textDirection }}>
      {/* Quantity selector */}
      <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-2">
        <span className="pl-3 text-sm font-medium text-neutral-700">{dictionary.product.quantity}</span>
        <div className="flex items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </motion.button>

          <motion.span
            key={quantity}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-10 text-center font-medium"
            aria-live="polite"
            aria-atomic="true"
          >
            {quantity}
          </motion.span>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={incrementQuantity}
            disabled={quantity >= 10}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Add to cart button with smoother animations */}
      <motion.div className="relative h-14 overflow-hidden rounded-lg">
        <motion.button
          onClick={handleAddToCart}
          disabled={added}
          className={`relative flex h-14 w-full items-center justify-center overflow-hidden rounded-lg text-white transition-colors ${
            added ? "bg-green-600" : "bg-[#ba1e29] hover:bg-[#a01824]"
          }`}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          aria-live="polite"
          aria-label={
            added
              ? dictionary.product.addedToCart
              : `${dictionary.product.addToCart}${quantity > 1 ? ` (${quantity})` : ""}`
          }
        >
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={false}
            animate={{
              opacity: added ? 1 : 0,
              y: added ? 0 : 20,
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Check className="mr-2 h-5 w-5" />
            <span className="font-medium">{dictionary.product.addedToCart}</span>
          </motion.div>

          <motion.div
            className="flex items-center"
            initial={false}
            animate={{
              opacity: added ? 0 : 1,
              y: added ? -20 : 0,
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            <span className="font-medium">{dictionary.product.addToCart}</span>
            {quantity > 1 && (
              <motion.span
                className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={quantity}
              >
                {quantity}
              </motion.span>
            )}
          </motion.div>
        </motion.button>
      </motion.div>
    </div>
  )
}
