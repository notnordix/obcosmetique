import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PackageSearch } from "lucide-react"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { i18n } from "@/lib/i18n/i18n-config"

export default async function ProductNotFound({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  // Unwrap params using await since this is an async component
  const { lang } = await params

  // Default to 'en' if the lang param is not valid
  const validLang = i18n.locales.includes(lang as any) ? lang : "en"
  const dictionary = await getDictionary(validLang as any)

  return (
    <main className="mx-auto max-w-6xl px-4 pt-32 pb-16 md:pt-36">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-neutral-100 p-6">
          <PackageSearch className="h-12 w-12 text-neutral-400" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-neutral-800">{dictionary.product.notFound.title}</h1>
        <p className="mb-8 max-w-md text-neutral-600">{dictionary.product.notFound.description}</p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild className="bg-[#ba1e29] hover:bg-[#a01824]">
            <Link href={`/${lang}`}>{dictionary.product.notFound.returnHome}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/${lang}/#products`}>{dictionary.product.notFound.browseProducts}</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
