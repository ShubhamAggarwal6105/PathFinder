"use client"

import Image from "next/image"
import { Star, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { useCart } from "@/contexts/cart-context"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(product)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Discount badge */}
      {product.discount && <Badge className="absolute top-2 left-2 bg-blue-500 text-white">-{product.discount}%</Badge>}

      {/* Product image */}
      <div className="relative mb-4">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={200}
          height={200}
          className="w-full h-48 object-cover rounded-lg"
        />
        <Button variant="ghost" size="sm" className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white">
          <Heart className="h-4 w-4" />
        </Button>
      </div>

      {/* Product info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">{product.name}</h3>

        {/* Stock status */}
        <div className="flex items-center space-x-2">
          <Badge variant={product.inStock ? "default" : "destructive"} className="text-xs">
            {product.inStock ? "IN STOCK" : "OUT OF STOCK"}
          </Badge>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < product.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
            />
          ))}
          <span className="text-sm text-gray-500 ml-1">{product.reviews}</span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
          )}
          <span className="text-lg font-bold text-red-500">${product.price.toFixed(2)}</span>
        </div>

        {/* Add to cart button */}
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full"
        >
          Add to cart
        </Button>
      </div>
    </div>
  )
}
