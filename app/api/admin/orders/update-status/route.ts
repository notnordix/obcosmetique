import { updateOrderStatus } from "@/lib/db"
import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    if (!(await isAuthenticated())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { orderId, status } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json({ message: "Order ID and status are required" }, { status: 400 })
    }

    // Validate status
    if (status !== "processing" && status !== "completed") {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    const success = await updateOrderStatus(orderId, status)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ message: "Failed to update order status" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
