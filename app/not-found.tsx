import { redirect } from "next/navigation"
import { i18n } from "@/lib/i18n/i18n-config"

export default function NotFound() {
  // Redirect to the default locale's not found page
  redirect(`/${i18n.defaultLocale}/not-found`)
}
