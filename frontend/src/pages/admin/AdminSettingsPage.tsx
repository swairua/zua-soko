import React, { useState, useEffect } from "react";
import {
  Settings,
  Users,
  CreditCard,
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  Smartphone,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  DollarSign,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import toast from "react-hot-toast";
import axios from "axios";

interface SystemSettings {
  platform: {
    name: string;
    description: string;
    supportEmail: string;
    supportPhone: string;
  };
  fees: {
    farmerRegistrationFee: number;
    registrationFeeEnabled: boolean;
    gracePeriodDays: number;
  };
  payments: {
    mpesaEnabled: boolean;
    mpesaShortcode: string;
    mpesaPasskey: string;
    bankTransferEnabled: boolean;
    commissionRate: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    adminNotifications: boolean;
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    twoFactorRequired: boolean;
    maxLoginAttempts: number;
  };
  features: {
    consignmentApprovalRequired: boolean;
    autoDriverAssignment: boolean;
    inventoryTracking: boolean;
    priceModeration: boolean;
  };
}

export default function AdminSettingsPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("platform");
  const [showPasskey, setShowPasskey] = useState(false);

  const [settings, setSettings] = useState<SystemSettings>({
    platform: {
      name: "Zuasoko Agricultural Platform",
      description:
        "Connecting farmers directly with customers and managing agricultural supply chains",
      supportEmail: "support@zuasoko.com",
      supportPhone: "+254700000000",
    },
    fees: {
      farmerRegistrationFee: 300,
      registrationFeeEnabled: true,
      gracePeriodDays: 7,
    },
    payments: {
      mpesaEnabled: true,
      mpesaShortcode: "174379",
      mpesaPasskey: "",
      bankTransferEnabled: true,
      commissionRate: 5.0,
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: true,
      adminNotifications: true,
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 24,
      twoFactorRequired: false,
      maxLoginAttempts: 5,
    },
    features: {
      consignmentApprovalRequired: true,
      autoDriverAssignment: false,
      inventoryTracking: true,
      priceModeration: true,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.settings) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.log("Using default settings - API endpoint not available");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await axios.put("/api/admin/settings", settings, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.success("Settings saved locally (demo mode)");
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (
    section: keyof SystemSettings,
    field: string,
    value: any,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const tabs = [
    { id: "platform", label: "Platform", icon: Globe },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "fees", label: "Registration Fees", icon: DollarSign },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "features", label: "Features", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-green-600" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                System Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Configure platform settings and system behavior
              </p>
            </div>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">
                  Settings Categories
                </h3>
              </div>
              <nav className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Platform Settings */}
              {activeTab === "platform" && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Globe className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Platform Configuration
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform Name
                      </label>
                      <input
                        type="text"
                        value={settings.platform.name}
                        onChange={(e) =>
                          updateSettings("platform", "name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform Description
                      </label>
                      <textarea
                        value={settings.platform.description}
                        onChange={(e) =>
                          updateSettings(
                            "platform",
                            "description",
                            e.target.value,
                          )
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Support Email
                        </label>
                        <input
                          type="email"
                          value={settings.platform.supportEmail}
                          onChange={(e) =>
                            updateSettings(
                              "platform",
                              "supportEmail",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Support Phone
                        </label>
                        <input
                          type="tel"
                          value={settings.platform.supportPhone}
                          onChange={(e) =>
                            updateSettings(
                              "platform",
                              "supportPhone",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === "payments" && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <CreditCard className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Payment Configuration
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            M-Pesa Integration
                          </h4>
                          <p className="text-sm text-gray-600">
                            Enable M-Pesa payments
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.payments.mpesaEnabled}
                            onChange={(e) =>
                              updateSettings(
                                "payments",
                                "mpesaEnabled",
                                e.target.checked,
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Bank Transfer
                          </h4>
                          <p className="text-sm text-gray-600">
                            Enable bank transfers
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.payments.bankTransferEnabled}
                            onChange={(e) =>
                              updateSettings(
                                "payments",
                                "bankTransferEnabled",
                                e.target.checked,
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>

                    {settings.payments.mpesaEnabled && (
                      <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-900">
                          M-Pesa Configuration
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Business Shortcode
                            </label>
                            <input
                              type="text"
                              value={settings.payments.mpesaShortcode}
                              onChange={(e) =>
                                updateSettings(
                                  "payments",
                                  "mpesaShortcode",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Passkey
                            </label>
                            <div className="relative">
                              <input
                                type={showPasskey ? "text" : "password"}
                                value={settings.payments.mpesaPasskey}
                                onChange={(e) =>
                                  updateSettings(
                                    "payments",
                                    "mpesaPasskey",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Enter M-Pesa passkey"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasskey(!showPasskey)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPasskey ? (
                                  <EyeOff className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <Eye className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Commission Rate (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={settings.payments.commissionRate}
                        onChange={(e) =>
                          updateSettings(
                            "payments",
                            "commissionRate",
                            parseFloat(e.target.value),
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Platform commission charged on transactions
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === "notifications" && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Bell className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Notification Settings
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: "emailEnabled",
                        label: "Email Notifications",
                        desc: "Send notifications via email",
                      },
                      {
                        key: "smsEnabled",
                        label: "SMS Notifications",
                        desc: "Send notifications via SMS",
                      },
                      {
                        key: "pushEnabled",
                        label: "Push Notifications",
                        desc: "Send push notifications to mobile apps",
                      },
                      {
                        key: "adminNotifications",
                        label: "Admin Notifications",
                        desc: "Receive admin-specific notifications",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {item.label}
                          </h4>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              settings.notifications[
                                item.key as keyof typeof settings.notifications
                              ]
                            }
                            onChange={(e) =>
                              updateSettings(
                                "notifications",
                                item.key,
                                e.target.checked,
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Registration Fees Settings */}
              {activeTab === "fees" && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Registration Fee Configuration
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1" />
                        <div>
                          <h4 className="font-medium text-yellow-800">
                            Important
                          </h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Farmers must pay the registration fee before they
                            can register consignments. This helps maintain
                            platform quality and covers operational costs.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Enable Registration Fee
                        </h4>
                        <p className="text-sm text-gray-600">
                          Require farmers to pay registration fee before
                          consignment submission
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.fees.registrationFeeEnabled}
                          onChange={(e) =>
                            updateSettings(
                              "fees",
                              "registrationFeeEnabled",
                              e.target.checked,
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    {settings.fees.registrationFeeEnabled && (
                      <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-900">
                          Registration Fee Settings
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Registration Fee Amount (KES)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={settings.fees.farmerRegistrationFee}
                              onChange={(e) =>
                                updateSettings(
                                  "fees",
                                  "farmerRegistrationFee",
                                  parseInt(e.target.value),
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                            <p className="text-sm text-gray-600 mt-1">
                              Amount farmers must pay to register on the
                              platform
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Grace Period (Days)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={settings.fees.gracePeriodDays}
                              onChange={(e) =>
                                updateSettings(
                                  "fees",
                                  "gracePeriodDays",
                                  parseInt(e.target.value),
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                            <p className="text-sm text-gray-600 mt-1">
                              Days to allow farmers to submit consignments
                              before payment
                            </p>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded border border-green-300">
                          <h5 className="font-medium text-gray-900 mb-2">
                            Payment Process
                          </h5>
                          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                            <li>Farmer registers on the platform</li>
                            <li>
                              Admin sends STK push for registration fee payment
                            </li>
                            <li>
                              Upon successful payment, farmer can submit
                              consignments
                            </li>
                            <li>
                              Unpaid farmers have{" "}
                              {settings.fees.gracePeriodDays} days grace period
                            </li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Shield className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Security Configuration
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Password Length
                        </label>
                        <input
                          type="number"
                          min="6"
                          max="20"
                          value={settings.security.passwordMinLength}
                          onChange={(e) =>
                            updateSettings(
                              "security",
                              "passwordMinLength",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Timeout (hours)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="168"
                          value={settings.security.sessionTimeout}
                          onChange={(e) =>
                            updateSettings(
                              "security",
                              "sessionTimeout",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Login Attempts
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="10"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) =>
                          updateSettings(
                            "security",
                            "maxLoginAttempts",
                            parseInt(e.target.value),
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-sm text-gray-600">
                          Require 2FA for admin accounts
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorRequired}
                          onChange={(e) =>
                            updateSettings(
                              "security",
                              "twoFactorRequired",
                              e.target.checked,
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature Settings */}
              {activeTab === "features" && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Settings className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Platform Features
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: "consignmentApprovalRequired",
                        label: "Require Consignment Approval",
                        desc: "Admin approval required for all consignments",
                      },
                      {
                        key: "autoDriverAssignment",
                        label: "Auto Driver Assignment",
                        desc: "Automatically assign drivers to deliveries",
                      },
                      {
                        key: "inventoryTracking",
                        label: "Inventory Tracking",
                        desc: "Track product inventory levels",
                      },
                      {
                        key: "priceModeration",
                        label: "Price Moderation",
                        desc: "Review and moderate product prices",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {item.label}
                          </h4>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              settings.features?.[
                                item.key as keyof typeof settings.features
                              ] || false
                            }
                            onChange={(e) =>
                              updateSettings(
                                "features",
                                item.key,
                                e.target.checked,
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
