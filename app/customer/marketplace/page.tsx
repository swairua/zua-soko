import Link from "next/link";
import { Sprout, ShoppingCart } from "lucide-react";

export default function CustomerMarketplace() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F36ce27fc004b41f8b60187584af31eda%2Fb55ec5e832e54191b9a5618c290a66ad?format=webp&width=800"
                alt="Zuasoko Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Zuasoko Customer
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <ShoppingCart className="h-5 w-5" />
              </button>
              <Link
                href="/auth/logout"
                className="text-gray-700 hover:text-primary-600"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Fresh Produce Marketplace
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Buy directly from farmers across Kenya
          </p>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600">
              The marketplace is currently being populated with fresh produce
              from our farmers. Check back soon for amazing deals on fresh,
              locally-sourced products!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
