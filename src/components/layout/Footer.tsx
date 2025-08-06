import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-white">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fd9c4872a6831464dbf1ea37e56217255%2F25be9c7c97144293ad2d62bc18c010f8?format=webp&width=800"
                alt="Zuasoko Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold">Zuasoko</span>
          </div>

          <div className="text-center md:text-right">
            <p className="text-gray-400 text-sm">
              © 2024 Zuasoko. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Connecting farmers and customers across Kenya
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
