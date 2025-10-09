"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogIn, LogOut, User } from "lucide-react";
import { getBackendApiUrl } from "@/utils/backendApiUrl";
import { authFetch } from "@/utils/authFetch";

interface NavLinksProps {
  mobile?: boolean;
  closeMobileMenu?: () => void;
}

export default function NavLinks({
  mobile = false,
  closeMobileMenu,
}: NavLinksProps) {
  const router = useRouter();
  const backendApiUrl = useMemo(() => getBackendApiUrl(), []);
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProcessingLogout, setIsProcessingLogout] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      try {
        const hasToken =
          typeof window !== "undefined" && !!localStorage.getItem("authToken");
        setIsAuthenticated(hasToken);
      } catch (err) {
        console.error("Fehler beim Lesen des Auth-Status:", err);
        setIsAuthenticated(false);
      }
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("auth-change", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("auth-change", syncAuthState);
    };
  }, []);

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

  const handleLinkClick = () => {
    if (mobile && closeMobileMenu) {
      closeMobileMenu();
    }
  };

  const clearSession = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authTokenExpiresAt");
    document.cookie = "authToken=; path=/; max-age=0";
    window.dispatchEvent(new Event("auth-change"));
    setIsAuthenticated(false);
  };

  const handleLogout = async () => {
    setIsProcessingLogout(true);
    try {
      await authFetch(`${backendApiUrl}/auth/logout`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Fehler beim Abmelden:", err);
    } finally {
      clearSession();
      handleLinkClick();
      router.replace("/login");
      setIsProcessingLogout(false);
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

        {/* Mobile Auth Button */}
        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleLogout}
            disabled={isProcessingLogout}
            className="w-full flex items-center justify-center px-3 py-2 rounded-md text-base font-medium text-red-600 border border-red-200 hover:border-red-400 hover:bg-red-50 transition-all duration-200 disabled:opacity-60"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isProcessingLogout ? "Abmelden..." : "Abmelden"}
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200"
            onClick={handleLinkClick}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Anmelden
          </Link>
        )}
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
      {isAuthenticated ? (
        <button
          type="button"
          onClick={handleLogout}
          disabled={isProcessingLogout}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 border border-red-200 hover:border-red-400 hover:bg-red-50 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-60"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isProcessingLogout ? "Abmelden..." : "Abmelden"}
        </button>
      ) : (
        <Link
          href="/login"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <User className="w-4 h-4 mr-2" />
          Anmelden
        </Link>
      )}
    </div>
  );
}
