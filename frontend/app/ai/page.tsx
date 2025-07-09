"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Bot, ShoppingCart, Check, Plus, FileText, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [textInput, setTextInput] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [ingredients, setIngredients] = useState<IngredientItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("dish")
  const { addItem } = useCart()

  const findMatchingProducts = (ingredientName: string): Product | undefined => {
    const searchTerm = ingredientName.toLowerCase()

    return allProducts.find(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        searchTerm.includes(product.name.toLowerCase().split(" ")[0]) ||
        // Enhanced matching for common ingredients
        (searchTerm.includes("flour") && product.name.toLowerCase().includes("flour")) ||
        (searchTerm.includes("sugar") && product.name.toLowerCase().includes("sugar")) ||
        (searchTerm.includes("egg") && product.name.toLowerCase().includes("egg")) ||
        (searchTerm.includes("butter") && product.name.toLowerCase().includes("butter")) ||
        (searchTerm.includes("milk") && product.name.toLowerCase().includes("milk")) ||
        (searchTerm.includes("baking powder") && product.name.toLowerCase().includes("baking")) ||
        (searchTerm.includes("vanilla") && product.name.toLowerCase().includes("vanilla")) ||
        (searchTerm.includes("salt") && product.name.toLowerCase().includes("salt")) ||
        (searchTerm.includes("chocolate") && product.name.toLowerCase().includes("chocolate")) ||
        (searchTerm.includes("cheese") && product.name.toLowerCase().includes("cheese")) ||
        (searchTerm.includes("chicken") && product.name.toLowerCase().includes("chicken")) ||
        (searchTerm.includes("beef") && product.name.toLowerCase().includes("beef")) ||
        (searchTerm.includes("rice") && product.name.toLowerCase().includes("rice")) ||
        (searchTerm.includes("pasta") && product.name.toLowerCase().includes("pasta")) ||
        (searchTerm.includes("tomato") && product.name.toLowerCase().includes("tomato")) ||
        (searchTerm.includes("onion") && product.name.toLowerCase().includes("onion")) ||
        (searchTerm.includes("garlic") && product.name.toLowerCase().includes("garlic")) ||
        (searchTerm.includes("oil") && product.name.toLowerCase().includes("oil")) ||
        (searchTerm.includes("bread") && product.name.toLowerCase().includes("bread")),
    )
  }

  const processIngredients = (ingredientsList: string[]): IngredientItem[] => {
    return ingredientsList.map((ingredient) => {
      const matchingProduct = findMatchingProducts(ingredient)
      return {
        name: ingredient,
        product: matchingProduct,
        available: !!matchingProduct,
      }
    })
  }

  const handleDishSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/ai/ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "dish",
          query: query.trim(),
        }),
      })

      const data = await response.json()

      if (data.error) {
        console.error("Error:", data.error)
        setIngredients([])
      } else {
        const processedIngredients = processIngredients(data.ingredients)
        setIngredients(processedIngredients)
      }
    } catch (error) {
      console.error("Error fetching ingredients:", error)
      setIngredients([])
    } finally {
      setLoading(false)
    }
  }

  const handleTextSearch = async () => {
    if (!textInput.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/ai/ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "text",
          text: textInput.trim(),
        }),
      })

      const data = await response.json()

      if (data.error) {
        console.error("Error:", data.error)
        setIngredients([])
      } else {
        const processedIngredients = processIngredients(data.ingredients)
        setIngredients(processedIngredients)
      }
    } catch (error) {
      console.error("Error extracting ingredients from text:", error)
      setIngredients([])
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageSearch = async () => {
    if (!selectedImage) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("image", selectedImage)
      formData.append("type", "image")

      const response = await fetch("/api/ai/ingredients", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.error) {
        console.error("Error:", data.error)
        setIngredients([])
      } else {
        const processedIngredients = processIngredients(data.ingredients)
        setIngredients(processedIngredients)
      }
    } catch (error) {
      console.error("Error extracting ingredients from image:", error)
      setIngredients([])
    } finally {
      setLoading(false)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
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
          <p className="text-gray-600 text-lg">Find ingredients from dish names, recipe text, or images using AI!</p>
        </div>

        {/* Search Tabs */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dish" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Dish Name
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Recipe Text
                </TabsTrigger>
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Image Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dish" className="mt-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Enter a dish name (e.g., chocolate cake, pasta carbonara, chicken curry...)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleDishSearch()}
                        className="text-lg py-3"
                      />
                    </div>
                    <Button
                      onClick={handleDishSearch}
                      disabled={loading || !query.trim()}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing...
                        </div>
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Find Ingredients
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="text" className="mt-6">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Paste your recipe text here... AI will extract the ingredients for you!"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="min-h-32 text-base"
                  />
                  <Button
                    onClick={handleTextSearch}
                    disabled={loading || !textInput.trim()}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Extracting...
                      </div>
                    ) : (
                      <>
                        <FileText className="h-5 w-5 mr-2" />
                        Extract Ingredients
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="image" className="mt-6">
                <div className="space-y-4">
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Upload an image of a recipe or ingredient list</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button asChild className="bg-purple-500 hover:bg-purple-600 text-white">
                          <span>Choose Image</span>
                        </Button>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Uploaded recipe"
                          className="max-w-full h-64 object-contain mx-auto rounded-lg border"
                        />
                        <Button
                          onClick={removeImage}
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={handleImageSearch}
                        disabled={loading}
                        className="bg-purple-500 hover:bg-purple-600 text-white w-full"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Reading Image...
                          </div>
                        ) : (
                          <>
                            <Upload className="h-5 w-5 mr-2" />
                            Extract from Image
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
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
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">Analysis Summary</h3>
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
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Dish Names:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      "Chocolate Cake",
                      "Pasta Carbonara",
                      "Chicken Curry",
                      "Caesar Salad",
                      "Beef Stir Fry",
                      "Pancakes",
                      "Pizza Margherita",
                      "Chicken Soup",
                    ].map((example) => (
                      <Button
                        key={example}
                        variant="outline"
                        onClick={() => {
                          setQuery(example)
                          setActiveTab("dish")
                        }}
                        className="text-left justify-start"
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Or try:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Paste a recipe in the "Recipe Text" tab</li>
                    <li>• Upload an image of a recipe or ingredient list</li>
                    <li>• Take a photo of a cookbook page or handwritten recipe</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
