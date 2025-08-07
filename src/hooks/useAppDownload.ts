import { useState, useEffect } from "react";

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

interface UseAppDownloadReturn {
  isAvailable: boolean;
  appInfo: AppInfo | null;
  loading: boolean;
  downloadUrl: string;
  checkAvailability: () => Promise<boolean>;
  downloadApp: () => void;
}

export const useAppDownload = (): UseAppDownloadReturn => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Use production URL structure for APK downloads
  const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';
  const baseUrl = isProduction ? "https://app.zuasoko.com" : "";
  const downloadUrl = `${baseUrl}/downloads/zuasoko-app.apk`;

  const checkAvailability = async (): Promise<boolean> => {
    try {
      // For demo purposes, assume APK is not available to prevent fetch errors
      // In production, you would implement actual APK hosting
      console.log("📱 APK download feature - Demo mode (no actual APK available)");

      // Set default app info without making network requests
      setAppInfo({
        version: "1.0.0",
        versionCode: 1,
        size: "25 MB",
        releaseDate: new Date().toISOString(),
        releaseNotes: [
          "Initial release of Zuasoko mobile app",
          "Complete agricultural marketplace functionality",
          "Farmer dashboard and consignment management",
          "Customer marketplace browsing",
          "M-Pesa payment integration"
        ],
        features: [
          "Browse agricultural products",
          "Submit consignments as farmer",
          "Real-time market prices",
          "M-Pesa payment integration",
          "Order tracking and management",
          "Farmer and customer dashboards"
        ],
        minAndroidVersion: "6.0",
        targetAndroidVersion: "13.0",
        permissions: [
          "Internet Access - For connecting to Zuasoko services",
          "Storage Access - For managing downloaded content",
          "Camera Access - For taking product photos",
          "Location Access - For delivery and location services",
          "Notification Access - For order and market updates"
        ],
        screenshots: [],
        requirements: {
          ram: "2 GB",
          storage: "100 MB",
          android: "Android 6.0+"
        }
      });

      // Return false for demo (no actual APK available)
      // This prevents the failed fetch errors
      setIsAvailable(false);
      return false;
    } catch (error) {
      console.log("APK availability check skipped:", error.message);
      setIsAvailable(false);
      return false;
    }
  };

  const downloadApp = () => {
    if (isAvailable) {
      // Create temporary link for download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "zuasoko-app.apk";
      link.target = "_blank";

      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Track download event (analytics)
      if ((window as any).gtag) {
        (window as any).gtag("event", "app_download", {
          event_category: "engagement",
          event_label: "android_apk",
          value: 1,
        });
      }

      // Show success message
      const event = new CustomEvent("show-toast", {
        detail: {
          message: "APK download started! Check your downloads folder.",
          type: "success",
        },
      });
      window.dispatchEvent(event);
    }
  };

  useEffect(() => {
    const initCheck = async () => {
      setLoading(true);
      await checkAvailability();
      setLoading(false);
    };

    initCheck();
  }, []);

  return {
    isAvailable,
    appInfo,
    loading,
    downloadUrl,
    checkAvailability,
    downloadApp,
  };
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// Helper function to get file size
export const getApkFileSize = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      return formatFileSize(parseInt(contentLength));
    }
    return "Unknown size";
  } catch (error) {
    return "Unknown size";
  }
};
