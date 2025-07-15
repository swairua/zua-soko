"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sprout, LogOut } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear any stored authentication data
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      sessionStorage.clear();
    }

    // Redirect to homepage after 3 seconds
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleGoHome = () => {
    router.push("/");
  };

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
          You've been logged out
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Thank you for using Zuasoko
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <LogOut className="h-6 w-6 text-green-600" />
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Successfully logged out
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              Your session has been ended securely. You will be redirected to
              the homepage in a few seconds.
            </p>

            <div className="space-y-3">
              <button onClick={handleGoHome} className="w-full btn-primary">
                Go to Homepage
              </button>

              <div className="text-center">
                <span className="text-sm text-gray-500">Or login as:</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/auth/login?role=farmer"
                  className="w-full btn-secondary text-center"
                >
                  Farmer
                </Link>
                <Link
                  href="/auth/login?role=customer"
                  className="w-full btn-secondary text-center"
                >
                  Customer
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/auth/login?role=driver"
                  className="w-full btn-secondary text-center"
                >
                  Driver
                </Link>
                <Link
                  href="/auth/login?role=admin"
                  className="w-full btn-secondary text-center"
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
