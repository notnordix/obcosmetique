"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useCart } from "@/lib/cart"
import type { Locale } from "@/lib/i18n/i18n-config"
// Update the import at the top of the file
import { createOrder } from "@/lib/db-server"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

// Remove the import for sendOrderNotification since we'll use the API route instead
// import { sendOrderNotification } from "@/lib/email"

type FormData = {
  name: string
  email: string
  phone: string
  city: string
  address: string
}

type FormErrors = {
  [K in keyof FormData]?: string
}

export function CheckoutForm({
  isOpen,
  onClose,
  lang,
  dictionary,
}: {
  isOpen: boolean
  onClose: () => void
  lang: Locale
  dictionary: any
}) {
  const { items, getTotal, clearCart } = useCart()

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\+?[0-9\s-]{8,}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Create order object that matches the structure in the admin dashboard
      const orderData = {
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        total: getTotal(),
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      }

      // Save order to database
      const orderId = await createOrder(orderData)

      if (orderId) {
        // Send email notification with order details
        // Update the email notification part in the handleSubmit function:
        // Replace the sendOrderNotification code with this:

        // Send email notification with order details
        try {
          // Create a notification-friendly order object with product names
          const notificationOrderData = {
            id: orderId,
            customerName: formData.name,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            address: formData.address,
            total: getTotal(),
            items: items.map((item) => ({
              productName: item.product.translations?.[lang]?.name || item.product.name,
              quantity: item.quantity,
              price: item.product.price,
            })),
          }

          // Send the notification email via API route (don't wait for it to complete)
          fetch("/api/orders/notify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(notificationOrderData),
          }).catch((error) => {
            console.error("Failed to send order notification request:", error)
            // Don't show error to user as this is a background task
          })
        } catch (emailError) {
          // Log error but don't affect the user experience
          console.error("Error preparing email notification:", emailError)
        }

        setIsSubmitting(false)
        setIsSuccess(true)

        // Reset form and clear cart after success
        setTimeout(() => {
          clearCart()
          setIsSuccess(false)
          setFormData({
            name: "",
            email: "",
            phone: "",
            city: "",
            address: "",
          })
          onClose()
        }, 2000)
      } else {
        throw new Error("Failed to create order")
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when field is edited
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  // Set text direction based on language
  const textDirection = lang === "ar" ? "rtl" : "ltr"

  // Calculate total items with translated names for display
  const totalItems = items.reduce((total, item) => {
    // Get translated product name
    const productName = item.product.translations?.[lang]?.name || item.product.name
    return total + item.quantity
  }, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-5 sm:max-w-md" style={{ direction: textDirection }}>
        <DialogTitle className="text-xl font-bold mb-3">{dictionary.checkout.title}</DialogTitle>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center" aria-live="polite">
            <div className="mb-3 rounded-full bg-green-100 p-3 text-green-600" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">{dictionary.checkout.success.title}</h3>
            <p className="mt-2 text-sm text-neutral-600">{dictionary.checkout.success.message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name" className="text-sm">
                  {dictionary.checkout.form.name}
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`h-10 ${errors.name ? "border-red-500" : ""}`}
                  aria-invalid={errors.name ? "true" : "false"}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p className="text-xs text-red-500" id="name-error">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm">
                  {dictionary.checkout.form.email}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`h-10 ${errors.email ? "border-red-500" : ""}`}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p className="text-xs text-red-500" id="email-error">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone" className="text-sm">
                  {dictionary.checkout.form.phone}
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`h-10 ${errors.phone ? "border-red-500" : ""}`}
                  aria-invalid={errors.phone ? "true" : "false"}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500" id="phone-error">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="city" className="text-sm">
                  {dictionary.checkout.form.city}
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`h-10 ${errors.city ? "border-red-500" : ""}`}
                  aria-invalid={errors.city ? "true" : "false"}
                  aria-describedby={errors.city ? "city-error" : undefined}
                />
                {errors.city && (
                  <p className="text-xs text-red-500" id="city-error">
                    {errors.city}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="text-sm">
                {dictionary.checkout.form.address}
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`h-10 ${errors.address ? "border-red-500" : ""}`}
                aria-invalid={errors.address ? "true" : "false"}
                aria-describedby={errors.address ? "address-error" : undefined}
              />
              {errors.address && (
                <p className="text-xs text-red-500" id="address-error">
                  {errors.address}
                </p>
              )}
            </div>

            <div className="mt-3 border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{dictionary.checkout.form.totalItems}:</span>
                <span className="text-sm">{totalItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{dictionary.checkout.form.total}:</span>
                <span className="text-sm font-bold">
                  {getTotal().toFixed(2)} {dictionary.products.price}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              className="mt-3 h-11 w-full bg-[#ba1e29] text-base hover:bg-[#a01824]"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? dictionary.checkout.form.processing : dictionary.checkout.form.submit}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
