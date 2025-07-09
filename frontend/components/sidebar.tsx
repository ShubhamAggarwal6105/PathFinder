"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { categories } from "@/lib/data"
import { Button } from "@/components/ui/button"

export default function Sidebar() {
  return (
    <aside className="w-80 bg-white shadow-sm">
      <div className="p-4">
        <Button className="w-full bg-[#002e99] hover:bg-[#001e60] text-white rounded-full py-3 mb-4">
           ALL CATEGORIES
        </Button>

        <nav className="space-y-1">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg group transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium">{category.name}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
