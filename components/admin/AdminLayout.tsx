"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  Store,
  BarChart3,
  ShoppingCart,
  Settings,
  Bell,
  Menu,
  X,
  Sprout,
  LogOut,
  UserCheck,
  PackageCheck,
  TruckIcon,
  ShoppingBag,
  CreditCard,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Order Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Subscriptions",
    href: "/admin/subscriptions",
    icon: CreditCard,
  },
  {
    name: "Manage Users",
    href: "/admin/users",
    icon: Users,
    subItems: [
      { name: "All Users", href: "/admin/users", icon: Users },
      { name: "Farmers", href: "/admin/users/farmers", icon: UserCheck },
      { name: "Customers", href: "/admin/users/customers", icon: UserCheck },
      { name: "Drivers", href: "/admin/users/drivers", icon: TruckIcon },
    ],
  },
  {
    name: "Consignments",
    href: "/admin/consignments",
    icon: Package,
    subItems: [
      { name: "All Consignments", href: "/admin/consignments", icon: Package },
      {
        name: "Pending Approval",
        href: "/admin/consignments/pending",
        icon: PackageCheck,
      },
      {
        name: "Approved",
        href: "/admin/consignments/approved",
        icon: PackageCheck,
      },
      { name: "Rejected", href: "/admin/consignments/rejected", icon: X },
    ],
  },
  {
    name: "Manage Drivers",
    href: "/admin/drivers",
    icon: Truck,
    subItems: [
      { name: "All Drivers", href: "/admin/drivers", icon: Truck },
      { name: "Active Drivers", href: "/admin/drivers/active", icon: Truck },
      {
        name: "Driver Applications",
        href: "/admin/drivers/applications",
        icon: UserCheck,
      },
    ],
  },
  {
    name: "Manage Shop",
    href: "/admin/shop",
    icon: Store,
    subItems: [
      { name: "Products", href: "/admin/shop/products", icon: ShoppingBag },
      { name: "Categories", href: "/admin/shop/categories", icon: Store },
      { name: "Orders", href: "/admin/shop/orders", icon: ShoppingCart },
      { name: "Inventory", href: "/admin/shop/inventory", icon: Package },
    ],
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName],
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b lg:pl-64">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center lg:hidden">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F36ce27fc004b41f8b60187584af31eda%2Fb55ec5e832e54191b9a5618c290a66ad?format=webp&width=800"
                alt="Zuasoko Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Zuasoko Admin
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Bell className="h-5 w-5" />
            </button>
            <Link
              href="/auth/logout"
              className="flex items-center text-gray-700 hover:text-primary-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F36ce27fc004b41f8b60187584af31eda%2Fb55ec5e832e54191b9a5618c290a66ad?format=webp&width=800"
              alt="Zuasoko Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="ml-2 text-xl font-bold text-gray-900">
              Zuasoko Admin
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <div key={item.name}>
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    className={`flex-1 flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? "bg-primary-100 text-primary-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                  {item.subItems && (
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className={`h-4 w-4 transform transition-transform ${
                          expandedItems.includes(item.name) ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {item.subItems && expandedItems.includes(item.name) && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                          isActive(subItem.href)
                            ? "bg-primary-50 text-primary-600"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <subItem.icon className="mr-3 h-4 w-4" />
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
