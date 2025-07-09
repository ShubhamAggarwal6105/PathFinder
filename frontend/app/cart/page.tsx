"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useState } from "react"

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart()
  const [isGeneratingPath, setIsGeneratingPath] = useState(false)
  const [pathSvg, setPathSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [collectedCount, setCollectedCount] = useState(0)
  const [collectItem, setCollectItem] = useState<string | null>(null)

  const generateOptimalPath = async (action?: "next" | "prev") => {
    if (items.length === 0) return

    setIsGeneratingPath(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:8000/api/generate-path/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
          })),
          collectedCount:
            action === "next"
              ? collectedCount + 1
              : action === "prev"
                ? Math.max(0, collectedCount - 1)
                : collectedCount,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate path")
      }

      const data = await response.json()
      setPathSvg(data.svg)
      if (data.collectedCount !== undefined) {
        setCollectedCount(data.collectedCount)
      }
      if (data.collectItem !== undefined) {
        setCollectItem(data.collectItem)
      }
    } catch (err) {
      setError("Failed to generate optimal path. Please try again.")
      console.error("Error generating path:", err)
    } finally {
      setIsGeneratingPath(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <Link href="/">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Cart Items ({items.length})</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="text-red-500 border-red-500 hover:bg-red-50 bg-transparent"
                >
                  Clear Cart
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-gray-600">${item.price.toFixed(2)} each</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Path Visualization */}
          {pathSvg && (
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                  Your Optimal Shopping Path
                </h2>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="w-full overflow-auto" dangerouslySetInnerHTML={{ __html: pathSvg }} />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Follow the highlighted path to collect all your items efficiently!
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">${(total * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold text-blue-600">${(total * 1.08).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => generateOptimalPath()}
                disabled={isGeneratingPath}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isGeneratingPath ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Path...
                  </div>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Optimal Path
                  </>
                )}
              </Button>

              {pathSvg && (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => generateOptimalPath("prev")}
                    disabled={isGeneratingPath || collectedCount === 0}
                    variant="outline"
                    className="flex-1"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => generateOptimalPath("next")}
                    disabled={isGeneratingPath || collectedCount >= items.length}
                    variant="outline"
                    className="flex-1"
                  >
                    Next
                  </Button>
                </div>
              )}

              {pathSvg && (
                <div className="text-center text-sm text-gray-600">
                  Collected: {collectedCount} / {items.length} items
                </div>
              )}

              {pathSvg && (
                <div className="text-center text-md">
                  {collectItem !== "EXIT" ? (
                    <span className="text-green-600">Collect: {collectItem}</span>
                  ) : (
                    <span className="text-red-600">Proceed to Checkout</span>
                  )}
                </div>
              )}
            </div>

            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
