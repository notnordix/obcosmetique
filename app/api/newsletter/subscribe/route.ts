import { NextResponse } from "next/server"
import { addSubscriber } from "@/lib/db-server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
    }

    const success = await addSubscriber(email)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, message: "Failed to subscribe" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error subscribing:", error)
    return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500 })
  }
}
