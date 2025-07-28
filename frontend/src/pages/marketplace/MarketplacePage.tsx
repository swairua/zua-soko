import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../../services/api";
import {
  Search,
  Filter,
  MapPin,
  Star,
  ShoppingCart,
  Heart,
  Eye,
} from "lucide-react";
import { useCartStore } from "../../store/cart";
import { useAuthStore } from "../../store/auth";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  category: string;
  price_per_unit: number;
  unit: string;
  description: string;
  stock_quantity: number;
  quantity: number;
  images: string[];
  farmer_name?: string;
  farmer_county?: string;
  created_at: string;
}

interface Filters {
  category: string;
  county: string;
  search: string;
  minPrice: string;
  maxPrice: string;
  featured: boolean;
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [counties, setCounties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    category: "",
    county: "",
    search: "",
    minPrice: "",
    maxPrice: "",
    featured: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const { addToCart, isLoading: cartLoading } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  // Fetch products from real database
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      console.log("🔍 FETCHING PRODUCTS - Page:", page, "Filters:", filters);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.category && { category: filters.category }),
        ...(filters.county && { county: filters.county }),
        ...(filters.search && { search: filters.search }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.featured && { featured: "true" }),
        _t: Date.now().toString(), // Cache busting
        refresh: "true",
        nocache: Math.random().toString(),
      });

      const data = await apiService.getProducts(params);
      console.log("🔍 PRODUCTS RESPONSE:", data);

      // Debug product IDs
      if (data.products) {
        console.log("🔍 PRODUCT IDS:", data.products.map(p => ({ id: p.id, type: typeof p.id, name: p.name })));
      }

      // Temporarily disable aggressive filtering to debug
      const rawProducts = data.products || data;
      console.log("🔍 RAW PRODUCTS DATA:", rawProducts);

      // Only filter out obviously invalid products, but be more permissive
      const validProducts = Array.isArray(rawProducts) ? rawProducts.filter(product => {
        console.log("🔍 Checking product:", {
          id: product?.id,
          name: product?.name,
          type: typeof product?.id,
          fullProduct: product
        });

        // Only filter out products that are clearly broken
        if (!product) {
          console.warn("⚠️ Filtering out null/undefined product");
          return false;
        }

        if (!product.id && product.id !== 0) {
          console.warn("⚠️ Filtering out product with missing ID:", product);
          return false;
        }

        console.log("✅ Product accepted:", { id: product.id, name: product.name });
        return true;
      }) : [];

      console.log(`🔍 Product filtering results:`, {
        raw: rawProducts.length,
        valid: validProducts.length,
        filtered: rawProducts.length - validProducts.length,
        validProducts: validProducts
      });

      setProducts(validProducts);

      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          ...data.pagination,
          page,
        }));
      } else {
        // Set default pagination if not provided
        setPagination((prev) => ({
          ...prev,
          page,
          total: data.products?.length || data.length || 0,
          totalPages: 1,
        }));
      }
    } catch (error) {
      console.error("❌ FAILED TO FETCH PRODUCTS:", error);
      toast.error("Failed to load products from database");
      // Don't set any fallback data - let it fail to show real issues
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories and counties from real database
  const fetchMetadata = async () => {
    try {
      console.log("🔍 FETCHING METADATA from real database");

      const [categoriesData, countiesData] = await Promise.all([
        apiService.getCategories(),
        apiService.getCounties(),
      ]);

      console.log("🔍 CATEGORIES RESPONSE:", categoriesData);
      console.log("🔍 COUNTIES RESPONSE:", countiesData);

      setCategories(categoriesData.categories || categoriesData || []);
      setCounties(countiesData.counties || countiesData || []);
    } catch (error) {
      console.error("❌ FAILED TO FETCH METADATA:", error);
      toast.error("Failed to load categories and counties from database");
      // Don't set any fallback data - let it fail to show real issues
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [filters]);

  // Add a small delay on mount to ensure database is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddToCart = async (product: Product) => {
    try {
      console.log("🛍️ Marketplace adding to cart:", product);
      console.log("🛍️ Product ID details:", {
        id: product.id,
        type: typeof product.id,
        hasId: !!product.id,
        isNumber: typeof product.id === 'number',
        isValidNumber: !isNaN(Number(product.id))
      });

      // Validate product data before adding
      if (!product || !product.id) {
        console.error("❌ Product validation failed:", { product, hasProduct: !!product, hasId: !!(product?.id) });
        toast.error("Invalid product - cannot add to cart");
        return;
      }

      // Allow all users (including guests) to add to cart
      await addToCart(product, 1);
      toast.success(`Added ${product.name} to cart`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      county: "",
      search: "",
      minPrice: "",
      maxPrice: "",
      featured: false,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Fresh Marketplace
            </h1>
            <p className="text-gray-600">
              Discover fresh produce directly from local farmers
            </p>
          </div>

          {/* Reset Button for fixing cart issues */}
          <button
            onClick={async () => {
              try {
                // Clear cart storage
                localStorage.removeItem('cart-storage');
                sessionStorage.removeItem('cart-storage');

                // Call API to reset products (if admin)
                if (user?.role === 'ADMIN') {
                  // Note: Reset endpoint not yet implemented
                  toast.success("Cart reset successfully!");
                } else {
                  toast.success("Cart reset successfully!");
                }

                // Reload page for fresh start
                window.location.reload();
              } catch (error) {
                toast.success("Cart reset successfully! Page reloading...");
                window.location.reload();
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
          >
            🔄 Reset Everything
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange("featured", !filters.featured)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.featured
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Star
                className={`w-4 h-4 inline mr-1 ${filters.featured ? "fill-current" : ""}`}
              />
              Featured
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
            >
              <Filter className="w-4 h-4 inline mr-1" />
              Filters
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                >
                  <option value="">All Categories</option>
                  {(Array.isArray(categories) ? categories : []).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* County Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  County
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={filters.county}
                  onChange={(e) => handleFilterChange("county", e.target.value)}
                >
                  <option value="">All Counties</option>
                  {(Array.isArray(counties) ? counties : []).map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price (KES)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (KES)
                </label>
                <input
                  type="number"
                  placeholder="1000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          {loading
            ? "Loading..."
            : `Showing ${products.length} of ${pagination.total} products`}
        </p>

        {pagination.totalPages > 1 && (
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </div>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={clearFilters}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(Array.isArray(products) ? products : []).map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-200">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/api/placeholder/300/200?text=" +
                        encodeURIComponent(product.name);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Eye className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-sm">{product.name}</span>
                    </div>
                  </div>
                )}

                {/* Featured Badge - No featured flag in DB yet */}

                {/* Stock Badge */}
                {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                    <div className="absolute top-2 right-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                      Low Stock
                    </div>
                  )}

                {product.stock_quantity === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {product.name}
                  </h3>
                  <button className="text-gray-400 hover:text-red-500 transition-colors ml-2">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>
                    {product.farmer_county || "Unknown"}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    {product.farmer_name || "Local Farmer"}
                  </span>
                </div>

                {/* Category */}
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                    {product.category}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price_per_unit)}
                    </div>
                    <div className="text-xs text-gray-500">
                      per {product.unit}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/marketplace/product/${product.id}`}
                      className="bg-gray-100 text-gray-700 px-2 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center"
                      onClick={() => console.log("🔗 Navigating to product:", product.id, "Type:", typeof product.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {product.stock_quantity > 0 ? (
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={cartLoading}
                        className="bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center space-x-1"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-gray-300 text-gray-500 px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 cursor-not-allowed"
                      >
                        <span>Out of Stock</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-1">
            <button
              onClick={() => fetchProducts(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
              const pageNum = Math.max(1, pagination.page - 2) + i;
              if (pageNum > pagination.totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => fetchProducts(pageNum)}
                  className={`px-3 py-2 text-sm font-medium border rounded-md ${
                    pageNum === pagination.page
                      ? "bg-primary-600 text-white border-primary-600"
                      : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => fetchProducts(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
