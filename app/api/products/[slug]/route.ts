import { NextResponse } from "next/server"
import { getProductBySlug, getRelatedProducts } from "@/lib/db-server"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get("lang") || "en"

    const product = await getProductBySlug(params.slug)

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Get related products
    const relatedProducts = await getRelatedProducts(product.id, 4)

    return NextResponse.json({ product, relatedProducts })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 })
  }
}
