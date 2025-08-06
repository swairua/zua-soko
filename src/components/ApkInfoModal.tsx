import React from "react";
import {
  X,
  Download,
  Smartphone,
  Shield,
  Clock,
  HardDrive,
  Wifi,
  Camera,
  MapPin,
  Bell,
  Star,
  CheckCircle,
} from "lucide-react";

interface AppInfo {
  version: string;
  versionCode: number;
  size: string;
  releaseDate: string;
  releaseNotes: string[];
  features: string[];
  minAndroidVersion: string;
  targetAndroidVersion: string;
  permissions: string[];
  screenshots: string[];
  requirements: {
    ram: string;
    storage: string;
    android: string;
  };
}

interface ApkInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  appInfo: AppInfo;
  onDownload: () => void;
}

export const ApkInfoModal: React.FC<ApkInfoModalProps> = ({
  isOpen,
  onClose,
  appInfo,
  onDownload,
}) => {
  if (!isOpen) return null;

  const getPermissionIcon = (permission: string) => {
    if (permission.toLowerCase().includes("internet"))
      return <Wifi className="w-4 h-4" />;
    if (permission.toLowerCase().includes("location"))
      return <MapPin className="w-4 h-4" />;
    if (permission.toLowerCase().includes("camera"))
      return <Camera className="w-4 h-4" />;
    if (permission.toLowerCase().includes("storage"))
      return <HardDrive className="w-4 h-4" />;
    if (permission.toLowerCase().includes("notification"))
      return <Bell className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Zuasoko Mobile App
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Version {appInfo.version}</span>
                  <span>•</span>
                  <span>{appInfo.size}</span>
                  <span>•</span>
                  <span>Android {appInfo.minAndroidVersion}+</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Download Section */}
          <div className="text-center">
            <button
              onClick={() => {
                onDownload();
                onClose();
              }}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3 mx-auto"
            >
              <Download className="w-6 h-6" />
              Download APK ({appInfo.size})
            </button>
            <p className="text-sm text-gray-600 mt-3">
              Released on{" "}
              {new Date(appInfo.releaseDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* What's New */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              What's New in v{appInfo.version}
            </h3>
            <div className="space-y-2">
              {appInfo.releaseNotes.map((note, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {appInfo.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg"
                >
                  <CheckCircle className="w-4 h-4 text-primary-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Requirements */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              System Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <Smartphone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold text-gray-900">
                  Android Version
                </div>
                <div className="text-sm text-gray-600">
                  {appInfo.requirements.android}
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <HardDrive className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-gray-900">Storage</div>
                <div className="text-sm text-gray-600">
                  {appInfo.requirements.storage}
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold text-gray-900">RAM</div>
                <div className="text-sm text-gray-600">
                  {appInfo.requirements.ram}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              App Permissions
            </h3>
            <div className="space-y-3">
              {appInfo.permissions.map((permission, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg"
                >
                  <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                    {getPermissionIcon(permission)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {permission.split(" - ")[0]}
                    </div>
                    {permission.includes(" - ") && (
                      <div className="text-sm text-gray-600 mt-1">
                        {permission.split(" - ")[1]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">
                  Security Notice
                </h4>
                <p className="text-sm text-yellow-700">
                  This APK is signed and verified by Zuasoko. Before installing,
                  make sure to enable "Install from unknown sources" in your
                  Android settings. Only download from this official source to
                  ensure security and authenticity.
                </p>
              </div>
            </div>
          </div>

          {/* Installation Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">
              Installation Instructions
            </h4>
            <ol className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </span>
                Download the APK file by clicking the download button above
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </span>
                Go to Settings → Security → Enable "Unknown Sources" or "Install
                unknown apps"
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </span>
                Open the downloaded APK file and tap "Install"
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  4
                </span>
                Open the Zuasoko app and log in with your account
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
