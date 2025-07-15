import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { useCart } from "../../store/cart";
import {
  Home,
  Store,
  ShoppingCart,
  User,
  Truck,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

export default function MobileBottomNav() {
  const { isAuthenticated, user } = useAuthStore();
  const { cart } = useCart();
  const location = useLocation();

  // Show navigation for all users including guests

  const getNavItems = () => {
    const baseItems = [
      {
        path: "/",
        icon: Home,
        label: "Home",
        show: true,
      },
      {
        path: "/marketplace",
        icon: Store,
        label: "Shop",
        show: true,
      },
    ];

    // Handle guest users (not authenticated)
    if (!isAuthenticated) {
      return [
        ...baseItems,
        {
          path: "/cart",
          icon: ShoppingCart,
          label: "Cart",
          badge: cart?.totalItems || 0,
          show: true,
        },
        {
          path: "/login",
          icon: User,
          label: "Login",
          show: true,
        },
      ];
    }

    switch (user?.role) {
      case "CUSTOMER":
        return [
          ...baseItems,
          {
            path: "/cart",
            icon: ShoppingCart,
            label: "Cart",
            badge: cart?.totalItems || 0,
            show: true,
          },
          {
            path: "/customer/dashboard",
            icon: User,
            label: "Account",
            show: true,
          },
        ];

      case "FARMER":
        return [
          ...baseItems,
          {
            path: "/farmer/consignments",
            icon: Settings,
            label: "Consign",
            show: true,
          },
          {
            path: "/farmer/wallet",
            icon: User,
            label: "Wallet",
            show: true,
          },
        ];

      case "DRIVER":
        return [
          ...baseItems,
          {
            path: "/driver/assignments",
            icon: Truck,
            label: "Transport",
            show: true,
          },
          {
            path: "/driver/warehouse",
            icon: User,
            label: "Warehouse",
            show: true,
          },
        ];

      case "ADMIN":
        return [
          ...baseItems,
          {
            path: "/admin/consignments",
            icon: Settings,
            label: "Consign",
            show: true,
          },
          {
            path: "/admin/analytics",
            icon: BarChart3,
            label: "Analytics",
            show: true,
          },
        ];

      default:
        return baseItems;
    }
  };

  const navItems = getNavItems().filter((item) => item.show);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") {
      return true;
    }
    if (path !== "/" && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors ${
                active
                  ? "text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${active ? "text-primary-600" : "text-gray-500"}`}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center min-w-[16px]">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`mt-1 ${active ? "text-primary-600" : "text-gray-500"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Safe area padding for devices with home indicators */}
      <div className="h-safe-bottom bg-white"></div>
    </div>
  );
}
