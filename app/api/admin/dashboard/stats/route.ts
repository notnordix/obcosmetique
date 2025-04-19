import { getDashboardStats } from "@/lib/db"
import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"

export async function GET() {
  try {
    // Check if user is authenticated
    if (!(await isAuthenticated())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const stats = await getDashboardStats()
    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
