"use client";

import NavLinks from "./NavLinks";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function Nav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="sticky top-0 z-50 px-4 pt-4 mb-8">
        <nav
          className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 ${
            scrolled
              ? "bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-900/10 border border-slate-200/60"
              : "bg-white/90 backdrop-blur-lg shadow-lg shadow-slate-900/5 border border-slate-200/40"
          }`}
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 lg:h-20">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link href="/" className="group">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 via-red-600 to-red-700 bg-clip-text text-transparent hover:from-red-700 hover:to-red-800 transition-all duration-300 cursor-pointer">
                    Tablohm
                  </h1>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:block">
                <NavLinks />
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-3 rounded-xl text-slate-700 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 active:scale-95"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden pb-4">
                <div className="px-2 py-4 space-y-2 rounded-xl bg-gradient-to-b from-slate-50/50 to-white/50 border border-slate-200/40">
                  <NavLinks
                    mobile={true}
                    closeMobileMenu={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
