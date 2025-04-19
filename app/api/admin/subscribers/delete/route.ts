import { deleteSubscriber } from "@/lib/db"
import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    if (!(await isAuthenticated())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ message: "Subscriber ID is required" }, { status: 400 })
    }

    const success = await deleteSubscriber(id)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ message: "Failed to delete subscriber" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error deleting subscriber:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
