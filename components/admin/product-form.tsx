"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2, Upload, X, Trash2 } from "lucide-react"
import Image from "next/image"
// Import from client-side API wrapper instead of direct DB import
import { getProductById } from "@/lib/products-client"

interface ProductFormProps {
  productId?: string
  isEdit?: boolean
}

export function ProductForm({ productId, isEdit = false }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    image: "",
    description: "",
    fullDescription: "",
    ingredients: [] as string[],
    additionalImages: [] as string[],
    translations: {
      fr: {
        name: "",
        description: "",
        fullDescription: "",
        ingredients: [] as string[],
      },
      ar: {
        name: "",
        description: "",
        fullDescription: "",
        ingredients: [] as string[],
      },
    },
  })

  // Fetch product data if editing
  useEffect(() => {
    if (isEdit && productId) {
      const fetchProduct = async () => {
        try {
          setIsLoading(true)
          const product = await getProductById(productId)

          if (product) {
            setFormData({
              name: product.name || "",
              slug: product.slug || "",
              price: product.price?.toString() || "",
              image: product.image || "",
              description: product.description || "",
              fullDescription: product.fullDescription || "",
              ingredients: product.ingredients || [],
              additionalImages: product.images?.slice(1) || [], // Skip the first image as it's the main one
              translations: {
                fr: {
                  name: product.translations?.fr?.name || "",
                  description: product.translations?.fr?.description || "",
                  fullDescription: product.translations?.fr?.fullDescription || "",
                  ingredients: product.translations?.fr?.ingredients || [],
                },
                ar: {
                  name: product.translations?.ar?.name || "",
                  description: product.translations?.ar?.description || "",
                  fullDescription: product.translations?.ar?.fullDescription || "",
                  ingredients: product.translations?.ar?.ingredients || [],
                },
              },
            })
          } else {
            toast.error("Product not found")
            router.push("/admin/dashboard/products")
          }
        } catch (error) {
          console.error("Error fetching product:", error)
          toast.error("Failed to load product")
        } finally {
          setIsLoading(false)
        }
      }

      fetchProduct()
    }
  }, [isEdit, productId, router])

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Auto-generate slug when name changes
    if (name === "name" && !isEdit) {
      setFormData({
        ...formData,
        name: value,
        slug: generateSlug(value),
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  // Handle translation changes
  const handleTranslationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    lang: string,
    field: string,
  ) => {
    setFormData({
      ...formData,
      translations: {
        ...formData.translations,
        [lang]: {
          ...formData.translations[lang as keyof typeof formData.translations],
          [field]: e.target.value,
        },
      },
    })
  }

  // Add a function to handle ingredient changes
  const handleIngredientChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updatedIngredients = [...prev.ingredients]
      updatedIngredients[index] = value
      return {
        ...prev,
        ingredients: updatedIngredients,
      }
    })
  }

  // Add a function to add a new ingredient
  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ""],
    }))
  }

  // Add a function to remove an ingredient
  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
  }

  // Add a function to handle translation ingredient changes
  const handleTranslationIngredientChange = (lang: string, index: number, value: string) => {
    setFormData((prev) => {
      const updatedTranslations = { ...prev.translations }
      const updatedIngredients = [...(updatedTranslations[lang as keyof typeof updatedTranslations].ingredients || [])]
      updatedIngredients[index] = value

      return {
        ...prev,
        translations: {
          ...updatedTranslations,
          [lang]: {
            ...updatedTranslations[lang as keyof typeof updatedTranslations],
            ingredients: updatedIngredients,
          },
        },
      }
    })
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/products/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      setFormData((prev) => ({
        ...prev,
        image: data.imageUrl,
      }))

      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  // Add a function to handle additional image upload
  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/products/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      setFormData((prev) => ({
        ...prev,
        additionalImages: [...prev.additionalImages, data.imageUrl],
      }))

      toast.success("Additional image uploaded successfully")
    } catch (error) {
      console.error("Error uploading additional image:", error)
      toast.error("Failed to upload additional image")
    } finally {
      setIsUploading(false)
    }
  }

  // Add a function to remove an additional image
  const removeAdditionalImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.name || !formData.slug || !formData.price || !formData.image) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)

      const endpoint = isEdit ? "/api/admin/products/update" : "/api/admin/products/create"

      const payload = {
        ...(isEdit && { id: productId }),
        name: formData.name,
        slug: formData.slug,
        price: Number.parseFloat(formData.price),
        image: formData.image,
        description: formData.description,
        fullDescription: formData.fullDescription,
        ingredients: formData.ingredients.filter((ingredient) => ingredient.trim() !== ""),
        // Include all images (main image + additional images)
        images: [formData.image, ...formData.additionalImages],
        translations: formData.translations,
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save product")
      }

      toast.success(isEdit ? "Product updated successfully" : "Product created successfully")
      router.push("/admin/dashboard/products")
    } catch (error: any) {
      console.error("Error saving product:", error)
      toast.error(error.message || "Failed to save product")
    } finally {
      setIsSaving(false)
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <Tabs defaultValue="english">
        <TabsList className="mb-4">
          <TabsTrigger value="english">English</TabsTrigger>
          <TabsTrigger value="french">French</TabsTrigger>
          <TabsTrigger value="arabic">Arabic</TabsTrigger>
        </TabsList>

        {/* English Tab */}
        <TabsContent value="english" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug <span className="text-red-500">*</span>
              </Label>
              <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} required />
              <p className="text-xs text-neutral-500">Used in the URL: obcosmetique.com/products/{formData.slug}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                Price (MAD) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">
                Main Image <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-4">
                {formData.image && (
                  <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                    <Image
                      src={formData.image || "/placeholder.svg"}
                      alt="Product image"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Label
                    htmlFor="imageUpload"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 hover:bg-neutral-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload Image
                      </>
                    )}
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullDescription">Full Description</Label>
            <Textarea
              id="fullDescription"
              name="fullDescription"
              value={formData.fullDescription}
              onChange={handleChange}
              rows={6}
            />
          </div>

          <div className="space-y-2 mt-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="ingredients">Ingredients</Label>
              <Button type="button" variant="outline" size="sm" onClick={addIngredient} className="h-8 px-2 text-xs">
                Add Ingredient
              </Button>
            </div>

            {formData.ingredients.length > 0 ? (
              <div className="space-y-2">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={ingredient}
                      onChange={(e) => handleIngredientChange(index, e.target.value)}
                      placeholder={`Ingredient ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                      className="h-8 w-8 p-0 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No ingredients added yet. Click "Add Ingredient" to add one.</p>
            )}
          </div>

          <div className="space-y-2 mt-6">
            <div className="flex items-center justify-between">
              <Label>Additional Images (Gallery)</Label>
              <div className="text-xs text-neutral-500">{formData.additionalImages.length}/4 images</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.additionalImages.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-md border overflow-hidden">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Product image ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeAdditionalImage(index)}
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {formData.additionalImages.length < 4 && (
                <Label
                  htmlFor="additionalImageUpload"
                  className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-neutral-300 aspect-square text-sm text-neutral-500 hover:bg-neutral-50 ${isUploading ? "opacity-50" : ""}`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6" />
                      <span>Add Image</span>
                    </>
                  )}
                  <Input
                    id="additionalImageUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAdditionalImageUpload}
                    disabled={isUploading || formData.additionalImages.length >= 4}
                  />
                </Label>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              You can upload up to 4 additional images for the product gallery.
            </p>
          </div>
        </TabsContent>

        {/* French Tab */}
        <TabsContent value="french" className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fr-name">Product Name (French)</Label>
                <Input
                  id="fr-name"
                  value={formData.translations.fr.name}
                  onChange={(e) => handleTranslationChange(e, "fr", "name")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fr-description">Short Description (French)</Label>
                <Textarea
                  id="fr-description"
                  value={formData.translations.fr.description}
                  onChange={(e) => handleTranslationChange(e, "fr", "description")}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fr-fullDescription">Full Description (French)</Label>
                <Textarea
                  id="fr-fullDescription"
                  value={formData.translations.fr.fullDescription}
                  onChange={(e) => handleTranslationChange(e, "fr", "fullDescription")}
                  rows={6}
                />
              </div>

              <div className="space-y-2 mt-6">
                <Label htmlFor="fr-ingredients">Ingredients (French)</Label>
                {formData.ingredients.length > 0 ? (
                  <div className="space-y-2">
                    {formData.ingredients.map((_, index) => (
                      <Input
                        key={index}
                        id={`fr-ingredient-${index}`}
                        value={formData.translations.fr.ingredients[index] || ""}
                        onChange={(e) => handleTranslationIngredientChange("fr", index, e.target.value)}
                        placeholder={`French translation for "${formData.ingredients[index]}"`}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">Add ingredients in the English tab first.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Arabic Tab */}
        <TabsContent value="arabic" className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ar-name">Product Name (Arabic)</Label>
                <Input
                  id="ar-name"
                  value={formData.translations.ar.name}
                  onChange={(e) => handleTranslationChange(e, "ar", "name")}
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ar-description">Short Description (Arabic)</Label>
                <Textarea
                  id="ar-description"
                  value={formData.translations.ar.description}
                  onChange={(e) => handleTranslationChange(e, "ar", "description")}
                  rows={3}
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ar-fullDescription">Full Description (Arabic)</Label>
                <Textarea
                  id="ar-fullDescription"
                  value={formData.translations.ar.fullDescription}
                  onChange={(e) => handleTranslationChange(e, "ar", "fullDescription")}
                  rows={6}
                  dir="rtl"
                />
              </div>
              <div className="space-y-2 mt-6">
                <Label htmlFor="ar-ingredients">Ingredients (Arabic)</Label>
                {formData.ingredients.length > 0 ? (
                  <div className="space-y-2">
                    {formData.ingredients.map((_, index) => (
                      <Input
                        key={index}
                        id={`ar-ingredient-${index}`}
                        value={formData.translations.ar.ingredients[index] || ""}
                        onChange={(e) => handleTranslationIngredientChange("ar", index, e.target.value)}
                        placeholder={`Arabic translation for "${formData.ingredients[index]}"`}
                        dir="rtl"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">Add ingredients in the English tab first.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/dashboard/products")}>
          Cancel
        </Button>
        <Button type="submit" className="bg-[#ba1e29] hover:bg-[#a01824]" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{isEdit ? "Update Product" : "Create Product"}</>
          )}
        </Button>
      </div>
    </form>
  )
}
