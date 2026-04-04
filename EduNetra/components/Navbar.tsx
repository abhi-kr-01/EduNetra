"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContext";
import { User, LogOut, ChevronDown, CircleUser } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("shikshanetra_token");
      const loggedIn = localStorage.getItem("shikshanetra_logged_in") === "true";
      const userData = localStorage.getItem("shikshanetra_user");
      
      setIsLoggedIn(!!token || loggedIn);
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserRole(user.role);
        } catch (e) {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      
      setIsLoading(false);
    };
    checkLogin();
    window.addEventListener("storage", checkLogin);
    const interval = setInterval(checkLogin, 1000);
    
    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setProfileOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("storage", checkLogin);
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("shikshanetra_token");
    localStorage.removeItem("shikshanetra_user");
    localStorage.removeItem("shikshanetra_logged_in");
    document.cookie = "shikshanetra_logged_in=; path=/; max-age=0";
    showToast("Logged out successfully");
    router.push("/");
  };

  // Define navigation links based on user role
  const getNavLinks = () => {
    if (userRole === "Institution Admin") {
      return [
        { href: "/institution/dashboard", label: "Dashboard" },
        { href: "/institution/upload", label: "Upload" },
        { href: "/institution/history", label: "History" },
        { href: "/institution/summaries", label: "Summaries" },
      ];
    }
    
    // Default links for mentors/coordinators
    return [
      { href: "/upload", label: "Upload" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/history", label: "History" },
      { href: "/insights", label: "Insights" },
    ];
  };

  const navLinks = getNavLinks();
  const dashboardLink = userRole === "Institution Admin" ? "/institution/dashboard" : "/dashboard";

  // Don't render navbar while loading to avoid flash
  if (isLoading) {
    return null;
  }

  // Only render navbar if user is logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:py-3.5">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link 
              href={dashboardLink} 
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600 text-sm font-bold text-white shadow-sm">
                SN
              </div>
              <span className="text-lg font-semibold tracking-tight text-slate-900">
                <span className="text-primary-600">Shiksha</span>Netra
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition ${
                  pathname === link.href
                    ? "text-primary-700"
                    : "text-slate-700 hover:text-primary-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Profile Dropdown */}
            <div className="relative ml-2" ref={dropdownRef}>
                <button 
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 pl-2 pr-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-100 active:scale-95"
                >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                        <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold">Profile</span>
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-slate-100 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-1">
                            <Link
                                href="/profile"
                                className="group flex w-full items-center rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                onClick={() => setProfileOpen(false)}
                            >
                                <CircleUser className="mr-2.5 h-4 w-4 text-slate-400 group-hover:text-primary-600" />
                                My Profile
                            </Link>
                            <div className="my-1 border-t border-slate-100"></div>
                            <button
                                onClick={() => { handleLogout(); setProfileOpen(false); }}
                                className="group flex w-full items-center rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                                <LogOut className="mr-2.5 h-4 w-4 text-rose-400 group-hover:text-rose-600" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </div>
          
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
            aria-label="Toggle navigation"
          >
            <span className="sr-only">Open menu</span>
            <div className="space-y-1.5">
              <span className="block h-0.5 w-5 rounded-full bg-slate-700" />
              <span className="block h-0.5 w-5 rounded-full bg-slate-700" />
              <span className="block h-0.5 w-5 rounded-full bg-slate-700" />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 md:hidden">
            {isLoggedIn ? (
              <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-md px-2 py-2 transition ${
                      pathname === link.href
                        ? "bg-primary-50 text-primary-700"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-1 border-t border-slate-100"></div>
                <Link
                   href="/profile"
                   onClick={() => setOpen(false)}
                   className={`rounded-md px-2 py-2 transition hover:bg-slate-50 flex items-center gap-2 ${pathname === "/profile" ? "bg-primary-50 text-primary-700" : ""}`}
                >
                   <User className="h-4 w-4" /> Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="rounded-md border border-rose-300 bg-white px-2 py-2 text-left text-rose-700 transition hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full text-sm"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
