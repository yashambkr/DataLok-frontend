import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import Icons from "./Icons";
import { MenuItem as MenuItemType } from "./menuConfig";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface MenuItemProps {
  item: MenuItemType;
  isSidebarOpen: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isSidebarOpen }) => {
  const pathname = usePathname();
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(isSidebarOpen);
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  
  // Check if authenticated (status === "authenticated") and has token
  const isAuthenticated = status === "authenticated" && !!session?.access_token;


  const toggleSubMenu = () => {
    if (item.subItems) {
      setIsSubMenuOpen(!isSubMenuOpen);
    }
  };

  const isActive = () => {
    if (pathname === item.href) return true;
    if (item.subItems) {
      return item.subItems.some((subItem) => pathname === subItem.href);
    }
    
    // Special handling for project-related routes
    if (item.href === "/projectmanager/project") {
      return pathname.startsWith("/projectmanager/project") || 
             pathname.startsWith("/projectmanager/tasks/");
    }
    
    if (item.href === "/superadmin/project") {
      return pathname === "/superadmin/project" || 
             pathname.startsWith("/superadmin/projectDetail/") ||
             pathname === "/superadmin/tasks";
    }
    
    if (item.href === "/superadmin/projectArchive") {
      return pathname === "/superadmin/projectArchive";
    }
    
    return false;
  };

  const active = isActive();

  // Always use Link component for internal navigation to maintain React state
  const renderLink = (href: string, labelKey: string, isMainItem = false) => {
    const label = t(labelKey as any);
    const isItemActive = isMainItem ? active : pathname === href;
    const baseClasses = isMainItem 
      ? `flex items-center flex-1 text-base ${isItemActive ? "font-semibold text-white bg-[#2B6CB0] rounded-xl p-2.5 shadow-sm" : "text-slate-200 hover:text-white hover:bg-white/10 rounded-xl p-2.5 transition-all"}`
      : `block text-sm ${isItemActive ? "font-medium text-white bg-[#2B6CB0] rounded-xl px-3 py-2 shadow-sm" : "text-slate-300 hover:text-white hover:bg-white/10 rounded-xl px-3 py-2 transition-all"}`;

    return (
      <Link href={href} className={baseClasses}>
        {isMainItem && (
          <>
            <Icons
              iconName={item.iconName}
              isActive={active}
              className={`mr-3 h-5 w-5 ${active ? "text-white" : "text-slate-300"}`}
            />
            {isSidebarOpen && <span>{label}</span>}
          </>
        )}
        {!isMainItem && label}
      </Link>
    );
  };

  return (
    <li>
      <div className="flex items-center justify-between py-1">
        {renderLink(item.href, item.labelKey as string, true)}
        
        {item.subItems && isSidebarOpen && (
          <button
            onClick={toggleSubMenu}
            className="p-2 focus:outline-none rounded-lg hover:bg-white/10"
            aria-label={isSubMenuOpen ? t('collapseSubmenu') : t('expandSubmenu')}
          >
            <ChevronDown
              className={`h-5 w-5 text-slate-300 hover:text-white transition-transform duration-200 ${
                isSubMenuOpen ? "rotate-0" : "rotate-180"
              }`}
            />
          </button>
        )}
      </div>
      
      {item.subItems && isSubMenuOpen && isSidebarOpen && (
        <ul className="ml-8 mt-2 space-y-4">
          {item.subItems.map((subItem) => (
            <li key={subItem.href}>
              {renderLink(subItem.href, subItem.labelKey as string)}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default MenuItem;