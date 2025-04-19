"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication status with the server
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/verify-auth", {
          method: "GET",
          credentials: "include", // Important to include cookies
        })

        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          // Use router.push instead of window.location for better Next.js integration
          router.push("/admin/login")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/admin/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-[#ba1e29]"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // This will never render as we redirect in the useEffect
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 md:p-6 pt-16 md:pt-6">{children}</main>
    </div>
  )
}
