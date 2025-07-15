"use client";

import Link from "next/link";

export default function NotFound() {
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
          Page Not Found
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          The page you're looking for doesn't exist.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-primary-600">404</h1>
              <p className="mt-4 text-lg text-gray-600">
                Sorry, we couldn't find what you're looking for.
              </p>
            </div>

            <div className="flex flex-col space-y-4">
              <Link href="/" className="btn-primary text-center">
                Go Home
              </Link>
              <Link href="/marketplace" className="btn-secondary text-center">
                Browse Marketplace
              </Link>
              <Link href="/auth/register" className="btn-secondary text-center">
                Join Zuasoko
              </Link>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Need help?{" "}
                <a
                  href="mailto:support@zuasoko.com"
                  className="text-primary-600 hover:text-primary-500"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
