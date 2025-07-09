import Image from "next/image"

export default function PathPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Full screen path image */}
      <div className="relative w-full h-screen">
        <Image src="/images/store-path.jpg" alt="Store Navigation Path" fill className="object-cover" priority />

        {/* Optional overlay with instructions */}
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="text-center text-white p-8 bg-black bg-opacity-50 rounded-lg">
            <h1 className="text-4xl font-bold mb-4">Your Shopping Path</h1>
            <p className="text-xl mb-6">Follow the highlighted path to collect your items efficiently</p>
            <div className="text-lg">
              <p className="mb-2">🛒 Start at the entrance</p>
              <p className="mb-2">📍 Follow the blue path markers</p>
              <p className="mb-2">✅ Collect items in order</p>
              <p>🏁 End at checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
