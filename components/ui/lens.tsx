"use client"

import type React from "react"
import { useRef, useState } from "react"
import { motion } from "framer-motion"

interface LensProps {
  children: React.ReactNode
  className?: string
  magnification?: number
}

export function Lens({ children, className = "", magnification = 1.5 }: LensProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [showLens, setShowLens] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const { left, top, width, height } = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100

    setPosition({ x, y })
    setCursorPosition({ x: e.clientX - left, y: e.clientY - top })
    setShowLens(true)
  }

  const handleMouseLeave = () => {
    setShowLens(false)
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
      style={{ cursor: showLens ? "none" : "auto" }}
      aria-label="Magnifying lens effect - hover to zoom"
    >
      {children}
      {showLens && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pointer-events-none absolute z-50 h-[150px] w-[150px] overflow-hidden rounded-full border-2 border-white/20 bg-white/5 backdrop-blur-sm"
          style={{
            left: cursorPosition.x - 75,
            top: cursorPosition.y - 75,
          }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `scale(${magnification})`,
              transformOrigin: `${position.x}% ${position.y}%`,
            }}
          >
            {children}
          </div>
        </motion.div>
      )}
    </div>
  )
}
