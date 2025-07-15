"use client";

import { useState, useEffect } from "react";
import {
  Smartphone,
  Chrome,
  Download,
  Menu,
  Home,
  Share,
  X,
} from "lucide-react";

export function MobileInstallGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOS, setSelectedOS] = useState<"android" | "ios">("android");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const AndroidInstructions = () => (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-2 flex items-center">
          <Chrome className="h-5 w-5 mr-2" />
          Option 1: Chrome Browser (Recommended)
        </h4>
        <ol className="text-sm text-green-700 space-y-2 list-decimal list-inside">
          <li>
            Open Zuasoko in <strong>Chrome browser</strong>
          </li>
          <li>
            Look for the <strong>"Install app"</strong> popup at the bottom
          </li>
          <li>
            Tap <strong>"Install"</strong> or{" "}
            <strong>"Add to Home Screen"</strong>
          </li>
          <li>The app will be added to your home screen like a native app!</li>
        </ol>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
          <Menu className="h-5 w-5 mr-2" />
          Option 2: Manual Installation
        </h4>
        <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
          <li>Open Zuasoko in any browser</li>
          <li>
            Tap the <Menu className="h-4 w-4 inline" /> menu (3 dots) in browser
          </li>
          <li>
            Select <strong>"Add to Home screen"</strong> or{" "}
            <strong>"Install app"</strong>
          </li>
          <li>Choose a name (default: "Zuasoko")</li>
          <li>
            Tap <strong>"Add"</strong>
          </li>
        </ol>
      </div>
    </div>
  );

  const IOSInstructions = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
          <Share className="h-5 w-5 mr-2" />
          Safari Browser Installation
        </h4>
        <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
          <li>
            Open Zuasoko in <strong>Safari browser</strong>
          </li>
          <li>
            Tap the <Share className="h-4 w-4 inline" /> Share button at the
            bottom
          </li>
          <li>
            Scroll down and tap <strong>"Add to Home Screen"</strong>
          </li>
          <li>Edit the name if needed (default: "Zuasoko")</li>
          <li>
            Tap <strong>"Add"</strong> in the top right
          </li>
        </ol>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">
          ⚠️ Important for iOS
        </h4>
        <p className="text-sm text-yellow-700">
          You must use <strong>Safari browser</strong> for iOS installation.
          Chrome and other browsers don't support PWA installation on iOS.
        </p>
      </div>
    </div>
  );

  // Don't render during SSR
  if (!isClient) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors z-40"
        aria-label="Mobile app installation guide"
      >
        <Smartphone className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-lg sm:rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center">
            <Download className="h-5 w-5 mr-2 text-primary-600" />
            Install Mobile App
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-600 mb-4">
            Install Zuasoko as a mobile app for the best experience with offline
            access, push notifications, and faster loading.
          </p>

          {/* OS Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setSelectedOS("android")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedOS === "android"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Android
            </button>
            <button
              onClick={() => setSelectedOS("ios")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedOS === "ios"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              iOS (iPhone/iPad)
            </button>
          </div>

          {/* Instructions */}
          {selectedOS === "android" ? (
            <AndroidInstructions />
          ) : (
            <IOSInstructions />
          )}

          {/* Benefits */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">App Benefits:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Works offline for browsing</li>
              <li>• Push notifications for orders</li>
              <li>• Faster loading times</li>
              <li>• Native app experience</li>
              <li>• Easy access from home screen</li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full mt-4 btn-primary"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
