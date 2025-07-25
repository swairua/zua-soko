import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  XCircle,
  Tag,
  Search,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import toast from "react-hot-toast";

interface FarmerCategory {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  farmer_count: number;
}

interface CategoryForm {
  name: string;
  description: string;
  is_active: boolean;
}

export default function FarmerCategoriesPage() {
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<FarmerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FarmerCategory | null>(null);
  const [formData, setFormData] = useState<CategoryForm>({
    name: "",
    description: "",
    is_active: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/admin/farmer-categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch farmer categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setProcessing(true);

    try {
      if (editingCategory) {
        // Update existing category
        await axios.put(
          `/api/admin/farmer-categories/${editingCategory.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Category updated successfully");
      } else {
        // Create new category
        await axios.post("/api/admin/farmer-categories", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Category created successfully");
      }

      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: "", description: "", is_active: true });
      fetchCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      const message = error.response?.data?.message || "Failed to save category";
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = (category: FarmerCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      is_active: category.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await axios.delete(`/api/admin/farmer-categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      const message = error.response?.data?.message || "Failed to delete category";
      toast.error(message);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading farmer categories...</p>
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
                Farmer Categories
              </h1>
              <p className="text-gray-600 mt-1">
                Manage categories that farmers can select during registration
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null);
                setFormData({ name: "", description: "", is_active: true });
                setShowModal(true);
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  {category.is_active ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>

              {category.description && (
                <p className="text-gray-600 text-sm mb-4">
                  {category.description}
                </p>
              )}

              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{category.farmer_count} farmers</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  disabled={category.farmer_count > 0}
                  className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title={category.farmer_count > 0 ? "Cannot delete category with assigned farmers" : "Delete category"}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No categories found" : "No categories yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? "Try adjusting your search criteria"
                : "Create your first farmer category to get started"
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setFormData({ name: "", description: "", is_active: true });
                  setShowModal(true);
                }}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add First Category
              </button>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Vegetables"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Brief description of this category"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({ ...formData, is_active: e.target.checked })
                        }
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Active (visible to farmers during registration)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={processing}
                  >
                    {processing 
                      ? "Saving..." 
                      : editingCategory 
                        ? "Update Category" 
                        : "Add Category"
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
