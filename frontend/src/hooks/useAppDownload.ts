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

  const downloadUrl = "/downloads/zuasoko-app.apk";

  const checkAvailability = async (): Promise<boolean> => {
    try {
      // Check if APK file exists
      const apkResponse = await fetch(downloadUrl, { method: "HEAD" });
      const apkExists = apkResponse.ok;

      if (apkExists) {
        // Try to fetch app metadata
        try {
          const infoResponse = await fetch("/downloads/app-info.json");
          if (infoResponse.ok) {
            const info = await infoResponse.json();
            setAppInfo(info);
          }
        } catch (error) {
          console.log("App info not available, using defaults");
        }
      }

      setIsAvailable(apkExists);
      return apkExists;
    } catch (error) {
      console.error("Error checking APK availability:", error);
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
      if (window.gtag) {
        window.gtag("event", "app_download", {
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
