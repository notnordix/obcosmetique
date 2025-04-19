import { getProductById } from "@/lib/db-server"
import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated
    if (!(await isAuthenticated())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const productId = params.id
    const product = await getProductById(productId)

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
