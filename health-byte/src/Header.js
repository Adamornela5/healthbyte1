import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-white shadow-md px-6 py-4">
      {/* Logo */}
      <div className="text-2xl font-bold text-gray-800">HealthByte</div>

      {/* Navigation Menu */}
      <nav className="hidden md:flex space-x-6">
        <Button variant="ghost">Home</Button>
        <Button variant="ghost">Explore</Button>
        <Button variant="ghost">Saved Recipes</Button>
        <Button variant="ghost">Profile</Button>
      </nav>

      {/* Mobile Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="md:hidden">
            <Menu size={24} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>Home</DropdownMenuItem>
          <DropdownMenuItem>Explore</DropdownMenuItem>
          <DropdownMenuItem>Saved Recipes</DropdownMenuItem>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem className="text-red-500">Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

