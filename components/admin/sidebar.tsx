"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Package, Users, ShoppingCart, LogOut, ChevronDown, ChevronUp, Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect"

const menuItems = [
  {
    title: "Overview",
    icon: BarChart3,
    href: "/admin/dashboard",
  },
  {
    title: "Products",
    icon: Package,
    href: "/admin/dashboard/products",
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/admin/dashboard/orders",
  },
  {
    title: "Subscribers",
    icon: Users,
    href: "/admin/dashboard/subscribers",
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useIsomorphicLayoutEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setMobileOpen(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleLogout = async () => {
    try {
      // Delete the auth cookie
      document.cookie = "ob-admin-auth=; path=/; max-age=0"

      // Also call the API to clear the HTTP-only cookie
      await fetch("/api/admin/logout", { method: "POST" })

      // Redirect to login page
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed top-4 left-4 z-50 rounded-md bg-white p-2 shadow-md md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r bg-white transition-all duration-300 md:relative",
          collapsed ? "w-20" : "w-64",
          isMobile && !mobileOpen ? "-translate-x-full" : "translate-x-0",
        )}
      >
        {/* Logo and collapse button */}
        <div className="flex items-center justify-between border-b p-4">
          {!collapsed && <div className="text-xl font-bold">Ob cosmétique</div>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-2 hover:bg-neutral-100 md:block hidden"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#ba1e29]/10 text-[#ba1e29]"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900",
                )}
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout button */}
        <div className="border-t p-4">
          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900",
              collapsed && "justify-center",
            )}
          >
            <LogOut className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </>
  )
}
