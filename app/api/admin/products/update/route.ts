import { updateProduct, isSlugUnique } from "@/lib/db-server"
import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    if (!(await isAuthenticated())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id, ...productData } = await request.json()

    if (!id) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 })
    }

    // Check if slug is unique if provided
    if (productData.slug) {
      const isUnique = await isSlugUnique(productData.slug, id)
      if (!isUnique) {
        return NextResponse.json({ message: "Slug must be unique" }, { status: 400 })
      }
    }

    // Extract images array from productData
    const { images, ...restProductData } = productData
    const mainImage = productData.image
    const additionalImages = images?.filter((img: string) => img !== mainImage) || []

    // Update the product with main image and additional images
    const success = await updateProduct(id, {
      ...restProductData,
      additionalImages,
    })

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ message: "Failed to update product" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
