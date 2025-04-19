import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminCredentials } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 })
    }

    const success = await verifyAdminCredentials(username, password)

    if (success) {
      // Set authentication cookie
      const cookieStore = await cookies()
      cookieStore.set({
        name: "ob-admin-auth",
        value: "authenticated",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
        sameSite: "lax",
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
