import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  Eye,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Check,
  X,
  Tag,
  Search,
  Filter,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import toast from "react-hot-toast";
import { apiService } from "../../services/api";

interface FarmerCategory {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  farmer_count: number;
  created_at: string;
}

interface ModalData {
  type: 'add' | 'edit' | 'delete' | 'view';
  category?: FarmerCategory;
  isOpen: boolean;
}

export default function FarmerCategoriesPage() {
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<FarmerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [modal, setModal] = useState<ModalData>({ type: 'add', isOpen: false });
  const [formData, setFormData] = useState({ name: '', description: '', is_active: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/farmer-categories", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching farmer categories:", error);
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

    setSubmitting(true);
    try {
      let response;
      if (modal.type === 'add') {
        response = await fetch("/api/admin/farmer-categories", {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else if (modal.type === 'edit' && modal.category) {
        response = await fetch(`/api/admin/farmer-categories/${modal.category.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      if (!response?.ok) {
        const errorData = await response?.json();
        throw new Error(errorData.message || 'Operation failed');
      }

      const result = await response.json();
      toast.success(result.message || `Category ${modal.type === 'add' ? 'created' : 'updated'} successfully`);
      
      closeModal();
      fetchCategories();
    } catch (error: any) {
      console.error("Error submitting category:", error);
      toast.error(error.message || `Failed to ${modal.type} category`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!modal.category) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/farmer-categories/${modal.category.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      const result = await response.json();
      toast.success(result.message || 'Category deleted successfully');
      
      closeModal();
      fetchCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error(error.message || 'Failed to delete category');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (type: ModalData['type'], category?: FarmerCategory) => {
    setModal({ type, category, isOpen: true });
    if (type === 'edit' && category) {
      setFormData({
        name: category.name,
        description: category.description,
        is_active: category.is_active,
      });
    } else if (type === 'add') {
      setFormData({ name: '', description: '', is_active: true });
    }
  };

  const closeModal = () => {
    setModal({ type: 'add', isOpen: false });
    setFormData({ name: '', description: '', is_active: true });
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === null || category.is_active === filterActive;
    return matchesSearch && matchesFilter;
  });

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Farmer Categories</h1>
              <p className="text-gray-600 mt-1">
                Manage farming categories that farmers can select during registration
              </p>
            </div>
            <button
              onClick={() => openModal('add')}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Category
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{categories.length}</h3>
                <p className="text-gray-600 text-sm">Total Categories</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {categories.filter(c => c.is_active).length}
                </h3>
                <p className="text-gray-600 text-sm">Active Categories</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <X className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {categories.filter(c => !c.is_active).length}
                </h3>
                <p className="text-gray-600 text-sm">Inactive Categories</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {categories.reduce((sum, c) => sum + (c.farmer_count || 0), 0)}
                </h3>
                <p className="text-gray-600 text-sm">Total Farmers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive(null)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filterActive === null
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterActive(true)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filterActive === true
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterActive(false)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  filterActive === false
                    ? 'bg-yellow-600 text-white border-yellow-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Farmers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {category.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {category.farmer_count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(category.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openModal('view', category)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal('edit', category)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal('delete', category)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete category"
                          disabled={category.farmer_count > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterActive !== null
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first farming category."}
              </p>
              {!searchTerm && filterActive === null && (
                <button
                  onClick={() => openModal('add')}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Create Category
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal */}
        {modal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    modal.type === 'delete' ? 'bg-red-100' : 'bg-primary-100'
                  }`}>
                    {modal.type === 'delete' ? (
                      <Trash2 className="w-5 h-5 text-red-600" />
                    ) : modal.type === 'view' ? (
                      <Eye className="w-5 h-5 text-primary-600" />
                    ) : (
                      <Tag className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {modal.type === 'add' && 'Add New Category'}
                    {modal.type === 'edit' && 'Edit Category'}
                    {modal.type === 'delete' && 'Delete Category'}
                    {modal.type === 'view' && 'Category Details'}
                  </h3>
                </div>

                {modal.type === 'view' && modal.category ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <p className="text-sm text-gray-900">{modal.category.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <p className="text-sm text-gray-900">{modal.category.description || 'No description'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        modal.category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {modal.category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Farmers Using</label>
                      <p className="text-sm text-gray-900">{modal.category.farmer_count || 0} farmers</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                      <p className="text-sm text-gray-900">
                        {new Date(modal.category.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : modal.type === 'delete' && modal.category ? (
                  <div>
                    <p className="text-gray-600 mb-4">
                      Are you sure you want to delete the category "{modal.category.name}"?
                      {modal.category.farmer_count > 0 && (
                        <span className="block mt-2 text-red-600 text-sm">
                          ⚠️ This category is currently used by {modal.category.farmer_count} farmer(s) and cannot be deleted.
                        </span>
                      )}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        rows={3}
                        placeholder="Brief description of this category..."
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                        Active (visible to farmers during registration)
                      </label>
                    </div>
                  </form>
                )}

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    {modal.type === 'view' ? 'Close' : 'Cancel'}
                  </button>
                  
                  {modal.type === 'delete' ? (
                    <button
                      onClick={handleDelete}
                      disabled={submitting || (modal.category?.farmer_count || 0) > 0}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {submitting ? 'Deleting...' : 'Delete'}
                    </button>
                  ) : modal.type !== 'view' ? (
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {submitting ? (modal.type === 'add' ? 'Creating...' : 'Updating...') : (modal.type === 'add' ? 'Create' : 'Update')}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
