import { ProductForm } from "@/components/admin/product-form"

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Edit Product</h1>
        <p className="text-neutral-500">Update product information</p>
      </div>

      <ProductForm productId={params.id} isEdit={true} />
    </div>
  )
}
