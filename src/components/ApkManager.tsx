import React, { useState, useRef } from "react";
import {
  Upload,
  Download,
  Trash2,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAppDownload } from "../hooks/useAppDownload";

export const ApkManager: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAvailable, appInfo, checkAvailability, downloadApp } =
    useAppDownload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".apk")) {
      alert("Please select a valid APK file");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("apk", file);

      // Simulate upload progress (in real implementation, you'd use XMLHttpRequest for progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // In a real implementation, you'd upload to your server
      // For now, we'll simulate the upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Check availability after upload
      setTimeout(async () => {
        await checkAvailability();
        setUploading(false);
        setUploadProgress(0);
        alert(
          "APK uploaded successfully! The download will be available on the homepage.",
        );
      }, 500);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(false);
      setUploadProgress(0);
      alert("Upload failed. Please try again.");
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Mobile App Management
        </h3>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isAvailable
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {isAvailable ? "APK Available" : "No APK Found"}
        </div>
      </div>

      {/* Current APK Status */}
      {isAvailable && appInfo ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-green-800 mb-2">Active APK</h4>
              <div className="space-y-1 text-sm text-green-700">
                <div>Version: {appInfo.version}</div>
                <div>Size: {appInfo.size}</div>
                <div>
                  Release Date:{" "}
                  {new Date(appInfo.releaseDate).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={downloadApp}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Test Download
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to remove the current APK?",
                      )
                    ) {
                      // In real implementation, call delete API
                      alert(
                        "APK removal functionality would be implemented here",
                      );
                    }
                  }}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">
                No APK Available
              </h4>
              <p className="text-sm text-yellow-700">
                Upload an APK file to enable mobile app downloads on the
                homepage.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".apk"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-medium text-gray-900 mb-2">
                Uploading APK...
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {uploadProgress}% complete
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-gray-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {isAvailable ? "Update APK File" : "Upload APK File"}
            </h4>
            <p className="text-gray-600 mb-4">
              Select your Zuasoko Android APK file to make it available for
              download
            </p>
            <button
              onClick={triggerFileSelect}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Choose APK File
            </button>
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Instructions</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• APK file should be named "zuasoko-app.apk"</li>
              <li>• Maximum file size: 100MB</li>
              <li>• Ensure the APK is signed and tested</li>
              <li>• Update app-info.json with version details</li>
              <li>• APK will be immediately available on homepage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
