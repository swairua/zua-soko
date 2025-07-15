"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Store,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  ShoppingCart,
  Tag,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  stockQuantity: number;
  isApproved: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  images: string[];
  farmer: {
    id: string;
    name: string;
    county: string;
  };
  totalSales: number;
  totalRevenue: number;
  createdAt: string;
}

interface Order {
  id: string;
  customerName: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  createdAt: string;
}

export default function ShopManagePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<
    "products" | "orders" | "categories"
  >("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading shop data
    setTimeout(() => {
      const mockProducts: Product[] = [
        {
          id: "PROD001",
          name: "Organic Tomatoes",
          category: "Vegetables",
          description: "Fresh organic tomatoes, Grade A quality",
          price: 130,
          unit: "kg",
          stockQuantity: 85,
          isApproved: true,
          isAvailable: true,
          isFeatured: true,
          images: ["/api/placeholder/300/200?text=Tomatoes"],
          farmer: {
            id: "FARM001",
            name: "Jane Wanjiku",
            county: "Kiambu",
          },
          totalSales: 245,
          totalRevenue: 31850,
          createdAt: "2024-01-15T10:30:00Z",
        },
        {
          id: "PROD002",
          name: "Fresh Spinach",
          category: "Vegetables",
          description: "Locally grown spinach, pesticide-free",
          price: 80,
          unit: "kg",
          stockQuantity: 45,
          isApproved: true,
          isAvailable: true,
          isFeatured: false,
          images: ["/api/placeholder/300/200?text=Spinach"],
          farmer: {
            id: "FARM002",
            name: "Peter Mwangi",
            county: "Nakuru",
          },
          totalSales: 156,
          totalRevenue: 12480,
          createdAt: "2024-01-14T09:15:00Z",
        },
        {
          id: "PROD003",
          name: "Sweet Carrots",
          category: "Vegetables",
          description: "Sweet and crunchy carrots",
          price: 90,
          unit: "kg",
          stockQuantity: 0,
          isApproved: true,
          isAvailable: false,
          isFeatured: false,
          images: ["/api/placeholder/300/200?text=Carrots"],
          farmer: {
            id: "FARM003",
            name: "Mary Njeri",
            county: "Meru",
          },
          totalSales: 89,
          totalRevenue: 8010,
          createdAt: "2024-01-13T14:20:00Z",
        },
      ];

      const mockOrders: Order[] = [
        {
          id: "ORD001",
          customerName: "John Doe",
          items: [
            { productName: "Organic Tomatoes", quantity: 2, price: 130 },
            { productName: "Fresh Spinach", quantity: 1, price: 80 },
          ],
          totalAmount: 340,
          status: "PENDING",
          createdAt: "2024-01-16T10:30:00Z",
        },
        {
          id: "ORD002",
          customerName: "Jane Smith",
          items: [{ productName: "Sweet Carrots", quantity: 1, price: 90 }],
          totalAmount: 90,
          status: "DELIVERED",
          createdAt: "2024-01-16T09:15:00Z",
        },
      ];

      setProducts(mockProducts);
      setOrders(mockOrders);
      setFilteredProducts(mockProducts);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory,
      );
    }

    if (selectedStatus === "available") {
      filtered = filtered.filter((product) => product.isAvailable);
    } else if (selectedStatus === "out_of_stock") {
      filtered = filtered.filter((product) => product.stockQuantity === 0);
    } else if (selectedStatus === "featured") {
      filtered = filtered.filter((product) => product.isFeatured);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedStatus]);

  const handleToggleAvailability = (productId: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, isAvailable: !product.isAvailable }
          : product,
      ),
    );
  };

  const handleToggleFeatured = (productId: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, isFeatured: !product.isFeatured }
          : product,
      ),
    );
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "IN_TRANSIT":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const totalProducts = products.length;
  const availableProducts = products.filter((p) => p.isAvailable).length;
  const outOfStockProducts = products.filter(
    (p) => p.stockQuantity === 0,
  ).length;
  const featuredProducts = products.filter((p) => p.isFeatured).length;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Shop</h1>
              <p className="text-gray-600 mt-2">
                Manage products, orders, and shop settings
              </p>
            </div>
            <button className="btn-primary flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "products", name: "Products", icon: Package },
                { id: "orders", name: "Orders", icon: ShoppingCart },
                { id: "categories", name: "Categories", icon: Tag },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Products
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalProducts}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Available
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {availableProducts}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Out of Stock
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {outOfStockProducts}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Featured
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {featuredProducts}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="">All Status</option>
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="featured">Featured</option>
                </select>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setSelectedStatus("");
                  }}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Products ({filteredProducts.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Farmer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price & Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={product.images[0]}
                                alt={product.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                                {product.isFeatured && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Featured
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.farmer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.farmer.county}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            KES {product.price}/{product.unit}
                          </div>
                          <div
                            className={`text-sm ${
                              product.stockQuantity === 0
                                ? "text-red-600"
                                : "text-gray-500"
                            }`}
                          >
                            Stock: {product.stockQuantity} {product.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.totalSales} sales
                          </div>
                          <div className="text-sm text-gray-500">
                            KES {product.totalRevenue.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                product.isAvailable
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {product.isAvailable
                                ? "Available"
                                : "Unavailable"}
                            </span>
                            {product.stockQuantity === 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleFeatured(product.id)}
                              className={`p-2 rounded ${
                                product.isFeatured
                                  ? "text-yellow-600 hover:bg-yellow-50"
                                  : "text-gray-400 hover:bg-gray-50"
                              }`}
                              title="Toggle Featured"
                            >
                              <TrendingUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleAvailability(product.id)
                              }
                              className={`p-2 rounded ${
                                product.isAvailable
                                  ? "text-green-600 hover:bg-green-50"
                                  : "text-red-600 hover:bg-red-50"
                              }`}
                              title="Toggle Availability"
                            >
                              {product.isAvailable ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Orders ({orders.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.items.length} item(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        KES {order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Product Categories
                </h2>
                <button className="btn-primary flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {category}
                    </h3>
                    <div className="flex space-x-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Products:</span>
                      <span className="font-medium">
                        {products.filter((p) => p.category === category).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium">
                        {
                          products.filter(
                            (p) => p.category === category && p.isAvailable,
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
