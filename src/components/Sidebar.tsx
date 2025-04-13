
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  BarChart, 
  Settings,
  Menu,
  X,
  LogOut,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  badge?: number;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  isActive = false,
  badge,
  onClick,
}) => (
  <li>
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
        isActive && "bg-sidebar-accent text-sidebar-foreground font-medium"
      )}
      onClick={onClick}
    >
      <Icon size={20} />
      <span className="flex-grow text-left">{label}</span>
      {badge && (
        <span className="bg-hr-blue text-white text-xs font-medium px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Button>
  </li>
);

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleItemClick = (path: string) => {
    navigate(path);
  };

  return (
    <div
      className={cn(
        "bg-sidebar h-screen transition-all duration-300 border-r border-gray-200 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center">
            <span className="font-bold text-xl text-white">ProjectX</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-sidebar-accent"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          <SidebarItem
            icon={LayoutDashboard}
            label={collapsed ? "" : "Dashboard"}
            isActive={isActive("/")}
            onClick={() => handleItemClick("/")}
          />
          <SidebarItem
            icon={Users}
            label={collapsed ? "" : "Employees"}
            isActive={isActive("/employees")}
            onClick={() => handleItemClick("/employees")}
          />
          <SidebarItem
            icon={FileText}
            label={collapsed ? "" : "Documents"}
            isActive={isActive("/documents")}
            onClick={() => handleItemClick("/documents")}
          />
          <SidebarItem
            icon={CheckSquare}
            label={collapsed ? "" : "30-60-90 Plans"}
            isActive={isActive("/plans")}
            onClick={() => handleItemClick("/plans")}
          />
          <SidebarItem
            icon={Calendar}
            label={collapsed ? "" : "Schedules"}
            isActive={isActive("/schedules")}
            onClick={() => handleItemClick("/schedules")}
          />
          <SidebarItem
            icon={MessageSquare}
            label={collapsed ? "" : "Messages"}
            isActive={isActive("/messages")}
            onClick={() => handleItemClick("/messages")}
          />
          <SidebarItem
            icon={BarChart}
            label={collapsed ? "" : "Analytics"}
            isActive={isActive("/analytics")}
            onClick={() => handleItemClick("/analytics")}
          />
          <SidebarItem
            icon={UserCircle}
            label={collapsed ? "" : "Profile"}
            isActive={isActive("/profile")}
            onClick={() => handleItemClick("/profile")}
          />
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <SidebarItem
          icon={Settings}
          label={collapsed ? "" : "Settings"}
          isActive={isActive("/settings")}
          onClick={() => handleItemClick("/settings")}
        />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent mt-2"
          onClick={() => signOut()}
        >
          <LogOut size={20} />
          {!collapsed && <span className="flex-grow text-left">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
