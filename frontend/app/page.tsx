"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Sidebar from "@/components/sidebar"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { getTrendingProducts, getOfferProducts } from "@/lib/data"

export default function HomePage() {
  const trendingProducts = getTrendingProducts()
  const offerProducts = getOfferProducts()

// Carousel state
  const [currentSlide, setCurrentSlide] = useState(0)
  const carouselImages = [
    "/images/c1.jpg",
    "/images/c2.gif",
    "/images/f3.png",
    "/images/c4.png",
  ]

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 4000) // Change slide every 4 seconds

    return () => clearInterval(timer)
  }, [carouselImages.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
  }



  return (
    <div className="flex">
      {/* Sidebar with promotional images */}
      <div className="w-80 flex flex-col">
        <Sidebar />

        {/* Simple Images Section */}
        <div className="p-4 space-y-4">
          {/* Image 1 */}
          <div className="rounded-xl overflow-hidden cursor-pointer">
            <Image
              src="/images/d1.png"
              alt="Promotional Banner 1"
              width={320}
              height={400}
              className="object-cover w-full h-45"
            />
          </div>

          {/* Image 2 */}
          <div className="rounded-xl overflow-hidden cursor-pointer">
            <Image
              src="/images/d2.png"
              alt="Promotional Banner 2"
              width={320}
              height={400}
              className="object-cover w-full h-45"
            />
          </div>

          {/* Image 3 */}
          <div className="rounded-xl overflow-hidden cursor-pointer">
            <Image
              src="/images/d3.png"
              alt="Promotional Banner 3"
              width={320}
              height={400}
              className="object-cover w-full h-45"
            />
          </div>

          {/* Image 4 */}
          
        </div>
      </div>

      <div className="flex-1 p-6">
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-r from-blue-50 to-yellow-50 rounded-2xl p-8 mb-8 overflow-hidden">
          <div className="relative z-10">
            <div className="max-w-2xl">
              <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                EXCLUSIVE OFFER -20% OFF
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Specialist in the grocery store</h1>
              <p className="text-gray-600 mb-6">Only this week. Don't miss...</p>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-gray-600">from</span>
                <span className="text-4xl font-bold text-red-500">$7.99</span>
              </div>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full">Shop Now</Button>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-1/2 h-full">
            <Image
              src="/images/heroban.jpg"
              alt="Grocery items"
              width={600}
              height={400}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Carousel and Offer Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Carousel - Takes 2/3 width */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden shadow-lg">
            <div className="relative h-64 w-full">
              {carouselImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Carousel slide ${index + 1}`}
                    width={800}
                    height={256}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Single Offer Image - Takes 1/3 width */}
          <div className="relative rounded-2xl overflow-hidden cursor-pointer">
            <Image
              src="/images/offer1.png"
              alt="Special Offer"
              width={400}
              height={256}
              className="object-cover w-full h-64"
            />
          </div>
        </div>

        {/* Best Sellers */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">BEST SELLERS</h2>
              <p className="text-gray-600">Do not miss the current offers until the end of March.</p>
            </div>
            <Link href="/best-sellers">
              <Button variant="outline" className="text-blue-500 border-blue-500 hover:bg-blue-50 bg-transparent">
                View All →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Special Offers */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">SPECIAL OFFERS</h2>
              <p className="text-gray-600">Limited time deals you don't want to miss.</p>
            </div>
            <Link href="/offers">
              <Button variant="outline" className="text-blue-500 border-blue-500 hover:bg-blue-50 bg-transparent">
                View All →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
