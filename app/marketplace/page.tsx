"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ShoppingCart,
  Star,
  MapPin,
  Sprout,
  Plus,
  Minus,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import CartSidebar from "@/components/cart/CartSidebar";
import CartButton from "@/components/cart/CartButton";
import { NoSSR } from "@/components/NoSSR";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  stockQuantity: number;
  images: string[];
  description: string;
  tags: string[];
  farmer: {
    id: string;
    county: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  isFeatured: boolean;
  isApproved: boolean;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

function MarketplaceContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, state } = useCart();

  const handleAddToCart = (product: Product, quantity: number) => {
    addItem({
      id: `cart-${product.id}-${Date.now()}`, // Unique ID for cart item
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.images[0] || "/api/placeholder/300/200?text=Product",
      farmerName: `${product.farmer.user.firstName} ${product.farmer.user.lastName}`,
      maxStock: product.stockQuantity,
      quantity,
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, selectedCounty]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/marketplace/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory,
      );
    }

    if (selectedCounty) {
      filtered = filtered.filter(
        (product) => product.farmer.county === selectedCounty,
      );
    }

    setFilteredProducts(filtered);
  };

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const counties = Array.from(new Set(products.map((p) => p.farmer.county)));
  const featuredProducts = filteredProducts.filter((p) => p.isFeatured);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fresh produce...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F36ce27fc004b41f8b60187584af31eda%2Fb55ec5e832e54191b9a5618c290a66ad?format=webp&width=800"
                alt="Zuasoko Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Zuasoko
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-primary-600"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register?role=farmer"
                className="text-gray-700 hover:text-primary-600"
              >
                Sell Produce
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Fresh Produce Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Buy directly from farmers across Kenya. Fresh, affordable, and
            delivered to your door.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* County Filter */}
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="input-field"
            >
              <option value="">All Counties</option>
              {counties.map((county) => (
                <option key={county} value={county}>
                  {county}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
                setSelectedCounty("");
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  featured
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Products */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            All Products ({filteredProducts.length})
          </h2>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Sprout className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-primary-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Want to sell your produce?
          </h2>
          <p className="text-primary-100 mb-6">
            Join thousands of farmers already selling on Zuasoko
          </p>
          <Link
            href="/auth/register?role=farmer"
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Become a Farmer
          </Link>
        </div>
      </div>

      {/* Cart Components */}
      <CartSidebar />
      <CartButton />
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <NoSSR fallback={<MarketplaceLoadingFallback />}>
      <MarketplaceContent />
    </NoSSR>
  );
}

function MarketplaceLoadingFallback() {
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
                Zuasoko Marketplace
              </span>
            </div>
            <Link href="/" className="text-gray-700 hover:text-primary-600">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Loading content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading marketplace...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  featured = false,
  onAddToCart,
}: {
  product: Product;
  featured?: boolean;
  onAddToCart: (product: Product, quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1); // Reset quantity after adding
  };
  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${featured ? "ring-2 ring-primary-500" : ""}`}
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200">
        {product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sprout className="h-12 w-12 text-gray-400" />
          </div>
        )}
        {featured && (
          <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-semibold">
            Featured
          </div>
        )}
        {product.stockQuantity <= 5 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Low Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{product.category}</p>

        <div className="flex items-center mb-2">
          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-600">{product.farmer.county}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-primary-600">
              KES {(product.price || 0).toLocaleString()}
            </span>
            <span className="text-sm text-gray-600">/{product.unit}</span>
          </div>
          <div className="text-sm text-gray-600">
            {product.stockQuantity} {product.unit} left
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="text-xs text-gray-500 mb-3">
          by {product.farmer.user.firstName} {product.farmer.user.lastName}
        </div>

        {/* Add to Cart Section */}
        <div className="space-y-3">
          {/* Quantity Selector */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium">Quantity:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stockQuantity, quantity + 1))
                }
                disabled={quantity >= product.stockQuantity}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-xs text-gray-500">{product.unit}</span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>
              {product.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
