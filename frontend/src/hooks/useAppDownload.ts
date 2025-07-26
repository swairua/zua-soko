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

  const setDefaultAppInfo = () => {
    setAppInfo({
      version: "1.0.0",
      versionCode: 1,
      size: "25 MB",
      releaseDate: new Date().toISOString().split('T')[0],
      releaseNotes: [
        "Browse fresh produce from local farmers",
        "Secure mobile payments with M-Pesa",
        "Real-time order tracking",
        "Direct farmer-to-consumer marketplace"
      ],
      features: [
        "Marketplace browsing",
        "Cart management",
        "Secure checkout",
        "Order history",
        "User profiles"
      ],
      minAndroidVersion: "5.0",
      targetAndroidVersion: "14.0",
      permissions: [
        "Internet access",
        "Camera (for profile photos)",
        "Storage (for app data)"
      ],
      screenshots: [
        "/images/app-screen-1.jpg",
        "/images/app-screen-2.jpg",
        "/images/app-screen-3.jpg"
      ],
      requirements: {
        ram: "2 GB",
        storage: "100 MB",
        android: "5.0+"
      }
    });
  };

  const checkAvailability = async (): Promise<boolean> => {
    try {
      console.log("🔍 Checking APK availability at:", downloadUrl);

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        // Check if APK file exists with timeout
        const apkResponse = await fetch(downloadUrl, {
          method: "HEAD",
          signal: controller.signal,
          cache: "no-cache"
        });

        clearTimeout(timeoutId);
        const apkExists = apkResponse.ok;

        console.log("📱 APK availability check result:", {
          url: downloadUrl,
          status: apkResponse.status,
          ok: apkResponse.ok,
          exists: apkExists
        });

        if (apkExists) {
          // Try to fetch app metadata with timeout
          try {
            const infoController = new AbortController();
            const infoTimeoutId = setTimeout(() => infoController.abort(), 3000);

            const infoResponse = await fetch("/downloads/app-info.json", {
              signal: infoController.signal,
              cache: "no-cache"
            });

            clearTimeout(infoTimeoutId);

            if (infoResponse.ok) {
              const info = await infoResponse.json();
              setAppInfo(info);
              console.log("✅ App info loaded successfully");
            } else {
              console.log("ℹ️ App info not found, using defaults");
              setDefaultAppInfo();
            }
          } catch (infoError) {
            console.log("ℹ️ App info fetch failed, using defaults:", infoError.name);
            setDefaultAppInfo();
          }
        } else {
          console.log("❌ APK file not found");
        }

        setIsAvailable(apkExists);
        return apkExists;

      } catch (fetchError) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          console.log("⏱️ APK availability check timed out");
        } else {
          console.log("🌐 Network error during APK check:", fetchError.name);
        }

        throw fetchError;
      }

    } catch (error) {
      console.log("❌ APK availability check failed:", {
        error: error.name || 'Unknown',
        message: error.message || 'No message',
        url: downloadUrl
      });

      // Don't show error to user, just quietly disable download
      setIsAvailable(false);
      return false;
    }
  };

  const downloadApp = async () => {
    console.log("📱 Download requested, availability:", isAvailable);

    // Double-check availability if not already confirmed
    if (!isAvailable) {
      console.log("📱 Checking availability before download...");
      setLoading(true);
      const available = await checkAvailability();
      setLoading(false);

      if (!available) {
        const event = new CustomEvent("show-toast", {
          detail: {
            message: "Mobile app is not available for download at this time.",
            type: "error",
          },
        });
        window.dispatchEvent(event);
        return;
      }
    }

    try {
      // Create temporary link for download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "zuasoko-app.apk";
      link.target = "_blank";
      link.rel = "noopener noreferrer";

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

      console.log("✅ Download initiated successfully");

    } catch (error) {
      console.error("❌ Download failed:", error);
      const event = new CustomEvent("show-toast", {
        detail: {
          message: "Download failed. Please try again later.",
          type: "error",
        },
      });
      window.dispatchEvent(event);
    }
  };

  useEffect(() => {
    const initCheck = async () => {
      setLoading(true);

      // Add a small delay to avoid immediate network requests on page load
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        await checkAvailability();
      } catch (error) {
        console.log("🔄 Initial availability check failed, will retry on user interaction");
      } finally {
        setLoading(false);
      }
    };

    // Only check if we're not in development mode or if explicitly needed
    const shouldCheck = !window.location.hostname.includes('localhost') ||
                       window.location.search.includes('check-app');

    if (shouldCheck) {
      initCheck();
    } else {
      console.log("🔄 Skipping app availability check in development");
      setLoading(false);
      setIsAvailable(false);
    }
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
    console.log("📏 Checking file size for:", url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      cache: "no-cache"
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const contentLength = response.headers.get("content-length");
      if (contentLength) {
        const size = formatFileSize(parseInt(contentLength));
        console.log("📏 File size determined:", size);
        return size;
      }
    }

    console.log("📏 Could not determine file size");
    return "~25 MB"; // Reasonable default for mobile apps

  } catch (error) {
    console.log("📏 File size check failed:", error.name);
    return "~25 MB"; // Reasonable default
  }
};
