export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  category: string
  inStock: boolean
  rating: number
  reviews: number
}

export interface CartItem extends Product {
  quantity: number
}

export interface Category {
  id: string
  name: string
  slug: string
  icon?: string
}
