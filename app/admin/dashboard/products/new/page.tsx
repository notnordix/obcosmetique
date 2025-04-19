import { ProductForm } from "@/components/admin/product-form"

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Add New Product</h1>
        <p className="text-neutral-500">Create a new product in your catalog</p>
      </div>

      <ProductForm />
    </div>
  )
}
