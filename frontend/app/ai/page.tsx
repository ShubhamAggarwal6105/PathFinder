"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Bot, ShoppingCart, Check, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { allProducts } from "@/lib/data"
import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/lib/types"

interface IngredientItem {
  name: string
  product?: Product
  available: boolean
}

export default function AIPage() {
  const [query, setQuery] = useState("")
  const [ingredients, setIngredients] = useState<IngredientItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { addItem } = useCart()

  // Hardcoded cake ingredients that match our product data
  const cakeIngredients = [
    "All-Purpose Flour",
    "Granulated Sugar",
    "Large Eggs",
    "Unsalted Butter",
    "Whole Milk",
    "Baking Powder",
    "Vanilla Extract",
    "Salt",
  ]

  const findMatchingProducts = (ingredientName: string): Product | undefined => {
    const searchTerm = ingredientName.toLowerCase()

    return allProducts.find(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        searchTerm.includes(product.name.toLowerCase().split(" ")[0]) ||
        // Specific mappings for cake ingredients
        (searchTerm.includes("flour") && product.name.toLowerCase().includes("flour")) ||
        (searchTerm.includes("sugar") && product.name.toLowerCase().includes("sugar")) ||
        (searchTerm.includes("egg") && product.name.toLowerCase().includes("egg")) ||
        (searchTerm.includes("butter") && product.name.toLowerCase().includes("butter")) ||
        (searchTerm.includes("milk") && product.name.toLowerCase().includes("milk")) ||
        (searchTerm.includes("baking powder") && product.name.toLowerCase().includes("baking")) ||
        (searchTerm.includes("vanilla") && product.name.toLowerCase().includes("vanilla")) ||
        (searchTerm.includes("salt") && product.name.toLowerCase().includes("salt")),
    )
  }

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // For cake-related queries, use hardcoded ingredients
    if (
      query.toLowerCase().includes("cake") ||
      query.toLowerCase().includes("chocolate cake") ||
      query.toLowerCase().includes("vanilla cake") ||
      query.toLowerCase().includes("birthday cake")
    ) {
      const processedIngredients: IngredientItem[] = cakeIngredients.map((ingredient) => {
        const matchingProduct = findMatchingProducts(ingredient)
        return {
          name: ingredient,
          product: matchingProduct,
          available: !!matchingProduct,
        }
      })

      setIngredients(processedIngredients)
    } else {
      // For other queries, show empty results or you could add more hardcoded recipes
      setIngredients([])
    }

    setLoading(false)
  }

  const addAllAvailableToCart = () => {
    const availableIngredients = ingredients.filter((item) => item.available && item.product)

    availableIngredients.forEach((item) => {
      if (item.product) {
        addItem(item.product)
      }
    })

    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const availableIngredients = ingredients.filter((item) => item.available)
  const unavailableIngredients = ingredients.filter((item) => !item.available)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Popup */}
        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
            <Check className="h-5 w-5" />
            <span>Added {availableIngredients.length} items to cart!</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Bot className="h-12 w-12 text-blue-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">AI Recipe Assistant</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Enter any dish name and I'll find the ingredients available in our store!
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter a dish name (e.g., chocolate cake, vanilla cake, birthday cake...)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="text-lg py-3"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Find Ingredients
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {ingredients.length > 0 && (
          <div className="space-y-6">
            {/* Available Ingredients */}
            {availableIngredients.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl text-green-600">
                      Available in Store ({availableIngredients.length})
                    </CardTitle>
                    <div className="flex space-x-3">
                      <Button onClick={addAllAvailableToCart} className="bg-green-500 hover:bg-green-600 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add All to Cart
                      </Button>
                      <Link href="/cart">
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          View Cart
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {availableIngredients.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-4 border border-green-200 rounded-lg bg-green-50"
                      >
                        {item.product && (
                          <Image
                            src={item.product.image || "/placeholder.svg"}
                            alt={item.product.name}
                            width={60}
                            height={60}
                            className="object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          {item.product && (
                            <>
                              <p className="text-sm text-gray-600">{item.product.name}</p>
                              <p className="text-lg font-bold text-green-600">${item.product.price.toFixed(2)}</p>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-500 text-white">Available</Badge>
                          <Button
                            size="sm"
                            onClick={() => item.product && addItem(item.product)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Unavailable Ingredients */}
            {unavailableIngredients.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-red-600">
                    Not Available in Store ({unavailableIngredients.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {unavailableIngredients.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-4 border border-red-200 rounded-lg bg-red-50"
                      >
                        <div className="w-15 h-15 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-2xl">❌</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">Not found in our inventory</p>
                        </div>
                        <Badge variant="destructive">Unavailable</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">Recipe Summary for "{query}"</h3>
                  <p className="text-blue-700">
                    Found {availableIngredients.length} available ingredients and {unavailableIngredients.length}{" "}
                    unavailable items
                  </p>
                  {availableIngredients.length > 0 && (
                    <p className="text-sm text-blue-600 mt-2">
                      Total estimated cost: $
                      {availableIngredients.reduce((sum, item) => sum + (item.product?.price || 0), 0).toFixed(2)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Example Queries */}
        {ingredients.length === 0 && !loading && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-xl">Try These Examples:</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  "Chocolate Cake",
                  "Vanilla Cake",
                  "Birthday Cake",
                  "Sponge Cake",
                  "Pound Cake",
                  "Carrot Cake",
                  "Red Velvet Cake",
                  "Lemon Cake",
                ].map((example) => (
                  <Button
                    key={example}
                    variant="outline"
                    onClick={() => setQuery(example)}
                    className="text-left justify-start"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
