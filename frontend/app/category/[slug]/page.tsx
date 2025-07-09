import { notFound } from "next/navigation"
import Sidebar from "@/components/sidebar"
import ProductCard from "@/components/product-card"
import { categories, getProductsByCategory, sampleProducts } from "@/lib/data"

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = categories.find((cat) => cat.slug === params.slug)

  if (!category) {
    notFound()
  }

  // For demo purposes, we'll show sample products for each category
  const products =
    getProductsByCategory(category.slug).length > 0 ? getProductsByCategory(category.slug) : sampleProducts.slice(0, 8) // Show sample products if category is empty

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          <p className="text-gray-600">Discover our wide selection of {category.name.toLowerCase()} products</p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found in this category.</p>
            <p className="text-gray-400">Check back soon for new arrivals!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }))
}
