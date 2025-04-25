"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowDown, Star } from "lucide-react"
import type { Locale } from "@/lib/i18n/i18n-config"

export function HeroSection({ lang, dictionary }: { lang: Locale; dictionary: any }) {
  const productsRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Find the products section when component mounts
    productsRef.current = document.getElementById("products")
  }, [])

  const scrollToProducts = () => {
    if (productsRef.current) {
      productsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  // Staggered animation for text elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  }

  // Adjust text direction for Arabic
  const textDirection = lang === "ar" ? "rtl" : "ltr"

  // Handle the title differently based on language
  const renderTitle = () => {
    // For English, we want to highlight the word "Natural"
    if (lang === "en") {
      return (
        <>
          Reveal Your <motion.span className="text-[#ba1e29]">Natural</motion.span> Beauty
        </>
      )
    }
    // For French, we want to highlight "Naturelle"
    else if (lang === "fr") {
      return (
        <>
          Révélez Votre Beauté <motion.span className="text-[#ba1e29]">Naturelle</motion.span>
        </>
      )
    }
    // For Arabic, we want to highlight the Arabic word for "Natural"
    else if (lang === "ar") {
      return (
        <>
          اكشفي عن جما��ك <motion.span className="text-[#ba1e29]">الطبيعي</motion.span>
        </>
      )
    }
    // Fallback to the full title from dictionary
    else {
      return dictionary.hero.title
    }
  }

  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      {/* Background image with parallax effect */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src="/hero-image.jpg"
          alt="Ob cosmétique hero image showing natural cosmetic products"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Gradient overlay with animated opacity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"
      ></motion.div>

      {/* Animated decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated circles */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: "10%", y: "5%" }}
          animate={{ opacity: 0.2, scale: 1, x: "0%", y: "0%" }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute -right-20 top-20 h-60 w-60 rounded-full bg-[#ba1e29]/30 blur-3xl"
          aria-hidden="true"
        ></motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: "-10%", y: "5%" }}
          animate={{ opacity: 0.15, scale: 1, x: "0%", y: "0%" }}
          transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
          className="absolute bottom-20 left-10 h-80 w-80 rounded-full bg-[#ba1e29]/20 blur-3xl"
          aria-hidden="true"
        ></motion.div>

        {/* Floating stars with continuous animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute inset-0"
          aria-hidden="true"
        >
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className="absolute right-[15%] top-[15%]"
          >
            <Star className="h-6 w-6 text-white opacity-30" fill="white" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, 10, 0],
              rotate: [0, -5, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 7,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              delay: 0.5,
            }}
            className="absolute left-[20%] top-[30%]"
          >
            <Star className="h-4 w-4 text-white opacity-20" fill="white" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, 15, 0],
              rotate: [0, 10, 0],
              opacity: [0.25, 0.5, 0.25],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              delay: 1,
            }}
            className="absolute bottom-[30%] right-[25%]"
          >
            <Star className="h-5 w-5 text-white opacity-25" fill="white" />
          </motion.div>
        </motion.div>
      </div>

      {/* Content container with staggered animations */}
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto w-full max-w-7xl px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
            style={{ direction: textDirection }}
          >
            {/* Brand tag with animation */}
            <motion.div
              variants={itemVariants}
              className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                className="mr-2 h-2 w-2 rounded-full bg-[#ba1e29]"
                aria-hidden="true"
              ></motion.span>
              <span className="text-sm font-medium text-white">{dictionary.hero.tagline}</span>
            </motion.div>

            {/* Main heading with character animation */}
            <motion.h1
              variants={itemVariants}
              className="mb-4 font-assistant text-5xl font-bold leading-tight text-white sm:text-6xl md:text-7xl"
            >
              {renderTitle()}
            </motion.h1>

            {/* Subheading */}
            <motion.p variants={itemVariants} className="mb-8 max-w-md text-lg text-white/80">
              {dictionary.hero.subtitle}
            </motion.p>

            {/* Animated CTA button */}
            <motion.button
              variants={itemVariants}
              onClick={scrollToProducts}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-lg border-2 border-[#ba1e29] bg-[#ba1e29] px-6 py-3 text-center text-base font-medium text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(186,30,41,0.4)] focus:outline-none focus:ring-2 focus:ring-[#ba1e29] focus:ring-offset-2"
              aria-label="View our collection of cosmetic products"
            >
              {/* Button background animation */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-[#ba1e29] via-[#e85d69] to-[#ba1e29] bg-[length:200%_auto]"
                animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                aria-hidden="true"
              />

              {/* Button content */}
              <span className="relative flex items-center gap-2">
                <span>{dictionary.hero.cta}</span>
                <motion.span
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  aria-hidden="true"
                >
                  <ArrowDown className="h-5 w-5" />
                </motion.span>
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Bottom decorative bar with animation */}
      <motion.div
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
        className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ba1e29] via-[#e85d69] to-[#ba1e29]"
        aria-hidden="true"
      ></motion.div>
    </section>
  )
}
