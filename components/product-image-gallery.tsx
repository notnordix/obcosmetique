"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Lens } from "@/components/ui/lens"

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  // Ensure we have at least one image
  const displayImages = images.length > 0 ? images : ["/placeholder.svg?height=600&width=600"]

  return (
    <div className="flex flex-col gap-4">
      {/* Main image with magnifying lens */}
      <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-lg border">
        <Lens className="h-full w-full">
          <Image
            src={displayImages[selectedImage] || "/placeholder.svg"}
            alt={`${productName} - Image ${selectedImage + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            className="object-cover transition-all duration-500"
          />
        </Lens>
      </div>

      {/* Thumbnail images in a row */}
      {displayImages.length > 1 && (
        <div
          className="flex justify-center gap-2 overflow-x-auto pb-2"
          role="group"
          aria-label="Product image thumbnails"
        >
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={cn(
                "relative h-14 w-14 overflow-hidden rounded-md border-2 transition-all",
                selectedImage === index
                  ? "border-[#ba1e29] opacity-100 ring-1 ring-[#ba1e29]/20"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
              onFocus={() => setSelectedImage(index)}
              aria-label={`View image ${index + 1} of ${displayImages.length}`}
              aria-current={selectedImage === index ? "true" : "false"}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
