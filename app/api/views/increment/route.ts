import { NextResponse } from "next/server"
import { incrementViewCount } from "@/lib/db-server"

export async function POST() {
  try {
    const count = await incrementViewCount()
    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error("Error incrementing view count:", error)
    return NextResponse.json({ success: false, message: "Failed to increment view count" }, { status: 500 })
  }
}
