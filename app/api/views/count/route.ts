import { NextResponse } from "next/server"
import { getViewCount } from "@/lib/db-server"

export async function GET() {
  try {
    const count = await getViewCount()
    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error("Error getting view count:", error)
    return NextResponse.json({ success: false, message: "Failed to get view count" }, { status: 500 })
  }
}
