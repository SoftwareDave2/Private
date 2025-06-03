"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, User } from "lucide-react";

interface NavLinksProps {
  mobile?: boolean;
  closeMobileMenu?: () => void;
}

export default function NavLinks({
  mobile = false,
  closeMobileMenu,
}: NavLinksProps) {
  const navLinks = [
    {
      href: "/",
      name: "Dashboard",
    },
    {
      href: "/calendar",
      name: "Kalender",
    },
    {
      href: "/media",
      name: "Mediathek",
    },
    {
      href: "/template_editor",
      name: "Template Editor",
    },
    {
      href: "/config",
      name: "Config",
    },
  ];
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (mobile && closeMobileMenu) {
      closeMobileMenu();
    }
  };

  if (mobile) {
    return (
      <div className="space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                isActive
                  ? "text-red-600 bg-red-50"
                  : "text-slate-700 hover:text-red-600 hover:bg-slate-50"
              }`}
              href={link.href}
              key={link.name}
              onClick={handleLinkClick}
            >
              {link.name}
            </Link>
          );
        })}

        {/* Mobile Login Button */}
        <Link
          href="/login"
          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200"
          onClick={handleLinkClick}
        >
          <LogIn className="w-4 h-4 mr-2" />
          Anmelden
        </Link>
      </div>
    );
  }

  // Desktop Navigation
  return (
    <div className="flex items-center gap-6">
      <div className="flex gap-6">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              className={`text-sm font-medium transition-colors duration-200 hover:text-red-600 ${
                isActive ? "text-red-600" : "text-slate-700"
              }`}
              href={link.href}
              key={link.name}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Desktop Login Button */}
      <Link
        href="/login"
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <User className="w-4 h-4 mr-2" />
        Anmelden
      </Link>
    </div>
  );
}
