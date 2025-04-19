export interface Product {
  id: string
  name: string
  slug: string
  price: number
  image: string
  images?: string[] // Array of additional product images
  description?: string
  fullDescription?: string
  ingredients?: string[] // Array of product ingredients
  translations?: {
    [lang: string]: {
      name?: string
      description?: string
      fullDescription?: string
      ingredients?: string[] // Array of translated ingredients
    }
  }
  // Additional optional fields that could be useful:
  category?: string
  tags?: string[]
  rating?: number
  stock?: number
  isNew?: boolean
  discount?: number
}

export interface CartItem {
  product: Product
  quantity: number
}
