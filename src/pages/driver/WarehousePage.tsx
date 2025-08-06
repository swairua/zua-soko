import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Package,
  Plus,
  DollarSign,
  Camera,
  CheckCircle,
  Eye,
  Edit,
  Upload,
  Star,
  Tag,
  Calendar,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import toast from "react-hot-toast";

interface InventoryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  finalPricePerUnit: number;
  images: string[];
  status: string;
  marketplaceProductId?: string;
}

interface ProductForm {
  marketPrice: string;
  description: string;
  images: string[];
  isFeatured: boolean;
  tags: string[];
}

export default function WarehousePage() {
  const { token } = useAuthStore();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>({
    marketPrice: "",
    description: "",
    images: [],
    isFeatured: false,
    tags: [],
  });
  const [newTag, setNewTag] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/warehouse/inventory`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setInventory(response.data.inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to fetch warehouse inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMarketplace = (item: InventoryItem) => {
    setSelectedItem(item);
    setProductForm({
      marketPrice: item.finalPricePerUnit.toString(),
      description: item.description,
      images: item.images,
      isFeatured: false,
      tags: [],
    });
    setShowAddModal(true);
  };

  const addTag = () => {
    if (newTag.trim() && !productForm.tags.includes(newTag.trim())) {
      setProductForm({
        ...productForm,
        tags: [...productForm.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProductForm({
      ...productForm,
      tags: productForm.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const addImageUrl = () => {
    const url = prompt("Enter image URL:");
    if (url && url.trim()) {
      setProductForm({
        ...productForm,
        images: [...productForm.images, url.trim()],
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    setProductForm({
      ...productForm,
      images: productForm.images.filter((_, index) => index !== indexToRemove),
    });
  };

  const submitToMarketplace = async () => {
    if (!selectedItem) return;

    if (!productForm.marketPrice || Number(productForm.marketPrice) <= 0) {
      toast.error("Please enter a valid market price");
      return;
    }

    setProcessing(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/warehouse/add-to-marketplace`,
        {
          consignmentId: selectedItem.id,
          marketPrice: Number(productForm.marketPrice),
          description: productForm.description,
          images: productForm.images,
          isFeatured: productForm.isFeatured,
          tags: productForm.tags,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Product added to marketplace successfully!");
      setShowAddModal(false);
      fetchInventory();

      // Reset form
      setProductForm({
        marketPrice: "",
        description: "",
        images: [],
        isFeatured: false,
        tags: [],
      });
    } catch (error) {
      console.error("Error adding to marketplace:", error);
      toast.error("Failed to add product to marketplace");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading warehouse inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Warehouse Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage delivered produce and add items to marketplace
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="w-4 h-4" />
              <span>Inventory Manager</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {inventory.length}
                </h3>
                <p className="text-gray-600 text-sm">Items in Warehouse</p>
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
                  {inventory.filter((item) => item.marketplaceProductId).length}
                </h3>
                <p className="text-gray-600 text-sm">Added to Marketplace</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Upload className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {
                    inventory.filter((item) => !item.marketplaceProductId)
                      .length
                  }
                </h3>
                <p className="text-gray-600 text-sm">Pending Upload</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Warehouse Inventory
            </h2>
          </div>

          {inventory.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No inventory items
              </h3>
              <p className="text-gray-600">
                Delivered produce will appear here for marketplace processing
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {inventory.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.images.length > 0 ? (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            {item.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
                            <span>
                              {item.quantity} {item.unit}
                            </span>
                            <span>•</span>
                            <span>
                              KSh {item.finalPricePerUnit} per {item.unit}
                            </span>
                            <span>•</span>
                            <span>{item.category}</span>
                          </div>

                          <div className="text-sm">
                            <span className="text-gray-500">Total Value: </span>
                            <span className="font-semibold text-gray-900">
                              KSh{" "}
                              {(
                                item.finalPricePerUnit * item.quantity
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col lg:items-end gap-3">
                      {item.marketplaceProductId ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          On Marketplace
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          <Upload className="w-4 h-4" />
                          Ready to Upload
                        </div>
                      )}

                      {!item.marketplaceProductId ? (
                        <button
                          onClick={() => handleAddToMarketplace(item)}
                          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add to Marketplace
                        </button>
                      ) : (
                        <button
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                          disabled
                        >
                          <Eye className="w-4 h-4" />
                          View on Marketplace
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add to Marketplace Modal */}
        {showAddModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Add to Marketplace
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {selectedItem.title}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Market Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Market Price (KSh per {selectedItem.unit}) *
                  </label>
                  <input
                    type="number"
                    value={productForm.marketPrice}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        marketPrice: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter market price"
                    min="1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Farmer price: KSh {selectedItem.finalPricePerUnit} per{" "}
                    {selectedItem.unit}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Market Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enhance the product description for customers"
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                  </label>
                  <div className="space-y-3">
                    {productForm.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {productForm.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={addImageUrl}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors"
                    >
                      <Camera className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-600">
                        Add Image URL
                      </span>
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Tags
                  </label>
                  <div className="space-y-3">
                    {productForm.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {productForm.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="text-primary-600 hover:text-primary-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addTag()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Add a tag (e.g., organic, fresh)"
                      />
                      <button
                        onClick={addTag}
                        className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Tag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Featured */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          isFeatured: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Mark as Featured Product
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Featured products appear prominently on the marketplace
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitToMarketplace}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={processing}
                  >
                    {processing ? "Adding..." : "Add to Marketplace"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
