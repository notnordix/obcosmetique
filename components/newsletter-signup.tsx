"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, CheckCircle, Mail, Star } from "lucide-react"
import { motion } from "framer-motion"
import type { Locale } from "@/lib/i18n/i18n-config"

export function NewsletterSignup({ lang, dictionary }: { lang: Locale; dictionary: any }) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Please enter your email address")
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    try {
      // Use the API route instead of direct function call
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSubmitting(false)
        setIsSuccess(true)
        setEmail("")

        // Reset success message after 5 seconds
        setTimeout(() => {
          setIsSuccess(false)
        }, 5000)
      } else {
        throw new Error(data.message || "Failed to subscribe")
      }
    } catch (error: any) {
      console.error("Error subscribing:", error)
      setError(error.message || "An error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Set text direction based on language
  const textDirection = lang === "ar" ? "rtl" : "ltr"

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl">
      {/* Background elements */}
      <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-[#ba1e29]/5"></div>
      <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-[#ba1e29]/5"></div>
      <div className="absolute bottom-10 left-10 h-16 w-16 rounded-full bg-[#ba1e29]/5"></div>

      {/* Decorative elements */}
      <div className="absolute right-10 top-10 opacity-10">
        <Star className="h-20 w-20 text-[#ba1e29]" fill="#ba1e29" />
      </div>
      <div className="absolute -bottom-2 left-1/4 opacity-5">
        <Star className="h-16 w-16 text-[#ba1e29]" fill="#ba1e29" />
      </div>

      <div
        className="relative z-10 grid gap-4 p-4 md:grid-cols-2 md:gap-12 md:p-12"
        style={{ direction: textDirection }}
      >
        {/* Left column - Content - SIMPLIFIED FOR MOBILE */}
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-3 md:mb-4 inline-flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#ba1e29] to-[#e85d69]"
          >
            <Mail className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-2 md:mb-3 text-2xl md:text-3xl font-bold text-neutral-800"
          >
            {dictionary.newsletter.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-4 md:mb-6 text-sm md:text-base text-neutral-600"
          >
            {/* Shorter text for mobile */}
            <span className="md:hidden">{dictionary.newsletter.shortDescription}</span>
            {/* Full text for desktop */}
            <span className="hidden md:inline">{dictionary.newsletter.description}</span>
          </motion.p>

          {/* Benefits - HIDDEN ON MOBILE, VISIBLE ON DESKTOP */}
          <div className="hidden md:block space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center space-x-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ba1e29]/10">
                <CheckCircle className="h-4 w-4 text-[#ba1e29]" />
              </div>
              <p className="text-sm text-neutral-700">{dictionary.newsletter.benefits.offers}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center space-x-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ba1e29]/10">
                <CheckCircle className="h-4 w-4 text-[#ba1e29]" />
              </div>
              <p className="text-sm text-neutral-700">{dictionary.newsletter.benefits.recommendations}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center space-x-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ba1e29]/10">
                <CheckCircle className="h-4 w-4 text-[#ba1e29]" />
              </div>
              <p className="text-sm text-neutral-700">{dictionary.newsletter.benefits.guides}</p>
            </motion.div>
          </div>
        </div>

        {/* Right column - Form - SIMPLIFIED FOR MOBILE */}
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-white p-0 md:p-6 md:shadow-sm"
          >
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-6 text-center"
              >
                <div className="mb-3 md:mb-4 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200">
                  <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                </div>
                <h3 className="mb-2 text-lg md:text-xl font-medium text-neutral-800">
                  {dictionary.newsletter.success.title}
                </h3>
                <p className="text-sm md:text-base text-neutral-600">{dictionary.newsletter.success.message}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div className="text-center">
                  <h3 className="mb-3 md:mb-4 text-lg md:text-xl font-medium text-neutral-800">
                    {dictionary.newsletter.form.title}
                  </h3>

                  <div className="mb-1">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={dictionary.newsletter.form.placeholder}
                      className={`h-10 md:h-12 border-neutral-200 bg-neutral-50 text-center placeholder:text-neutral-400 ${
                        error ? "border-red-300" : ""
                      }`}
                      required
                    />
                    {error && <p className="mt-1 text-center text-xs text-red-500">{error}</p>}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="group h-10 md:h-12 w-full bg-gradient-to-r from-[#ba1e29] to-[#e85d69] text-white hover:from-[#a01824] hover:to-[#d14956]"
                  disabled={isSubmitting}
                  aria-label="Subscribe to newsletter"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {dictionary.newsletter.form.subscribing}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      {dictionary.newsletter.form.button}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>

                <p className="text-center text-xs text-neutral-500">{dictionary.newsletter.form.privacy}</p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
