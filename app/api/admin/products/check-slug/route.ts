import { isSlugUnique } from "@/lib/db-server"
import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Check if user is authenticated
    if (!(await isAuthenticated())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")
    const excludeId = searchParams.get("excludeId")

    if (!slug) {
      return NextResponse.json({ message: "Slug parameter is required" }, { status: 400 })
    }

    const isUnique = await isSlugUnique(slug, excludeId || undefined)
    return NextResponse.json({ isUnique })
  } catch (error) {
    console.error("Error checking slug uniqueness:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
