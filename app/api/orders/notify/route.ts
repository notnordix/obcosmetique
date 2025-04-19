import { NextResponse } from "next/server"
import { sendOrderNotification } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const orderData = await request.json()

    // Validate required fields
    if (!orderData.id || !orderData.customerName || !orderData.email || !orderData.items) {
      return NextResponse.json({ message: "Missing required order data" }, { status: 400 })
    }

    // Send email notification
    const success = await sendOrderNotification(orderData)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ message: "Failed to send notification" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error sending order notification:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
