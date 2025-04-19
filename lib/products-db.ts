import type { Product } from "./types"

// Client-side wrapper for the products API
export async function getProducts(lang?: string): Promise<Product[]> {
  try {
    const response = await fetch(`/api/products?lang=${lang || "en"}`)
    if (!response.ok) {
      throw new Error("Failed to fetch products")
    }
    const data = await response.json()
    return data.products || []
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

// Function to get a single product by slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(`/api/products/${slug}`)
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error("Failed to fetch product")
    }
    const data = await response.json()
    return data.product || null
  } catch (error) {
    console.error("Error fetching product by slug:", error)
    return null
  }
}

// Function to get related products (excluding the current product)
export async function getRelatedProducts(currentProductId: string, limit = 4): Promise<Product[]> {
  try {
    const response = await fetch(`/api/products/related?id=${currentProductId}&limit=${limit}`)
    if (!response.ok) {
      throw new Error("Failed to fetch related products")
    }
    const data = await response.json()
    return data.products || []
  } catch (error) {
    console.error("Error fetching related products:", error)
    return []
  }
}
