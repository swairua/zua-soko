import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Search,
  Filter,
  Upload,
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Star,
  Image,
  Save,
  X,
  RefreshCw,
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { apiService } from "../../services/api";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  category: string;
  price_per_unit: number;
  unit: string;
  description: string;
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  farmer_name: string;
  farmer_county: string;
  images: string[];
  created_at: string;
}

interface Order {
  id: number;
  customer_phone: string;
  customer_email: string;
  first_name: string;
  last_name: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  items: any[];
}

interface ProductFormData {
  name: string;
  category: string;
  price_per_unit: string;
  unit: string;
  description: string;
  stock_quantity: string;
  is_featured: boolean;
  farmer_name: string;
  farmer_county: string;
  images: string[];
}

export default function MarketplaceManagementPage() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState("products");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState<Order | null>(null);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category: "",
    price_per_unit: "",
    unit: "kg",
    description: "",
    stock_quantity: "",
    is_featured: false,
    farmer_name: "Admin",
    farmer_county: "Central",
    images: [],
  });

  // Stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    unpaidOrders: 0,
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    filterData();
  }, [searchTerm, statusFilter, categoryFilter, products, orders]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "products") {
        await fetchProducts();
      } else if (activeTab === "orders") {
        await fetchOrders();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log("🛍️ Fetching marketplace products (refresh)");
      const response = await apiService.get("/admin/marketplace/products");

      if (response.data.success) {
        const productData = response.data.products;
        console.log("📦 Setting new product data:", productData);
        setProducts(productData);

        // Update stats
        setStats((prev) => ({
          ...prev,
          totalProducts: productData.length,
          activeProducts: productData.filter((p: Product) => p.is_active)
            .length,
        }));

        console.log("✅ Products state updated successfully");
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      toast.error("Failed to fetch products");
    }
  };

  const fetchOrders = async () => {
    try {
      console.log("📋 Fetching orders");
      const response = await apiService.get("/admin/orders");

      if (response.data.success) {
        const orderData = response.data.orders;
        setOrders(orderData);

        // Update stats
        const totalRevenue = orderData
          .filter((o: Order) => o.payment_status === "PAID")
          .reduce((sum: number, o: Order) => sum + o.total_amount, 0);

        setStats((prev) => ({
          ...prev,
          totalOrders: orderData.length,
          pendingOrders: orderData.filter((o: Order) => o.status === "PENDING")
            .length,
          totalRevenue,
          unpaidOrders: orderData.filter(
            (o: Order) => o.payment_status === "UNPAID",
          ).length,
        }));

        console.log("✅ Orders loaded:", orderData);
      }
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    }
  };

  const filterData = () => {
    if (activeTab === "products") {
      let filtered = products.filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && product.is_active) ||
          (statusFilter === "inactive" && !product.is_active);
        const matchesCategory =
          categoryFilter === "all" || product.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      });
      setFilteredProducts(filtered);
    } else if (activeTab === "orders") {
      let filtered = orders.filter((order) => {
        const matchesSearch =
          order.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_phone.includes(searchTerm) ||
          order.customer_email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || order.status === statusFilter;

        return matchesSearch && matchesStatus;
      });
      setFilteredOrders(filtered);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.price_per_unit) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const productData = {
        ...formData,
        price_per_unit: parseFloat(formData.price_per_unit),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
      };

      console.log("📝 Saving product data:", productData);
      console.log("🔄 Editing existing product:", editingProduct?.id);

      let response;
      if (editingProduct) {
        response = await apiService.post(
          `/admin/marketplace/products/${editingProduct.id}`,
          productData
        );
        toast.success("Product updated successfully");
      } else {
        response = await apiService.post(
          "/admin/marketplace/products",
          productData
        );
        toast.success("Product created successfully");
      }

      if (response.data.success) {
        console.log("✅ Product update response:", response.data);
        setShowProductForm(false);
        setEditingProduct(null);
        resetForm();
        await fetchProducts(); // Wait for refresh to complete
      } else {
        console.error("❌ Product update failed:", response.data);
        toast.error(response.data.message || "Failed to save product");
      }
    } catch (error: any) {
      console.error("❌ Error saving product:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to save product");
      }
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/marketplace/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleEditProduct = (product: Product) => {
    console.log("✏️ Editing product:", product);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price_per_unit: product.price_per_unit.toString(),
      unit: product.unit,
      description: product.description || "",
      stock_quantity: product.stock_quantity.toString(),
      is_featured: product.is_featured || false,
      farmer_name: product.farmer_name || "Admin",
      farmer_county: product.farmer_county || "Central",
      images: product.images || [],
    });
    setShowProductForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      price_per_unit: "",
      unit: "kg",
      description: "",
      stock_quantity: "",
      is_featured: false,
      farmer_name: "Admin",
      farmer_county: "Central",
      images: [],
    });
  };

  const handleSTKPush = async (order: Order) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/orders/${order.id}/stk-push`,
        {
          phone_number: order.customer_phone,
          amount: order.total_amount,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success("STK push initiated successfully");
        fetchOrders();
      }
    } catch (error) {
      console.error("❌ Error initiating STK push:", error);
      toast.error("Failed to initiate STK push");
    }
  };

  const generateInvoice = async (order: Order) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/orders/${order.id}/invoice`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        // Open invoice in new window for printing
        const invoice = response.data.invoice;
        const printWindow = window.open("", "_blank");

        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Invoice ${invoice.invoice_number}</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  .header { text-align: center; margin-bottom: 30px; }
                  .invoice-details { margin-bottom: 20px; }
                  .customer-info { margin-bottom: 20px; }
                  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                  th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                  th { background-color: #f2f2f2; }
                  .total { font-weight: bold; font-size: 18px; }
                  .footer { margin-top: 30px; text-align: center; color: #666; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>Zuasoko Agricultural Platform</h1>
                  <h2>Invoice ${invoice.invoice_number}</h2>
                </div>
                
                <div class="invoice-details">
                  <p><strong>Order ID:</strong> ${invoice.order_id}</p>
                  <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
                  <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> ${invoice.payment_status}</p>
                </div>
                
                <div class="customer-info">
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> ${invoice.customer.name}</p>
                  <p><strong>Phone:</strong> ${invoice.customer.phone}</p>
                  <p><strong>Email:</strong> ${invoice.customer.email}</p>
                  <p><strong>County:</strong> ${invoice.customer.county}</p>
                </div>
                
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${invoice.items
                      .map(
                        (item: any) => `
                      <tr>
                        <td>${item.product_name}</td>
                        <td>${item.quantity}</td>
                        <td>KSh ${item.unit_price?.toLocaleString()}</td>
                        <td>KSh ${(item.total || item.quantity * item.unit_price)?.toLocaleString()}</td>
                      </tr>
                    `,
                      )
                      .join("")}
                  </tbody>
                  <tfoot>
                    <tr class="total">
                      <td colspan="3"><strong>Total Amount</strong></td>
                      <td><strong>KSh ${invoice.total_amount.toLocaleString()}</strong></td>
                    </tr>
                  </tfoot>
                </table>
                
                <div class="footer">
                  <p>Thank you for your business!</p>
                  <p>For any inquiries, contact us at support@zuasoko.com</p>
                </div>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }

        toast.success("Invoice generated successfully");
      }
    } catch (error) {
      console.error("❌ Error generating invoice:", error);
      toast.error("Failed to generate invoice");
    }
  };

  const categories = [
    "Vegetables",
    "Fruits",
    "Grains",
    "Leafy Greens",
    "Root Vegetables",
    "Herbs",
  ];
  const units = ["kg", "pieces", "bunches", "bags", "boxes"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-green-600" />
          <span>Loading marketplace data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Marketplace Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage products, orders, and marketplace operations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchData}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              {activeTab === "products" && (
                <button
                  onClick={() => {
                    resetForm();
                    setEditingProduct(null);
                    setShowProductForm(true);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {stats.totalProducts}
                </h3>
                <p className="text-gray-600 text-sm">Total Products</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {stats.activeProducts}
                </h3>
                <p className="text-gray-600 text-sm">Active Products</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {stats.totalOrders}
                </h3>
                <p className="text-gray-600 text-sm">Total Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  KSh {stats.totalRevenue.toLocaleString()}
                </h3>
                <p className="text-gray-600 text-sm">Total Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: "products", label: "Products", icon: Package },
                { id: "orders", label: "Orders", icon: ShoppingCart },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={
                      activeTab === "products"
                        ? "Search products..."
                        : "Search orders..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Status</option>
                  {activeTab === "products" ? (
                    <>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </>
                  ) : (
                    <>
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </>
                  )}
                </select>

                {activeTab === "products" && (
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Products Tab Content */}
          {activeTab === "products" && (
            <div className="p-6">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    categoryFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Get started by adding your first product"}
                  </p>
                  <button
                    onClick={() => {
                      resetForm();
                      setEditingProduct(null);
                      setShowProductForm(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                  >
                    Add Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="h-48 bg-gray-100 flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No image</p>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-2">
                            {product.name}
                          </h3>
                          {product.is_featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0 ml-2" />
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {product.category}
                        </p>
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-semibold text-green-600">
                            KSh {product.price_per_unit.toLocaleString()}/
                            {product.unit}
                          </span>
                          <span className="text-sm text-gray-600">
                            Stock: {product.stock_quantity}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              product.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.is_active ? "Active" : "Inactive"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {product.farmer_name}
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center space-x-1"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 flex items-center justify-center space-x-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab Content */}
          {activeTab === "orders" && (
            <div className="p-6">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No orders found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Orders will appear here once customers start placing them"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              Order #{order.id}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                order.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {order.status}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                order.payment_status === "PAID"
                                  ? "bg-green-100 text-green-800"
                                  : order.payment_status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {order.payment_status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <p>
                                <strong>Customer:</strong> {order.first_name}{" "}
                                {order.last_name}
                              </p>
                              <p>
                                <strong>Phone:</strong> {order.customer_phone}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>Email:</strong> {order.customer_email}
                              </p>
                              <p>
                                <strong>Amount:</strong> KSh{" "}
                                {order.total_amount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>Date:</strong>{" "}
                                {new Date(
                                  order.created_at,
                                ).toLocaleDateString()}
                              </p>
                              <p>
                                <strong>Items:</strong>{" "}
                                {order.items?.length || 0} products
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => setShowOrderDetails(order)}
                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Details</span>
                          </button>

                          <button
                            onClick={() => generateInvoice(order)}
                            className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 flex items-center space-x-1"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Invoice</span>
                          </button>

                          {order.payment_status === "UNPAID" && (
                            <button
                              onClick={() => handleSTKPush(order)}
                              className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
                            >
                              <Send className="w-4 h-4" />
                              <span>STK Push</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Unit *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price_per_unit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price_per_unit: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock_quantity: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farmer County
                  </label>
                  <input
                    type="text"
                    value={formData.farmer_county}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        farmer_county: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="County"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter product description"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_featured: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Featured Product
                  </span>
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? "Update" : "Create"} Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Order #{showOrderDetails.id} Details
                </h2>
                <button
                  onClick={() => setShowOrderDetails(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Name:</strong> {showOrderDetails.first_name}{" "}
                      {showOrderDetails.last_name}
                    </p>
                    <p>
                      <strong>Phone:</strong> {showOrderDetails.customer_phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {showOrderDetails.customer_email}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Order Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Status:</strong>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          showOrderDetails.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : showOrderDetails.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {showOrderDetails.status}
                      </span>
                    </p>
                    <p>
                      <strong>Payment:</strong>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          showOrderDetails.payment_status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : showOrderDetails.payment_status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {showOrderDetails.payment_status}
                      </span>
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(
                        showOrderDetails.created_at,
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Total:</strong> KSh{" "}
                      {showOrderDetails.total_amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Order Items
                </h3>
                {showOrderDetails.items && showOrderDetails.items.length > 0 ? (
                  <div className="space-y-2">
                    {showOrderDetails.items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            KSh{" "}
                            {(item.unit_price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            @ KSh {item.unit_price}/unit
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No items available</p>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => generateInvoice(showOrderDetails)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Invoice</span>
                </button>

                {showOrderDetails.payment_status === "UNPAID" && (
                  <button
                    onClick={() => {
                      handleSTKPush(showOrderDetails);
                      setShowOrderDetails(null);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send STK Push</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
