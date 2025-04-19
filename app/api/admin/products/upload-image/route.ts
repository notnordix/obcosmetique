import { uploadProductImage } from "@/lib/db"
import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    if (!(await isAuthenticated())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    const imageUrl = await uploadProductImage(file)

    if (imageUrl) {
      return NextResponse.json({ success: true, imageUrl })
    } else {
      return NextResponse.json({ message: "Failed to upload image" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
