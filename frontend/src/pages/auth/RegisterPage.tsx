import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  Truck,
  Leaf,
  Users,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

interface RegisterFormData {
  // Basic Info
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  confirmPassword: string;
  role: "FARMER" | "CUSTOMER" | "DRIVER" | "FARMER_AGENT";

  // Location
  county: string;

  // Farmer-specific
  farmName?: string;
  farmSize?: number;
  kraPin?: string;
  subCounty?: string;
  categories?: number[]; // Farmer category IDs

  // Driver-specific
  licenseNumber?: string;
  vehicleType?: string;
  vehicleRegNo?: string;
  idNumber?: string;

  // Agent-specific
  assignedCounty?: string;
}

interface FarmerCategory {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

const kenyanCounties = [
  "Nairobi",
  "Mombasa",
  "Kiambu",
  "Nakuru",
  "Machakos",
  "Kajiado",
  "Murang'a",
  "Nyeri",
  "Meru",
  "Embu",
  "Tharaka-Nithi",
  "Kirinyaga",
  "Nyandarua",
  "Laikipia",
  "Samburu",
  "Trans-Nzoia",
  "Uasin-Gishu",
  "Elgeyo-Marakwet",
  "Nandi",
  "Baringo",
  "Kericho",
  "Bomet",
  "Kakamega",
  "Vihiga",
  "Bungoma",
  "Busia",
  "Siaya",
  "Kisumu",
  "Homa Bay",
  "Migori",
  "Kisii",
  "Nyamira",
  "Narok",
  "Turkana",
  "West Pokot",
  "Isiolo",
  "Marsabit",
  "Mandera",
  "Wajir",
  "Garissa",
  "Tana River",
  "Lamu",
  "Taita-Taveta",
  "Kwale",
  "Kilifi",
];

const vehicleTypes = [
  "Motorcycle",
  "Three-wheeler",
  "Pickup Truck",
  "Van",
  "Small Truck",
  "Large Truck",
];

const roles = [
  {
    value: "CUSTOMER",
    label: "Customer",
    description: "Shop for fresh produce from local farmers",
    icon: <User className="w-8 h-8" />,
    color: "bg-blue-500",
  },
  {
    value: "FARMER",
    label: "Farmer",
    description: "Sell your produce directly to customers",
    icon: <Leaf className="w-8 h-8" />,
    color: "bg-green-500",
  },
  {
    value: "DRIVER",
    label: "Driver",
    description: "Deliver products and earn money",
    icon: <Truck className="w-8 h-8" />,
    color: "bg-orange-500",
  },
  {
    value: "FARMER_AGENT",
    label: "Farmer Agent",
    description: "Help farmers join the platform",
    icon: <Users className="w-8 h-8" />,
    color: "bg-purple-500",
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Role Selection, 2: Basic Info, 3: Role-specific Info
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [farmerCategories, setFarmerCategories] = useState<FarmerCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const watchRole = watch("role");
  const watchPassword = watch("password");

  // Fetch farmer categories when component mounts
  useEffect(() => {
    const fetchFarmerCategories = async () => {
      try {
        const response = await axios.get("/api/farmer-categories");
        setFarmerCategories(response.data.categories || []);
      } catch (error) {
        console.error("Failed to fetch farmer categories:", error);
        toast.error("Failed to load farmer categories");
      }
    };

    fetchFarmerCategories();
  }, []);

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate farmer categories
    if (data.role === "FARMER" && selectedCategories.length === 0) {
      toast.error("Please select at least one farming category");
      return;
    }

    setLoading(true);
    try {
      const registrationData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        password: data.password,
        role: data.role,
        county: data.county,
      };

      // Add role-specific fields
      if (data.role === "FARMER") {
        if (data.farmName) registrationData.farmName = data.farmName;
        if (data.farmSize) registrationData.farmSize = data.farmSize;
        if (data.kraPin) registrationData.kraPin = data.kraPin;
        if (data.subCounty) registrationData.subCounty = data.subCounty;
        registrationData.categories = selectedCategories;
      } else if (data.role === "DRIVER") {
        registrationData.licenseNumber = data.licenseNumber;
        registrationData.vehicleType = data.vehicleType;
        registrationData.vehicleRegNo = data.vehicleRegNo;
        registrationData.idNumber = data.idNumber;
      } else if (data.role === "FARMER_AGENT") {
        registrationData.assignedCounty = data.assignedCounty;
      }

      const response = await axios.post("/api/auth/register", registrationData);

      toast.success("Registration successful! Please login to continue.");

      // Show next steps based on role
      if (response.data.requiresPayment) {
        toast("You will need to pay the activation fee after login", {
          icon: "ℹ️",
        });
      }
      if (response.data.requiresApproval) {
        toast("Your application will be reviewed by our team", { icon: "ℹ️" });
      }

      navigate("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      console.log("Error response data:", error.response?.data);
      console.log("Error status:", error.response?.status);
      console.log("Error headers:", error.response?.headers);

      // Enhanced error handling for different response formats
      let message = "Registration failed";

      if (error.response?.data) {
        const data = error.response.data;
        console.log("Full error data object:", data);

        // Try different possible error message fields
        message = data.message || data.error || data.details || data.msg || message;

        // Special handling for 409 conflict errors
        if (error.response.status === 409) {
          if (message.toLowerCase().includes("phone")) {
            message = "This phone number is already registered. Please use a different phone number or try logging in.";
          } else if (message.toLowerCase().includes("email")) {
            message = "This email address is already registered. Please use a different email or try logging in.";
          } else if (message.toLowerCase().includes("user") || message.toLowerCase().includes("exist")) {
            message = "An account with these details already exists. Please try logging in or use different credentials.";
          } else {
            message = `Registration conflict: ${message}`;
          }

          // Show error message with extra duration for 409 conflicts
          toast.error(message, { duration: 8000 });

          // Add a follow-up toast with login suggestion
          setTimeout(() => {
            toast("👆 Click here to go to login page", {
              duration: 5000,
              style: {
                cursor: 'pointer',
                backgroundColor: '#3B82F6',
                color: 'white',
              }
            });
          }, 2000);
          return; // Exit early to avoid duplicate toast
        }
      } else if (error.message) {
        message = error.message;
      }

      console.log("Processed error message:", message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const selectRole = (role: string) => {
    setValue("role", role as any);
    nextStep();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">Z</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`flex items-center ${
                    step >= stepNum ? "text-primary-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step >= stepNum
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {step > stepNum ? <Check className="w-4 h-4" /> : stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div
                      className={`w-16 h-0.5 mx-2 ${
                        step > stepNum ? "bg-primary-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Role</span>
              <span>Info</span>
              <span>Details</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Role Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Choose your role
                </h3>

                <div className="space-y-3">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => selectRole(role.value)}
                      className="w-full p-4 border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
                    >
                      <div className="flex items-center">
                        <div
                          className={`${role.color} text-white p-2 rounded-lg mr-4`}
                        >
                          {role.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {role.label}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Basic Information */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="mr-4 text-gray-400 hover:text-gray-600"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-medium text-gray-900">
                    Basic Information
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^(\+254|0)[7-9]\d{8}$/,
                        message: "Please enter a valid Kenyan phone number",
                      },
                    })}
                    placeholder="+254712345678 or 0712345678"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    This phone number will be used for login and notifications
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    {...register("email", {
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address",
                      },
                    })}
                    type="email"
                    placeholder="your@email.com (optional)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Optional - used for account recovery and important updates
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    County *
                  </label>
                  <select
                    {...register("county", { required: "County is required" })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select County</option>
                    {kenyanCounties.map((county) => (
                      <option key={county} value={county}>
                        {county}
                      </option>
                    ))}
                  </select>
                  {errors.county && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.county.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      type={showPassword ? "text" : "password"}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === watchPassword || "Passwords do not match",
                      })}
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center"
                >
                  Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            )}

            {/* Step 3: Role-specific Information */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="mr-4 text-gray-400 hover:text-gray-600"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-medium text-gray-900">
                    {watchRole === "FARMER" && "Farm Details"}
                    {watchRole === "DRIVER" && "Driver Information"}
                    {watchRole === "FARMER_AGENT" && "Agent Information"}
                    {watchRole === "CUSTOMER" && "Almost Done!"}
                  </h3>
                </div>

                {/* Farmer-specific fields */}
                {watchRole === "FARMER" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Farm Name
                      </label>
                      <input
                        {...register("farmName")}
                        placeholder="e.g., Green Valley Farm"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sub-County
                      </label>
                      <input
                        {...register("subCounty")}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Farm Size (acres)
                      </label>
                      <input
                        {...register("farmSize")}
                        type="number"
                        step="0.1"
                        placeholder="e.g., 5.5"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        KRA PIN
                      </label>
                      <input
                        {...register("kraPin")}
                        placeholder="e.g., A123456789K"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Farming Categories *
                      </label>
                      <p className="text-sm text-gray-600 mb-3">
                        Select one or more categories that describe what you farm:
                      </p>
                      {farmerCategories.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                          {farmerCategories.map((category) => (
                            <label
                              key={category.id}
                              className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(category.id)}
                                onChange={() => toggleCategory(category.id)}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5 mr-3"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">
                                  {category.name}
                                </div>
                                {category.description && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {category.description}
                                  </div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 border border-gray-200 rounded-lg">
                          Loading categories...
                        </div>
                      )}

                      {selectedCategories.length > 0 && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            Selected {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'}:
                            <span className="font-medium ml-1">
                              {farmerCategories
                                .filter(cat => selectedCategories.includes(cat.id))
                                .map(cat => cat.name)
                                .join(', ')}
                            </span>
                          </p>
                        </div>
                      )}

                      {selectedCategories.length === 0 && (
                        <p className="text-sm text-red-600 mt-2">
                          Please select at least one farming category.
                        </p>
                      )}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Activation Fee Required
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              Farmers need to pay a one-time activation fee of
                              KES 300 after registration.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Driver-specific fields */}
                {watchRole === "DRIVER" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Driving License Number *
                      </label>
                      <input
                        {...register("licenseNumber", {
                          required: "License number is required for drivers",
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.licenseNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.licenseNumber.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Type *
                      </label>
                      <select
                        {...register("vehicleType", {
                          required: "Vehicle type is required for drivers",
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select Vehicle Type</option>
                        {vehicleTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.vehicleType && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.vehicleType.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Registration Number *
                      </label>
                      <input
                        {...register("vehicleRegNo", {
                          required:
                            "Vehicle registration number is required for drivers",
                        })}
                        placeholder="e.g., KCA 123X"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.vehicleRegNo && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.vehicleRegNo.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        National ID Number *
                      </label>
                      <input
                        {...register("idNumber", {
                          required: "ID number is required for drivers",
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.idNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.idNumber.message}
                        </p>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            Approval Required
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              Driver applications require verification and
                              approval by our team.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Agent-specific fields */}
                {watchRole === "FARMER_AGENT" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigned County *
                      </label>
                      <select
                        {...register("assignedCounty", {
                          required: "Assigned county is required for agents",
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select County</option>
                        {kenyanCounties.map((county) => (
                          <option key={county} value={county}>
                            {county}
                          </option>
                        ))}
                      </select>
                      {errors.assignedCounty && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.assignedCounty.message}
                        </p>
                      )}
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-purple-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-purple-800">
                            Agent Responsibilities
                          </h3>
                          <div className="mt-2 text-sm text-purple-700">
                            <p>
                              As an agent, you'll help onboard farmers in your
                              assigned county and earn commissions.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer - no additional fields */}
                {watchRole === "CUSTOMER" && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      You're all set!
                    </h3>
                    <p className="text-gray-600">
                      Complete your registration to start shopping for fresh
                      produce.
                    </p>
                  </div>
                )}

                {/* Account conflict notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Account Check
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          If you get an error about existing account, it means this phone number or email is already registered.{" "}
                          <Link to="/login" className="font-medium underline hover:text-blue-900">
                            Try logging in instead
                          </Link>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
