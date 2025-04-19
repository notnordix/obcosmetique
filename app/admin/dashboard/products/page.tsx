"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, Trash2, Package } from "lucide-react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { getProducts } from "@/lib/products-db"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const data = await getProducts()
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast.error("Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteProduct = (id: string) => {
    setProductToDelete(id)
  }

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        const response = await fetch("/api/admin/products/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: productToDelete }),
        })

        if (response.ok) {
          setProducts(products.filter((product) => product.id !== productToDelete))
          toast.success("Product deleted successfully")
        } else {
          throw new Error("Failed to delete product")
        }
      } catch (error) {
        console.error("Error deleting product:", error)
        toast.error("Failed to delete product")
      } finally {
        setProductToDelete(null)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-[#ba1e29]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-neutral-500">Manage your product catalog</p>
        </div>
        <Button asChild className="bg-[#ba1e29] hover:bg-[#a01824]">
          <Link href="/admin/dashboard/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="search"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <Button type="submit" size="icon" variant="ghost">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-neutral-50 text-left">
                  <th className="px-4 py-3 font-medium">Image</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="px-4 py-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-md">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3">{product.price.toFixed(2)} MAD</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/admin/dashboard/products/edit/${product.id}`}>
                            <Edit className="mr-1 h-4 w-4" /> Edit
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Package className="mb-4 h-16 w-16 text-neutral-300" />
          <h2 className="mb-2 text-xl font-medium text-neutral-700">No Products Found</h2>
          <p className="mb-6 max-w-md text-neutral-500">
            {searchTerm
              ? "No products match your search criteria. Try a different search term."
              : "Start by adding products to your catalog."}
          </p>
          {!searchTerm && (
            <Button asChild className="bg-[#ba1e29] hover:bg-[#a01824]">
              <Link href="/admin/dashboard/products/new">
                <Plus className="mr-2 h-4 w-4" /> Add Your First Product
              </Link>
            </Button>
          )}
        </Card>
      )}

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this product from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
