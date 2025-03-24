import React from "react";
import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  ShoppingBasket,
  Users,
  Package,
  LogOut,
  ChevronRight,
} from "lucide-react";

export function DashboardSidebar({ sidebarOpen, setSidebarOpen, user }) {
  const location = useLocation();
  const isAdmin = user.role === "admin";
  const basePath = isAdmin ? "/admin" : "/seller";
  const navItems = isAdmin
    ? [
        {
          name: "Dashboard",
          path: `${basePath}/dashboard`,
          icon: <LayoutDashboard size={20} />,
        },
        {
          name: "Products",
          path: `${basePath}/products`,
          icon: <ShoppingBasket size={20} />,
        },
        { name: "Users", path: `${basePath}/users`, icon: <Users size={20} /> },
        {
          name: "Orders",
          path: `${basePath}/orders`,
          icon: <Package size={20} />,
        },
      ]
    : [
        {
          name: "Dashboard",
          path: `${basePath}/dashboard`,
          icon: <LayoutDashboard size={20} />,
        },
        {
          name: "Products",
          path: `${basePath}/products`,
          icon: <ShoppingBasket size={20} />,
        },
        {
          name: "Orders",
          path: `${basePath}/orders`,
          icon: <Package size={20} />,
        },
      ];

  return (
    <aside
      className={`bg-muted flex-shrink-0 border-r transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-16"
      } relative`}
    >
      <div className="p-4">
        <div
          className={`flex items-center w-full ${
            sidebarOpen ? "justify-start gap-2" : "justify-center"
          } mb-6`}
        >
          <div
            className="bg-primary rounded-md p-1 text-primary-foreground font-bold text-lg w-full text-center"
            onClick={() => (window.location.href = "/home")} // Đường dẫn đến trang chủ
          >
            {sidebarOpen ? "eBay" : "eB"}
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center ${
                sidebarOpen ? "gap-3 px-3" : "justify-center px-0"
              } py-2 rounded-md hover:bg-secondary group ${
                location.pathname === item.path
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <div>{item.icon}</div>
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export function DashboardHeader({
  user,
  handleLogout,
  setSidebarOpen,
  sidebarOpen,
}) {
  return (
    <header className="bg-background border-b z-10 h-16">
      <div className="flex h-full justify-between items-center px-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <ChevronRight
            size={16}
            className={`transition-transform duration-300 ${
              sidebarOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="p-2">
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/">Go to Main Site</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/profile/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader
          user={user}
          handleLogout={handleLogout}
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
