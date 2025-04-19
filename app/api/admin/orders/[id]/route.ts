import { getOrderDetails } from "@/lib/db"
import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated
    if (!(await isAuthenticated())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const orderId = params.id
    const orderDetails = await getOrderDetails(orderId)

    if (!orderDetails) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ orderDetails })
  } catch (error) {
    console.error("Error fetching order details:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
