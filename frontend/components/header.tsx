"use client"

import Link from "next/link"
import { Search, ShoppingCart, MapPin, User, ChevronDown, Home, Bot, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useState, useEffect, useRef } from "react"
import { allProducts } from "@/lib/data"
import type { Product } from "@/lib/types"
import Image from "next/image"

export default function Header() {
  const { itemCount, total, addItem } = useCart()

  const [selectedLocation, setSelectedLocation] = useState("Colorado")
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const locations = [
    "Colorado",
    "California",
    "New York",
    "Texas",
    "Florida",
    "Illinois",
    "Pennsylvania",
    "Ohio",
    "Georgia",
    "North Carolina",
    "Michigan",
    "New Jersey",
    "Virginia",
    "Washington",
    "Arizona",
  ]

  const locationRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allProducts
        .filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .slice(0, 8) // Limit to 8 results
      setSearchResults(filtered)
      setIsSearchOpen(true)
    } else {
      setSearchResults([])
      setIsSearchOpen(false)
    }
  }, [searchQuery])

  const handleSearchSelect = (product: Product) => {
    setSearchQuery("")
    setIsSearchOpen(false)
    addItem(product)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setIsSearchOpen(false)
  }

  return (
    <header className="bg-[#0053e2] shadow-sm">
      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">pathfinder</h1>
            </div>
          </Link>

          {/* Location */}
          <div className="relative" ref={locationRef}>
            <div
              className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setIsLocationOpen(!isLocationOpen)}
            >
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Your Location</p>
                <p className="font-semibold">{selectedLocation}</p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform ${isLocationOpen ? "rotate-180" : ""}`}
              />
            </div>

            {/* Location Dropdown */}
            {isLocationOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {locations.map((location) => (
                  <div
                    key={location}
                    className={`px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedLocation === location ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"
                    }`}
                    onClick={() => {
                      setSelectedLocation(location)
                      setIsLocationOpen(false)
                    }}
                  >
                    {location}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-20 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
              />
              {searchQuery && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearSearch}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#002e99] hover:bg-[#001e60]"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Results Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-2">
                  <p className="text-sm text-gray-500 px-3 py-2">Search Results ({searchResults.length})</p>
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                      onClick={() => handleSearchSelect(product)}
                    >
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">${product.price.toFixed(2)}</p>
                        <p className="text-xs text-green-600">Add to cart</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isSearchOpen && searchQuery && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 text-center text-gray-500">No products found for "{searchQuery}"</div>
              </div>
            )}
          </div>

          {/* User and Cart */}
          <div className="flex items-center space-x-4">
            {/* Home Button */}
            <Link href="/">
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-[#001e60] transition-colors">
                <Home className="h-6 w-6 text-[#ffffffe6]" />
                <span className="text-sm font-semibold text-[#ffffffe6]">Home</span>
              </Button>
            </Link>

            {/* AI Button */}
            <Link href="/ai">
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-[#001e60] transition-colors">
                <Bot className="h-6 w-6 text-[#ffffffe6]" />
                <span className="text-sm font-semibold text-[#ffffffe6]">AI</span>
              </Button>
            </Link>

            <Button variant="ghost" size="sm" className="hover:bg-[#001e60] transition-colors">
              <User className="h-6 w-6 text-[#ffffffe6]" />
            </Button>

            <Link href="/cart">
              <Button
                variant="ghost"
                className="relative flex items-center space-x-2 hover:bg-[#001e60] transition-colors"
              >
                <ShoppingCart className="h-6 w-6 text-[#ffffffe6]" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#ffffffe6]">${total.toFixed(2)}</p>
                </div>
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-[#ffc220] text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
