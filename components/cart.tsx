"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart"
import { CheckoutForm } from "./checkout-form"
import type { Locale } from "@/lib/i18n/i18n-config"

export function Cart({
  open,
  onClose,
  lang,
  dictionary,
}: { open: boolean; onClose: () => void; lang: Locale; dictionary: any }) {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCart()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId: string) => {
    removeItem(productId)
  }

  const handleCheckout = () => {
    setIsCheckoutOpen(true)
    onClose() // Close the cart when opening checkout
  }

  // Set text direction based on language
  const textDirection = lang === "ar" ? "rtl" : "ltr"

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-md p-5" style={{ direction: textDirection }}>
          <DialogHeader className="pb-3">
            <DialogTitle className="text-xl">{dictionary.cart.title}</DialogTitle>
          </DialogHeader>

          <div className="flex h-full max-h-[60vh] flex-col">
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-8">
                <div className="mb-4 rounded-full bg-neutral-100 p-4">
                  <ShoppingBag className="h-8 w-8 text-neutral-400" />
                </div>
                <p className="mb-2 text-center font-medium text-neutral-700">{dictionary.cart.empty.title}</p>
                <p className="mb-4 text-center text-sm text-neutral-500">{dictionary.cart.empty.description}</p>
                <Button onClick={onClose} className="mt-2 bg-[#ba1e29] text-white hover:bg-[#a01824]">
                  {dictionary.cart.empty.cta}
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto pr-2">
                  {items.map((item) => {
                    // Get translated product name if available
                    const productName = item.product.translations?.[lang]?.name || item.product.name

                    return (
                      <div key={item.product.id} className="flex items-start gap-4 border-b py-4">
                        <div className="relative h-20 w-20 overflow-hidden rounded-md">
                          <Image
                            src={item.product.image || "/placeholder.svg"}
                            alt={productName}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex flex-1 flex-col">
                          <Link
                            href={`/${lang}/products/${item.product.slug}`}
                            className="font-medium hover:text-[#ba1e29]"
                            onClick={onClose}
                          >
                            {productName}
                          </Link>

                          <span className="mt-1 text-sm text-[#ba1e29]">
                            {item.product.price.toFixed(2)} {dictionary.products.price}
                          </span>

                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center rounded-md border">
                              <button
                                onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                className="p-1 px-2 hover:bg-muted"
                                aria-label={`Decrease quantity of ${productName}`}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>

                              <span className="px-2 text-sm" aria-live="polite">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                className="p-1 px-2 hover:bg-muted"
                                aria-label={`Increase quantity of ${productName}`}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item.product.id)}
                              className="text-muted-foreground hover:text-destructive"
                              aria-label={`Remove ${productName} from cart`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-auto space-y-4 pt-4">
                  <div className="flex items-center justify-between border-t border-b py-3">
                    <span className="font-medium">{dictionary.cart.total}</span>
                    <span className="font-bold" aria-live="polite">
                      {getTotal().toFixed(2)} {dictionary.products.price}
                    </span>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="h-11 w-full bg-[#ba1e29] text-base hover:bg-[#a01824]"
                    aria-label={`${dictionary.cart.checkout} (${getItemCount()} ${getItemCount() === 1 ? dictionary.cart.item : dictionary.cart.items})`}
                  >
                    {dictionary.cart.checkout} ({getItemCount()}{" "}
                    {getItemCount() === 1 ? dictionary.cart.item : dictionary.cart.items})
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {isCheckoutOpen && (
        <CheckoutForm
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          lang={lang}
          dictionary={dictionary}
        />
      )}
    </>
  )
}
