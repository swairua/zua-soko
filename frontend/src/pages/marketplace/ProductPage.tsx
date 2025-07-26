import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapPin,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ArrowLeft,
  Truck,
  Shield,
  Clock,
  Phone,
  Mail,
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

interface RelatedProduct {
  id: number;
  name: string;
  price_per_unit: number;
  unit: string;
  images: string[];
  farmer_name?: string;
  farmer_county?: string;
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showFarmerContact, setShowFarmerContact] = useState(false);

  const { addToCart, isLoading: cartLoading } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      // Validate product ID before making API call
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error("Invalid product ID");
      }

      // Check if ID is a UUID (any UUID format) - our system now uses integer IDs
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isUUID = uuidPattern.test(id);

      // Check if ID is not a valid integer
      const isValidInteger = /^\d+$/.test(id);

      if (isUUID || !isValidInteger) {
        console.log("🚫 Invalid product ID format detected:", id);
        toast.error("This product link is outdated. Redirecting to marketplace...");
        navigate("/marketplace");
        return;
      }

      const response = await axios.get(`/api/marketplace/products/${id}`);
      const productData = response.data.product || response.data;

      // Transform database response to match component interface
      const transformedProduct = {
        id: productData.id,
        name: productData.name,
        category: productData.category,
        price_per_unit: productData.price_per_unit,
        unit: productData.unit,
        description: productData.description || '',
        stock_quantity: productData.stock_quantity,
        quantity: productData.quantity || productData.stock_quantity,
        images: Array.isArray(productData.images) ? productData.images : [],
        farmer_name: productData.farmer_name || 'Local Farmer',
        farmer_county: productData.farmer_county || 'Kenya',
        created_at: productData.created_at || new Date().toISOString()
      };

      setProduct(transformedProduct);

      // Fetch related products
      if (productData) {
        fetchRelatedProducts(productData.category, productData.farmer.county);
      }
    } catch (error: any) {
      console.error("Failed to fetch product:", error);
      if (error.response?.status === 404) {
        toast.error("Product not found");
        navigate("/marketplace");
      } else {
        toast.error("Failed to load product details");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category: string, county: string) => {
    try {
      const response = await axios.get(
        `/api/marketplace/products?category=${category}&county=${county}&limit=4`,
      );
      const products = response.data.products || response.data;
      const safeProducts = Array.isArray(products) ? products : [];
      setRelatedProducts(safeProducts.filter((p: RelatedProduct) => p?.id !== id));
    } catch (error) {
      console.error("Failed to fetch related products:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }

    if (user?.role !== "CUSTOMER") {
      toast.error("Only customers can add items to cart");
      return;
    }

    if (!product) return;

    try {
      await addToCart(product, quantity);
      setQuantity(1); // Reset quantity after adding
      toast.success(`Added ${product.name} to cart`);
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStockStatus = () => {
    if (!product) return null;

    if (product.stockQuantity === 0) {
      return {
        text: "Out of Stock",
        color: "text-red-600",
        bgColor: "bg-red-100",
      };
    } else if (product.stockQuantity <= (product.minStockLevel || 5)) {
      return {
        text: "Low Stock",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      };
    } else {
      return {
        text: "In Stock",
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Product not found
          </h1>
          <Link
            to="/marketplace"
            className="text-primary-600 hover:text-primary-700 mt-4 inline-block"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link to="/marketplace" className="hover:text-gray-900">
          Marketplace
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div>
          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "/api/placeholder/400/400?text=" +
                    encodeURIComponent(product.name);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📦</div>
                  <span>{product.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-200 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index
                      ? "border-primary-600"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/api/placeholder/100/100?text=" + (index + 1);
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600">{product.category}</p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-500 border border-gray-300 rounded-lg">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Price and Stock */}
          <div className="mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatPrice(product.pricePerUnit)}
              <span className="text-lg font-normal text-gray-600 ml-2">
                per {product.unit}
              </span>
            </div>

            {stockStatus && (
              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bgColor} ${stockStatus.color}`}
                >
                  {stockStatus.text}
                </span>
                <span className="text-gray-600 text-sm">
                  {product.stockQuantity} {product.unit} available
                </span>
              </div>
            )}
          </div>

          {/* Features/Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {product.isFeatured && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                ⭐ Featured
              </span>
            )}
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            {product.harvestDate && (
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Harvest Date
                </span>
                <p className="text-gray-900">
                  {formatDate(product.harvestDate)}
                </p>
              </div>
            )}
            {product.expiryDate && (
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Best Before
                </span>
                <p className="text-gray-900">
                  {formatDate(product.expiryDate)}
                </p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-gray-600">
                Category
              </span>
              <p className="text-gray-900">{product.category}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Unit</span>
              <p className="text-gray-900">{product.unit}</p>
            </div>
          </div>

          {/* Add to Cart */}
          {isAuthenticated &&
            user?.role === "CUSTOMER" &&
            product.stockQuantity > 0 && (
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <label className="text-sm font-medium text-gray-700">
                    Quantity:
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-gray-600 hover:text-gray-900"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stockQuantity}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-16 px-2 py-2 text-center border-0 focus:ring-0"
                    />
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(product.stockQuantity, quantity + 1),
                        )
                      }
                      className="px-3 py-2 text-gray-600 hover:text-gray-900"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    Total: {formatPrice(product.pricePerUnit * quantity)}
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {cartLoading ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            )}

          {/* Delivery Info */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <Truck className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-600">
                  Free delivery over KES 1000
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-600">Delivered within 24h</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-600">Quality guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Farmer Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          About the Farmer
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-primary-600 font-semibold text-lg">
                  {product.farmer.user.firstName[0]}
                  {product.farmer.user.lastName[0]}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {product.farmer.user.firstName} {product.farmer.user.lastName}
                </h4>
                {product.farmer.farmName && (
                  <p className="text-gray-600 text-sm">
                    {product.farmer.farmName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">
                  {product.farmer.subCounty
                    ? `${product.farmer.subCounty}, `
                    : ""}
                  {product.farmer.county}
                </span>
              </div>

              {product.farmer.farmSize && (
                <div>
                  <span className="text-gray-600">
                    Farm Size: {product.farmer.farmSize} acres
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={() => setShowFarmerContact(!showFarmerContact)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium mb-4"
            >
              Contact Farmer
            </button>

            {showFarmerContact && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <a
                    href={`tel:${product.farmer.user.phone}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {product.farmer.user.phone}
                  </a>
                </div>
                {product.farmer.user.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <a
                      href={`mailto:${product.farmer.user.email}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {product.farmer.user.email}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Related Products
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                to={`/marketplace/product/${relatedProduct.id}`}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gray-200">
                  {relatedProduct.images && relatedProduct.images.length > 0 ? (
                    <img
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "/api/placeholder/200/200?text=" +
                          encodeURIComponent(relatedProduct.name);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      📦
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                    {relatedProduct.name}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">
                    {relatedProduct.farmer.county} •{" "}
                    {relatedProduct.farmer.user.firstName}{" "}
                    {relatedProduct.farmer.user.lastName}
                  </p>
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(relatedProduct.pricePerUnit)}
                    <span className="text-xs font-normal text-gray-600 ml-1">
                      /{relatedProduct.unit}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
