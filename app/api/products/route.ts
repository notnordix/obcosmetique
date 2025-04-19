import { NextResponse } from "next/server"
import { getProducts } from "@/lib/db-server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get("lang") || "en"

    const products = await getProducts(lang as any)
    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 })
  }
}
