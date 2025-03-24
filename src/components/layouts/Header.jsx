import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  LogIn,
  UserCircle,
  LogOut,
  Search,
  Package,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white border-b h-24 border-border sticky top-0 z-50 shadow-md flex items-center px-8">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src="/images/2025-03-17_025746.png"
            alt="eBay Clone"
            className="h-10 w-auto"
          />
        </Link>

        <form onSubmit={handleSearch} className="flex-1 mx-10">
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Search for anything..."
              className="w-full h-12 text-2xl pr-12 py-6 rounded-full border-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
            >
              <Search className="h-6 w-6" />
            </Button>
          </div>
        </form>

        <nav className="flex items-center gap-6 p-4">
          {isAuthenticated ? (
            <>
              <Link to="/cart">
                <Button variant="outline" size="icon" className="relative p-6">
                  <ShoppingCart className="h-16 w-16" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full text-sm w-8 h-8 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full p-3"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={user?.avatarUrl || ""}
                        alt={user?.name}
                      />
                      <AvatarFallback className="text-lg">
                        {user?.name?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-xl">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer text-lg">
                      <UserCircle className="mr-3 h-6 w-6" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer text-lg">
                      <Package className="mr-3 h-6 w-6" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer text-lg">
                        <LayoutDashboard className="mr-3 h-6 w-6" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user?.role === "seller" && (
                    <DropdownMenuItem asChild>
                      <Link to="/seller" className="cursor-pointer text-lg">
                        <LayoutDashboard className="mr-3 h-6 w-6" />
                        Seller Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer text-destructive text-lg"
                  >
                    <LogOut className="mr-3 h-6 w-6" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" asChild className="text-lg px-6 py-3">
                <Link to="/login">
                  <LogIn className="mr-3 h-6 w-6" />
                  Login
                </Link>
              </Button>
              <Button asChild className="text-lg px-6 py-3">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
