"use client";
import React, { useMemo, useEffect, useState } from "react";
import Image from "next/image";
import UserProfile from "./UserProfile";
import { menuConfig, UserRole } from "./menuConfig";
import { Menu,ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/app/context/auth-context";
import { Session } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MenuItem from "./MenuItem";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  isMobile,
}) => {
  const { user, expires_at } = useAuthStore();
  const [cachedRole, setCachedRole] = useState<UserRole | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side before accessing localStorage
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole") as UserRole;
      setCachedRole(role);
    }
  }, []);

  // Update cached role when user changes
  useEffect(() => {
    if (user?.role && typeof window !== "undefined") {
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userData", JSON.stringify(user));
      setCachedRole(user.role as UserRole);
    }
  }, [user?.role]);

  // Use cached role if user is not yet loaded
  const effectiveRole = user?.role || cachedRole;

  // Construct session object for UserProfile
  const session: Session | null = user
    ? {
        user,
        access_token: user.access_token,
        expires: expires_at
          ? new Date(expires_at).toISOString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    : null;

  // Filter menu items based on effective role - only after client hydration
  const accessibleMenuItems = useMemo(() => {
    if (!isClient) return []; // Return empty array during SSR
    return menuConfig.filter((item) => item.roles.includes(effectiveRole || null));
  }, [effectiveRole, isClient]);

  return (
    <div
      className={`${
        isMobile && !isOpen ? "hidden" : isOpen ? "w-64" : "w-16"
      } h-screen bg-[#1A365D] text-slate-100 border-r border-[#24436E] p-4 flex flex-col fixed top-0 left-0 transition-all duration-300 z-50 overflow-x-auto`}
      style={{
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none', /* Internet Explorer 10+ */
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>
      {/* Logo and Toggle Button */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex flex-col items-center w-full">
          {isOpen ? (
            <>
              <div className="bg-white px-3 py-2 rounded-xl w-full flex items-center justify-center shadow-md">
                <Image
                  src="/logo/sanchay.png"
                  alt="Inim Logo"
                  width={180}
                  height={60}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </div>
              {effectiveRole && (
                <span className="text-xs font-semibold text-sky-200 capitalize tracking-wider mt-2.5 px-3 py-0.5 rounded-full bg-white/10 border border-white/15">
                  {effectiveRole}
                </span>
              )}
            </>
          ) : (
            <div className="bg-white p-1.5 rounded-lg shadow-sm">
              <Image
                src="/logo/sanchay-icon.png"
                alt="Inim Icon"
                width={32}
                height={32}
                className="h-7 w-7 object-contain"
                priority
              />
            </div>
          )}
        </div>
        {isMobile && (
          <button onClick={toggleSidebar} className="p-2 ml-2">
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
        )}
      </div>

      {/* Navigation - Show loading skeleton if not client-side or role not determined yet */}
      <nav className="flex-1">
        {!isClient || effectiveRole === undefined ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <ul className="space-y-4">
            {accessibleMenuItems.map((item) => (
              <MenuItem key={item.href} item={item} isSidebarOpen={isOpen} />
            ))}
          </ul>
        )}
      </nav>

      {/* User Profile */}
      <div className="mt-auto">
        <UserProfile session={session} isSidebarOpen={isOpen} />
      </div>
    </div>
  );
};

export default Sidebar;