"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"

export function ViewCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const trackView = async () => {
      try {
        // Only count the view once per session
        if (!sessionStorage.getItem("view-counted")) {
          const response = await fetch("/api/views/increment", {
            method: "POST",
          })

          if (response.ok) {
            const data = await response.json()
            setCount(data.count)
            sessionStorage.setItem("view-counted", "true")
          }
        } else {
          // Just get the current count without incrementing
          const response = await fetch("/api/views/count")
          if (response.ok) {
            const data = await response.json()
            setCount(data.count)
          }
        }
      } catch (error) {
        console.error("Failed to track view:", error)
      }
    }

    trackView()
  }, [])

  if (count === null) return null

  return (
    <div className="flex items-center gap-1 text-xs text-neutral-500">
      <Eye className="h-3 w-3" />
      <span>{count} visitors</span>
    </div>
  )
}
