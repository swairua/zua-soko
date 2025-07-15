"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sprout,
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  MapPin,
  FileText,
  Car,
  Shield,
} from "lucide-react";

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState("");
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    county: "",
    farmName: "",
    farmSize: "",
    kraPin: "",
    licenseNumber: "",
    vehicleType: "",
    vehicleRegNo: "",
    idNumber: "",
    assignedCounty: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const role = searchParams.get("role");
    if (role) {
      setSelectedRole(role.toUpperCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresPayment) {
          setSuccess(
            "Registration successful! Please pay KES 300 to activate your farmer account.",
          );
          // Redirect to payment page
          setTimeout(() => {
            router.push(`/farmer/activate?phone=${formData.phone}`);
          }, 2000);
        } else if (data.requiresApproval) {
          setSuccess(
            "Registration successful! Your driver application is pending admin approval.",
          );
        } else {
          setSuccess("Registration successful! You can now login.");
          setTimeout(() => router.push("/auth/login"), 2000);
        }
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const roles = [
    {
      value: "CUSTOMER",
      label: "Customer",
      icon: User,
      description: "Buy fresh produce",
    },
    {
      value: "FARMER",
      label: "Farmer",
      icon: Sprout,
      description: "Sell your produce",
    },
    {
      value: "DRIVER",
      label: "Driver",
      icon: Car,
      description: "Deliver products",
    },
    {
      value: "FARMER_AGENT",
      label: "Farmer Agent",
      icon: Shield,
      description: "Help onboard farmers",
    },
  ];

  const counties = [
    "Nairobi",
    "Kiambu",
    "Nakuru",
    "Mombasa",
    "Kisumu",
    "Eldoret",
    "Thika",
    "Malindi",
    "Kitale",
    "Garissa",
    "Kakamega",
    "Machakos",
    "Meru",
    "Nyeri",
    "Kericho",
    "Embu",
  ];

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F36ce27fc004b41f8b60187584af31eda%2Fb55ec5e832e54191b9a5618c290a66ad?format=webp&width=800"
              alt="Zuasoko Logo"
              className="h-12 w-12 object-contain"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Join Zuasoko
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose your role to get started
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => {
                const IconComponent = role.icon;
                return (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
                  >
                    <IconComponent className="h-8 w-8 text-primary-600 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {role.label}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {role.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F36ce27fc004b41f8b60187584af31eda%2Fb55ec5e832e54191b9a5618c290a66ad?format=webp&width=800"
            alt="Zuasoko Logo"
            className="h-12 w-12 object-contain"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Register as {roles.find((r) => r.value === selectedRole)?.label}
        </h2>
        <button
          onClick={() => setSelectedRole("")}
          className="mt-2 mx-auto block text-sm text-primary-600 hover:text-primary-500"
        >
          Change role
        </button>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 input-field"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="+254712345678"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email (Optional)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Role-specific fields */}
            {(selectedRole === "FARMER" ||
              selectedRole === "CUSTOMER" ||
              selectedRole === "FARMER_AGENT") && (
              <div>
                <label
                  htmlFor="county"
                  className="block text-sm font-medium text-gray-700"
                >
                  County
                </label>
                <select
                  id="county"
                  name="county"
                  required
                  value={formData.county}
                  onChange={handleChange}
                  className="mt-1 input-field"
                >
                  <option value="">Select County</option>
                  {counties.map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedRole === "FARMER" && (
              <>
                <div>
                  <label
                    htmlFor="farmName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Farm Name (Optional)
                  </label>
                  <input
                    id="farmName"
                    name="farmName"
                    type="text"
                    value={formData.farmName}
                    onChange={handleChange}
                    className="mt-1 input-field"
                    placeholder="Green Valley Farm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="farmSize"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Farm Size (Acres, Optional)
                  </label>
                  <input
                    id="farmSize"
                    name="farmSize"
                    type="number"
                    step="0.1"
                    value={formData.farmSize}
                    onChange={handleChange}
                    className="mt-1 input-field"
                    placeholder="5.5"
                  />
                </div>
                <div>
                  <label
                    htmlFor="kraPin"
                    className="block text-sm font-medium text-gray-700"
                  >
                    KRA PIN (Optional)
                  </label>
                  <input
                    id="kraPin"
                    name="kraPin"
                    type="text"
                    value={formData.kraPin}
                    onChange={handleChange}
                    className="mt-1 input-field"
                    placeholder="A123456789K"
                  />
                </div>
              </>
            )}

            {selectedRole === "DRIVER" && (
              <>
                <div>
                  <label
                    htmlFor="licenseNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    License Number *
                  </label>
                  <input
                    id="licenseNumber"
                    name="licenseNumber"
                    type="text"
                    required
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="mt-1 input-field"
                    placeholder="DL001234567"
                  />
                </div>
                <div>
                  <label
                    htmlFor="vehicleType"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Vehicle Type *
                  </label>
                  <select
                    id="vehicleType"
                    name="vehicleType"
                    required
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="mt-1 input-field"
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Pickup Truck">Pickup Truck</option>
                    <option value="Van">Van</option>
                    <option value="Small Truck">Small Truck</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="vehicleRegNo"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Vehicle Registration *
                  </label>
                  <input
                    id="vehicleRegNo"
                    name="vehicleRegNo"
                    type="text"
                    required
                    value={formData.vehicleRegNo}
                    onChange={handleChange}
                    className="mt-1 input-field"
                    placeholder="KCA123A"
                  />
                </div>
                <div>
                  <label
                    htmlFor="idNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ID Number *
                  </label>
                  <input
                    id="idNumber"
                    name="idNumber"
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={handleChange}
                    className="mt-1 input-field"
                    placeholder="12345678"
                  />
                </div>
              </>
            )}

            {selectedRole === "FARMER_AGENT" && (
              <div>
                <label
                  htmlFor="assignedCounty"
                  className="block text-sm font-medium text-gray-700"
                >
                  Assigned County *
                </label>
                <select
                  id="assignedCounty"
                  name="assignedCounty"
                  required
                  value={formData.assignedCounty}
                  onChange={handleChange}
                  className="mt-1 input-field"
                >
                  <option value="">Select County</option>
                  {counties.map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 disabled:opacity-50"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </div>

            {selectedRole === "FARMER" && (
              <div className="text-sm text-gray-600 text-center bg-yellow-50 p-3 rounded-md">
                <strong>Note:</strong> Farmer accounts require a KES 300
                activation fee via M-Pesa
              </div>
            )}

            {selectedRole === "DRIVER" && (
              <div className="text-sm text-gray-600 text-center bg-blue-50 p-3 rounded-md">
                <strong>Note:</strong> Driver applications require admin
                approval
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
