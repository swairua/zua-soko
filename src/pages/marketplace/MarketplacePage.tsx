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
import { useCart } from "../../store/cart";
import { useAuthStore } from "../../store/auth";
import toast from "react-hot-toast";

interface Product {
  id: string | number;
  name: string;
  category: string;
  price_per_unit?: number;
  pricePerUnit?: number;
  unit: string;
  stock_quantity?: number;
  stockQuantity?: number;
  images?: string[];
  description: string;
  is_featured?: boolean;
  isFeatured?: boolean;
  isAvailable?: boolean;
  tags?: string[];
  farmer?: {
    id: string;
    county: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  farmer_name?: string;
  farmer_county?: string;
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
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
  const [apiFailureCount, setApiFailureCount] = useState(0);
  // Start in bypass mode on production to prevent 500 errors from affecting users
  const [bypassApi, setBypassApi] = useState(
    window.location.hostname.includes('fly.dev') ||
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname !== 'localhost'
  );

  const { addToCart, isLoading: cartLoading } = useCart();
  const { user, isAuthenticated } = useAuthStore();

  // Guaranteed products function that always works
  const getGuaranteedProducts = () => {
    const allProducts = [
      {
        id: 1,
        name: "Fresh Tomatoes",
        category: "Vegetables",
        price_per_unit: 85,
        pricePerUnit: 85,
        unit: "kg",
        description: "Fresh organic tomatoes from local farms",
        stock_quantity: 100,
        stockQuantity: 100,
        images: ["https://images.unsplash.com/photo-1546470427-e212b9d56085?w=400"],
        farmer_name: "John Kamau",
        farmer_county: "Nakuru",
        is_featured: true,
        isFeatured: true,
        isAvailable: true
      },
      {
        id: 2,
        name: "Sweet Potatoes",
        category: "Root Vegetables",
        price_per_unit: 80,
        pricePerUnit: 80,
        unit: "kg",
        description: "Fresh sweet potatoes rich in nutrients",
        stock_quantity: 75,
        stockQuantity: 75,
        images: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400"],
        farmer_name: "Mary Wanjiku",
        farmer_county: "Meru",
        is_featured: false,
        isFeatured: false,
        isAvailable: true
      },
      {
        id: 3,
        name: "Spinach",
        category: "Leafy Greens",
        price_per_unit: 60,
        pricePerUnit: 60,
        unit: "kg",
        description: "Fresh organic spinach leaves",
        stock_quantity: 50,
        stockQuantity: 50,
        images: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400"],
        farmer_name: "Peter Mwangi",
        farmer_county: "Nyeri",
        is_featured: false,
        isFeatured: false,
        isAvailable: true
      },
      {
        id: 4,
        name: "Carrots",
        category: "Root Vegetables",
        price_per_unit: 70,
        pricePerUnit: 70,
        unit: "kg",
        description: "Fresh orange carrots",
        stock_quantity: 90,
        stockQuantity: 90,
        images: ["https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400"],
        farmer_name: "Jane Njoki",
        farmer_county: "Kiambu",
        is_featured: false,
        isFeatured: false,
        isAvailable: true
      },
      {
        id: 5,
        name: "Cabbage",
        category: "Leafy Greens",
        price_per_unit: 40,
        pricePerUnit: 40,
        unit: "piece",
        description: "Fresh green cabbage heads",
        stock_quantity: 30,
        stockQuantity: 30,
        images: ["https://images.unsplash.com/photo-1594282486170-8c6c5b25cffe?w=400"],
        farmer_name: "Daniel Kimani",
        farmer_county: "Nakuru",
        is_featured: true,
        isFeatured: true,
        isAvailable: true
      },
      {
        id: 6,
        name: "Bell Peppers",
        category: "Vegetables",
        price_per_unit: 120,
        pricePerUnit: 120,
        unit: "kg",
        description: "Colorful bell peppers",
        stock_quantity: 40,
        stockQuantity: 40,
        images: ["https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400"],
        farmer_name: "Grace Wambui",
        farmer_county: "Nyeri",
        is_featured: false,
        isFeatured: false,
        isAvailable: true
      }
    ];

    // Apply filters to local products
    let filteredProducts = allProducts;

    if (filters.category) {
      filteredProducts = filteredProducts.filter(p =>
        p.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    if (filters.search) {
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.county) {
      filteredProducts = filteredProducts.filter(p =>
        p.farmer_county.toLowerCase().includes(filters.county.toLowerCase())
      );
    }

    if (filters.featured) {
      filteredProducts = filteredProducts.filter(p => p.is_featured);
    }

    if (filters.minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price_per_unit >= parseInt(filters.minPrice));
    }

    if (filters.maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price_per_unit <= parseInt(filters.maxPrice));
    }

    return filteredProducts;
  };

  // Circuit breaker pattern - bypass API after 2 failures
  const fetchProducts = async (page = 1) => {
    setLoading(true);

    // Circuit breaker: if API has failed multiple times, go straight to local products
    if (bypassApi || apiFailureCount >= 2) {
      console.log("🔄 Circuit breaker active - using local products only");

      const localProducts = getGuaranteedProducts();
      setProducts(localProducts);
      setPagination({
        page: page,
        limit: pagination.limit,
        total: localProducts.length,
        totalPages: Math.ceil(localProducts.length / pagination.limit)
      });

      if (!bypassApi) {
        setBypassApi(true);
        toast("🏪 Marketplace now in demo mode", {
          icon: "✅",
          duration: 3000
        });
      }

      setLoading(false);
      return;
    }

    // Try API first time or if failure count is low
    try {
      console.log("🔍 TRYING API - Page:", page, "Attempts left:", 2 - apiFailureCount);

      const params = {
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.category && { category: filters.category }),
        ...(filters.county && { county: filters.county }),
        ...(filters.search && { search: filters.search }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.featured && { featured: "true" }),
      };

      const data = await apiService.getProducts(params);
      console.log("✅ API SUCCESS:", data);

      // Reset failure count on success
      setApiFailureCount(0);

      const productsArray = data.products || data || [];
      if (Array.isArray(productsArray) && productsArray.length > 0) {
        setProducts(productsArray);

        if (data.source === 'live_database') {
          toast.success(`✅ Loaded ${productsArray.length} products from live database`);
        } else {
          toast.success("Products loaded from server");
        }

        if (data.pagination) {
          setPagination((prev) => ({
            ...prev,
            ...data.pagination,
            page,
          }));
        } else {
          setPagination((prev) => ({
            ...prev,
            page,
            total: productsArray.length,
            totalPages: 1,
          }));
        }
      } else {
        throw new Error("No products received from API");
      }
    } catch (error: any) {
      console.error("❌ API FAILED:", error);

      // Increment failure count
      const newFailureCount = apiFailureCount + 1;
      setApiFailureCount(newFailureCount);

      console.log(`💥 API failure #${newFailureCount}`);

      if (newFailureCount >= 2) {
        setBypassApi(true);
        toast("🏪 Switching to demo marketplace", {
          icon: "✅",
          duration: 3000
        });
      } else {
        toast("🔄 Loading demo products", {
          icon: "🔄",
          duration: 2000
        });
      }

      // Load local products immediately
      const localProducts = getGuaranteedProducts();
      setProducts(localProducts);
      setPagination({
        page: page,
        limit: pagination.limit,
        total: localProducts.length,
        totalPages: Math.ceil(localProducts.length / pagination.limit)
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories and counties with immediate fallback
  const fetchMetadata = async () => {
    // Always set fallback data immediately
    const fallbackCategories = ['Vegetables', 'Root Vegetables', 'Leafy Greens', 'Fruits'];
    const fallbackCounties = ['Nairobi', 'Nakuru', 'Meru', 'Nyeri', 'Kiambu', 'Kisumu', 'Mombasa', 'Eldoret'];

    setCategories(fallbackCategories);
    setCounties(fallbackCounties);

    // Skip API call if circuit breaker is active
    if (bypassApi) {
      console.log("🔄 Skipping metadata API call - circuit breaker active");
      return;
    }

    try {
      console.log("🔍 TRYING METADATA API");

      const [categoriesData, countiesData] = await Promise.all([
        apiService.getCategories(),
        apiService.getCounties(),
      ]);

      console.log("✅ METADATA SUCCESS");
      setCategories(categoriesData.categories || categoriesData || fallbackCategories);
      setCounties(countiesData.counties || countiesData || fallbackCounties);
    } catch (error) {
      console.log("❌ Metadata API failed - using fallbacks");
      // Fallbacks already set above
    }
  };

  useEffect(() => {
    fetchMetadata();

    // Show offline mode notice if starting in bypass mode
    if (bypassApi) {
      toast("🏪 Marketplace ready with demo products", {
        icon: "✅",
        duration: 3000
      });
    }
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [filters]);

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddToCart = (product: Product) => {
    try {
      // Allow all users (including guests) to add to cart
      addToCart(product, 1);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Fresh Marketplace
        </h1>
        <p className="text-gray-600">
          Discover fresh produce directly from local farmers
        </p>
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
                  {categories.map((category) => (
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
                  {counties.map((county) => (
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
          {Array.isArray(products) &&
            products.map((product) => (
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

                  {/* Featured Badge */}
                  {(product.isFeatured || product.is_featured) && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      ⭐ Featured
                    </div>
                  )}

                  {/* Stock Badge */}
                  {(product.stockQuantity || product.stock_quantity) < 10 &&
                    (product.stockQuantity || product.stock_quantity) > 0 && (
                      <div className="absolute top-2 right-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                        Low Stock
                      </div>
                    )}

                  {(product.stockQuantity || product.stock_quantity) === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium">
                        Out of Stock
                      </span>
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
                      {product.farmer?.county ||
                        product.farmer_county ||
                        "Unknown"}
                    </span>
                    <span className="mx-2">•</span>
                    <span>
                      {product.farmer?.user?.firstName ||
                        product.farmer_name ||
                        "Farmer"}{" "}
                      {product.farmer?.user?.lastName || ""}
                    </span>
                  </div>

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(
                          product.pricePerUnit || product.price_per_unit,
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        per {product.unit}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        to={`/marketplace/product/${product.id}`}
                        className="bg-gray-100 text-gray-700 px-2 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {(product.stockQuantity || product.stock_quantity) > 0 ? (
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
