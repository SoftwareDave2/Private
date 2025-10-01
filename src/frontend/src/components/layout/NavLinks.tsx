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
      href: "/events",
      name: "Events",
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
      <div className="space-y-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              className={`block px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                isActive
                  ? "text-red-600 bg-gradient-to-r from-red-50 to-red-100/50 shadow-sm border border-red-200/50"
                  : "text-slate-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50 active:scale-[0.98]"
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
          className="flex items-center justify-center px-4 py-3.5 mt-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 active:scale-[0.98]"
          onClick={handleLinkClick}
        >
          <LogIn className="w-5 h-5 mr-2" />
          Anmelden
        </Link>
      </div>
    );
  }

  // Desktop Navigation
  return (
    <div className="flex items-center gap-8">
      <div className="flex gap-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                isActive
                  ? "text-red-600"
                  : "text-slate-700 hover:text-red-600 hover:bg-slate-50"
              }`}
              href={link.href}
              key={link.name}
            >
              {link.name}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-red-600 to-red-700 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Desktop Login Button */}
      <Link
        href="/login"
        className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 hover:scale-105 active:scale-95"
      >
        <User className="w-4 h-4 mr-2" />
        Anmelden
      </Link>
    </div>
  );
}
