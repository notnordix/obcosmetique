"use server"

import { cookies } from "next/headers"
import { verifyAdminCredentials } from "./db"

const AUTH_COOKIE = "ob-admin-auth"

export async function login(username: string, password: string): Promise<boolean> {
  // Use the database verification function
  const isValid = await verifyAdminCredentials(username, password)

  if (isValid) {
    // Set authentication cookie
    const cookieStore = await cookies()
    cookieStore.set({
      name: AUTH_COOKIE,
      value: "authenticated",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })
    return true
  }
  return false
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE)
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get(AUTH_COOKIE)

    return authCookie?.value === "authenticated"
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}

export async function requireAuth() {
  if (!(await isAuthenticated())) {
    return { redirect: "/admin/login" }
  }
  return { redirect: null }
}
