import React, { useState, useEffect } from "react";
import {
  Settings,
  Key,
  Phone,
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  TestTube,
  Save,
  RefreshCw,
} from "lucide-react";
import { apiService } from "../../services/api";
import toast from "react-hot-toast";

interface MpesaSettings {
  consumer_key: string;
  consumer_secret: string;
  passkey: string;
  shortcode: string;
  environment: string;
  callback_url: string;
  configured: boolean;
}

export default function MpesaSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [settings, setSettings] = useState<MpesaSettings>({
    consumer_key: "",
    consumer_secret: "",
    passkey: "",
    shortcode: "",
    environment: "sandbox",
    callback_url: "",
    configured: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.get("/admin/mpesa-settings");
      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (error: any) {
      console.error("Error fetching M-Pesa settings:", error);
      toast.error("Failed to load M-Pesa settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settings.consumer_key || !settings.consumer_secret || !settings.passkey || !settings.shortcode) {
      toast.error("All M-Pesa credentials are required");
      return;
    }

    setSaving(true);

    try {
      const response = await apiService.put("/admin/mpesa-settings", settings);
      if (response.data.success) {
        toast.success("M-Pesa settings saved successfully!");
        setSettings(response.data.settings);
      }
    } catch (error: any) {
      console.error("Error saving M-Pesa settings:", error);
      toast.error(error.response?.data?.error || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);

    try {
      const response = await apiService.post("/admin/mpesa-test", {});
      if (response.data.success) {
        toast.success("M-Pesa connection test successful!");
      }
    } catch (error: any) {
      console.error("M-Pesa test failed:", error);
      toast.error(error.response?.data?.error || "M-Pesa connection test failed");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading M-Pesa settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">M-Pesa Settings</h1>
              <p className="text-gray-600 mt-1">
                Configure M-Pesa API credentials for payments and withdrawals
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {settings.configured ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">Configured</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-600 font-medium">Not Configured</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${settings.configured ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <Shield className={`w-6 h-6 ${settings.configured ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {settings.configured ? "Active" : "Inactive"}
                </h3>
                <p className="text-gray-600 text-sm">M-Pesa Integration</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {settings.environment || "Not Set"}
                </h3>
                <p className="text-gray-600 text-sm">Environment</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Phone className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {settings.shortcode || "Not Set"}
                </h3>
                <p className="text-gray-600 text-sm">Shortcode</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                M-Pesa API Configuration
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  {showSecrets ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Hide Secrets
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Show Secrets
                    </>
                  )}
                </button>
                {settings.configured && (
                  <button
                    onClick={handleTest}
                    disabled={testing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
                  >
                    {testing ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </button>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            {/* Environment Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Environment *
              </label>
              <select
                value={settings.environment}
                onChange={(e) => setSettings(prev => ({ ...prev, environment: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="sandbox">Sandbox (Testing)</option>
                <option value="production">Production (Live)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Use sandbox for testing, production for live transactions
              </p>
            </div>

            {/* Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consumer Key *
                </label>
                <input
                  type={showSecrets ? "text" : "password"}
                  value={settings.consumer_key}
                  onChange={(e) => setSettings(prev => ({ ...prev, consumer_key: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter consumer key"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consumer Secret *
                </label>
                <input
                  type={showSecrets ? "text" : "password"}
                  value={settings.consumer_secret}
                  onChange={(e) => setSettings(prev => ({ ...prev, consumer_secret: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter consumer secret"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passkey *
                </label>
                <input
                  type={showSecrets ? "text" : "password"}
                  value={settings.passkey}
                  onChange={(e) => setSettings(prev => ({ ...prev, passkey: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter passkey"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shortcode *
                </label>
                <input
                  type="text"
                  value={settings.shortcode}
                  onChange={(e) => setSettings(prev => ({ ...prev, shortcode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 174379"
                  required
                />
              </div>
            </div>

            {/* Callback URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Callback URL
              </label>
              <input
                type="url"
                value={settings.callback_url}
                onChange={(e) => setSettings(prev => ({ ...prev, callback_url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://yourdomain.com/api/mpesa/callback"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL where M-Pesa will send payment notifications
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Settings className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-blue-800">
                    How to get M-Pesa credentials:
                  </h4>
                  <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                    <li>Visit <a href="https://developer.safaricom.co.ke" target="_blank" rel="noopener noreferrer" className="underline">developer.safaricom.co.ke</a></li>
                    <li>Create an account and log in</li>
                    <li>Create a new app for your business</li>
                    <li>Copy the Consumer Key and Consumer Secret</li>
                    <li>Get your Lipa Na M-Pesa Online Passkey</li>
                    <li>Use your business shortcode or test shortcode</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={fetchSettings}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
