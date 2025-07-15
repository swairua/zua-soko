"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Package,
  DollarSign,
  Camera,
  AlertCircle,
  Loader,
  CheckCircle,
  Sprout,
} from "lucide-react";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  accuracy?: number;
  timestamp: string;
}

export default function NewConsignmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [formData, setFormData] = useState({
    productName: "",
    category: "Vegetables",
    description: "",
    quantity: 0,
    unit: "kg",
    pricePerUnit: 0,
    images: [] as string[],
  });

  const categories = ["Vegetables", "Fruits", "Grains", "Legumes", "Herbs"];
  const units = ["kg", "bunches", "pieces", "bags", "boxes"];

  const handleLocationCapture = () => {
    setLocationStatus("loading");

    if (!navigator.geolocation) {
      setLocationStatus("error");
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        try {
          // In a real app, you'd use a reverse geocoding service like Google Maps API
          // For demo purposes, we'll create a mock address
          const mockAddress = `Farm Location, ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          const locationData: LocationData = {
            latitude,
            longitude,
            address: mockAddress,
            accuracy,
            timestamp: new Date().toISOString(),
          };

          setLocation(locationData);
          setLocationStatus("success");
        } catch (error) {
          console.error("Error getting address:", error);
          setLocationStatus("error");
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationStatus("error");

        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert(
              "Location access denied. Please enable location services and try again.",
            );
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            alert("Location request timed out.");
            break;
          default:
            alert("An unknown error occurred while retrieving location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      alert("Please capture your farm location before submitting.");
      return;
    }

    if (
      !formData.productName ||
      !formData.description ||
      !formData.quantity ||
      !formData.pricePerUnit
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, this would be an API call
      const consignmentData = {
        ...formData,
        totalValue: formData.quantity * formData.pricePerUnit,
        location,
        submittedAt: new Date().toISOString(),
        status: "PENDING",
      };

      console.log("Submitting consignment:", consignmentData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert("Consignment submitted successfully!");
      router.push("/farmer/consignments");
    } catch (error) {
      console.error("Error submitting consignment:", error);
      alert("Failed to submit consignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const totalValue = formData.quantity * formData.pricePerUnit;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/farmer/dashboard" className="flex items-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F36ce27fc004b41f8b60187584af31eda%2Fb55ec5e832e54191b9a5618c290a66ad?format=webp&width=800"
                alt="Zuasoko Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Zuasoko Farmer
              </span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link
                href="/farmer/dashboard"
                className="text-gray-700 hover:text-primary-600"
              >
                Dashboard
              </Link>
              <Link
                href="/farmer/consignments"
                className="text-gray-700 hover:text-primary-600"
              >
                My Consignments
              </Link>
              <Link
                href="/auth/logout"
                className="text-gray-700 hover:text-primary-600"
              >
                Logout
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <Link
              href="/farmer/consignments"
              className="flex items-center text-primary-600 hover:text-primary-700 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Consignments
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            Submit New Consignment
          </h1>
          <p className="text-gray-600 mt-2">
            Add your product details and location for marketplace approval
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Location Capture */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Farm Location
            </h2>

            {!location ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Capture Your Farm Location
                </h3>
                <p className="text-gray-600 mb-6">
                  We need your precise farm location to help customers
                  understand where their food comes from and for delivery
                  planning.
                </p>
                <button
                  type="button"
                  onClick={handleLocationCapture}
                  disabled={locationStatus === "loading"}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center mx-auto"
                >
                  {locationStatus === "loading" ? (
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="h-5 w-5 mr-2" />
                  )}
                  {locationStatus === "loading"
                    ? "Getting Location..."
                    : "Capture Location"}
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-green-800">
                      Location Captured Successfully
                    </h4>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        <strong>Address:</strong> {location.address}
                      </p>
                      <p>
                        <strong>Coordinates:</strong>{" "}
                        {location.latitude.toFixed(6)},{" "}
                        {location.longitude.toFixed(6)}
                      </p>
                      {location.accuracy && (
                        <p>
                          <strong>Accuracy:</strong> ±
                          {location.accuracy.toFixed(0)}m
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleLocationCapture}
                      className="mt-3 text-sm text-green-600 hover:text-green-800"
                    >
                      Update Location
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Product Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.productName}
                  onChange={(e) =>
                    handleInputChange("productName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Organic Tomatoes"
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
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe your product's quality, growing methods, and any special features..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleInputChange("quantity", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <select
                  required
                  value={formData.unit}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Pricing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per {formData.unit} (KES) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.pricePerUnit}
                  onChange={(e) =>
                    handleInputChange("pricePerUnit", Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Value (KES)
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                  KES {totalValue.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Pricing Guidelines:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Research current market prices for your product</li>
                    <li>
                      Consider quality, organic certification, and freshness
                    </li>
                    <li>
                      Admin may suggest price adjustments based on market
                      analysis
                    </li>
                    <li>
                      You can accept, negotiate, or maintain your original price
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/farmer/consignments"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !location}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <Loader className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Package className="h-5 w-5 mr-2" />
              )}
              {isSubmitting ? "Submitting..." : "Submit Consignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
