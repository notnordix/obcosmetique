import type { ReactNode } from "react"
import { Toaster } from "sonner"
import "../globals.css"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
