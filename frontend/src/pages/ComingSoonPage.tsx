import React from "react";
import { Clock, Rocket, Star, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface ComingSoonPageProps {
  title?: string;
  description?: string;
  features?: string[];
}

export default function ComingSoonPage({
  title = "Coming Soon",
  description = "This feature is currently under development and will be available soon.",
  features = [],
}: ComingSoonPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-10 h-10 text-primary-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">{description}</p>

          {/* Features List */}
          {features.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                Coming Features:
              </h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 flex items-center"
                  >
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center text-blue-700">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                Expected Launch: Coming Soon
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>

            <Link
              to="/"
              className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              We're working hard to bring you the best experience.
              <br />
              Thank you for your patience!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
