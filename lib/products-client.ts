// Client-side API wrapper for product operations
import type { Product } from "./types"

// Function to get a product by ID
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const response = await fetch(`/api/admin/products/${productId}`)

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error("Failed to fetch product")
    }

    const data = await response.json()
    return data.product || null
  } catch (error) {
    console.error("Error fetching product by ID:", error)
    return null
  }
}

// Function to check if a slug is unique
export async function isSlugUnique(slug: string, excludeProductId?: string): Promise<boolean> {
  try {
    const params = new URLSearchParams()
    params.append("slug", slug)
    if (excludeProductId) {
      params.append("excludeId", excludeProductId)
    }

    const response = await fetch(`/api/admin/products/check-slug?${params.toString()}`)

    if (!response.ok) {
      throw new Error("Failed to check slug uniqueness")
    }

    const data = await response.json()
    return data.isUnique
  } catch (error) {
    console.error("Error checking slug uniqueness:", error)
    return false
  }
}
