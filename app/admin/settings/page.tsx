"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Settings,
  Save,
  Bell,
  Mail,
  Lock,
  Globe,
  DollarSign,
  Truck,
  Store,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    general: {
      siteName: "Zuasoko",
      siteDescription: "Empowering Farmers with AI",
      contactEmail: "admin@zuasoko.com",
      supportPhone: "+254712345678",
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      orderAlerts: true,
      consignmentAlerts: true,
    },
    payments: {
      deliveryFee: 200,
      commission: 15,
      mpesaEnabled: true,
      cashOnDeliveryEnabled: true,
    },
    features: {
      aiRecommendations: true,
      weatherAlerts: true,
      priceInsights: true,
      marketTrends: true,
    },
  });

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    console.log("Saving settings:", settings);
    alert("Settings saved successfully!");
  };

  const tabs = [
    { id: "general", name: "General", icon: Globe },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "payments", name: "Payments", icon: DollarSign },
    { id: "features", name: "Features", icon: Store },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">
                Configure your platform settings and preferences
              </p>
            </div>
            <button
              onClick={handleSave}
              className="btn-primary flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary-100 text-primary-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* General Settings */}
              {activeTab === "general" && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    General Settings
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={settings.general.siteName}
                        onChange={(e) =>
                          handleSettingChange(
                            "general",
                            "siteName",
                            e.target.value,
                          )
                        }
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Description
                      </label>
                      <textarea
                        value={settings.general.siteDescription}
                        onChange={(e) =>
                          handleSettingChange(
                            "general",
                            "siteDescription",
                            e.target.value,
                          )
                        }
                        rows={3}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={settings.general.contactEmail}
                        onChange={(e) =>
                          handleSettingChange(
                            "general",
                            "contactEmail",
                            e.target.value,
                          )
                        }
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Phone
                      </label>
                      <input
                        type="tel"
                        value={settings.general.supportPhone}
                        onChange={(e) =>
                          handleSettingChange(
                            "general",
                            "supportPhone",
                            e.target.value,
                          )
                        }
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === "notifications" && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Notification Settings
                  </h2>
                  <div className="space-y-6">
                    {Object.entries(settings.notifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {key === "emailNotifications" &&
                                "Receive notifications via email"}
                              {key === "smsNotifications" &&
                                "Receive notifications via SMS"}
                              {key === "orderAlerts" &&
                                "Get alerts for new orders"}
                              {key === "consignmentAlerts" &&
                                "Get alerts for new consignments"}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) =>
                                handleSettingChange(
                                  "notifications",
                                  key,
                                  e.target.checked,
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === "payments" && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Payment Settings
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Fee (KES)
                      </label>
                      <input
                        type="number"
                        value={settings.payments.deliveryFee}
                        onChange={(e) =>
                          handleSettingChange(
                            "payments",
                            "deliveryFee",
                            Number(e.target.value),
                          )
                        }
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Commission Rate (%)
                      </label>
                      <input
                        type="number"
                        value={settings.payments.commission}
                        onChange={(e) =>
                          handleSettingChange(
                            "payments",
                            "commission",
                            Number(e.target.value),
                          )
                        }
                        className="input-field"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            M-Pesa Payments
                          </h3>
                          <p className="text-sm text-gray-600">
                            Enable M-Pesa STK Push payments
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.payments.mpesaEnabled}
                            onChange={(e) =>
                              handleSettingChange(
                                "payments",
                                "mpesaEnabled",
                                e.target.checked,
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            Cash on Delivery
                          </h3>
                          <p className="text-sm text-gray-600">
                            Enable cash payment on delivery
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.payments.cashOnDeliveryEnabled}
                            onChange={(e) =>
                              handleSettingChange(
                                "payments",
                                "cashOnDeliveryEnabled",
                                e.target.checked,
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature Settings */}
              {activeTab === "features" && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Feature Settings
                  </h2>
                  <div className="space-y-6">
                    {Object.entries(settings.features).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {key === "aiRecommendations" &&
                              "Enable AI-powered crop recommendations"}
                            {key === "weatherAlerts" &&
                              "Provide weather alerts to farmers"}
                            {key === "priceInsights" &&
                              "Show market price insights"}
                            {key === "marketTrends" &&
                              "Display market trend analysis"}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) =>
                              handleSettingChange(
                                "features",
                                key,
                                e.target.checked,
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
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
    </AdminLayout>
  );
}
