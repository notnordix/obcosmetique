import { NextResponse } from "next/server"
import { getRelatedProducts } from "@/lib/db-server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const limit = Number.parseInt(searchParams.get("limit") || "4", 10)

    if (!id) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 })
    }

    const products = await getRelatedProducts(id, limit)
    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching related products:", error)
    return NextResponse.json({ message: "Failed to fetch related products" }, { status: 500 })
  }
}
