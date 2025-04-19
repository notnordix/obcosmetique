import { createProduct, isSlugUnique } from "@/lib/db-server"
import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    if (!(await isAuthenticated())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const productData = await request.json()

    // Validate required fields
    if (!productData.name || !productData.slug || !productData.price || !productData.image) {
      return NextResponse.json({ message: "Name, slug, price, and image are required" }, { status: 400 })
    }

    // Check if slug is unique
    const isUnique = await isSlugUnique(productData.slug)
    if (!isUnique) {
      return NextResponse.json({ message: "Slug must be unique" }, { status: 400 })
    }

    // Extract images array from productData
    const { images, ...restProductData } = productData
    const mainImage = productData.image
    const additionalImages = images?.filter((img: string) => img !== mainImage) || []

    // Create the product with main image and additional images
    const productId = await createProduct({
      ...restProductData,
      additionalImages,
    })

    if (productId) {
      return NextResponse.json({ success: true, productId })
    } else {
      return NextResponse.json({ message: "Failed to create product" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
