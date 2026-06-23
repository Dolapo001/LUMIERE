"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Menu, X, Loader2, LogOut } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { productApi } from "@/services/api";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useAppContext();
  const { user, logout } = useAuth();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Autocomplete fetch with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setLoadingSuggestions(true);
        try {
          const res = await productApi.getSuggestions(searchQuery);
          setSuggestions(res);
          setShowSuggestions(true);
        } catch (err) {
          setSuggestions([]);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      executeSearch(searchQuery.trim());
    }
  };

  const executeSearch = (q: string) => {
    router.push(`/products?q=${encodeURIComponent(q)}`);
    setShowSuggestions(false);
    setMobileMenuOpen(false);
    setSearchQuery(q);
  };

  return (
    <>
      <header 
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled || mobileMenuOpen
            ? "bg-white border-b border-gray-200" 
            : "bg-white border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Left: Mobile Menu Toggle & Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 text-black hover:bg-gray-50 focus:outline-none rounded-md transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold tracking-tighter text-black uppercase font-serif">
              LUMIÈRE
            </Link>
          </div>

          {/* Center/Left Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 ml-10">
            <Link href="/products" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 transition-colors hover:text-black">
              Shop
            </Link>
            <Link href="/chat" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 transition-colors hover:text-black relative flex items-center">
              Stylist <span className="absolute -right-4 -top-1.5 text-[7px] bg-black text-white px-1 py-0.5 rounded-sm">AI</span>
            </Link>
            <Link href="/track" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 transition-colors hover:text-black">
              Track Order
            </Link>
          </nav>
          
          <div className="flex-1" />

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Search */}
            <div className="relative hidden w-64 md:block group" ref={searchRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                placeholder="Search catalog..."
                className="w-full rounded-full border border-gray-100 bg-gray-50/50 py-2.5 pl-10 pr-4 text-xs tracking-tight transition-all focus:border-black/20 focus:bg-white focus:outline-none"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                {loadingSuggestions ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              </div>

              {/* Suggestions Portal */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                  {suggestions.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => executeSearch(item)}
                      className="w-full text-left px-4 py-2.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <Search className="h-3 w-3 text-gray-300" />
                      <span className="truncate">{item}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href={user ? "/account" : "/auth/login"} className="p-2 text-gray-600 transition-colors hover:text-black rounded-md group">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} className="h-5 w-5 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all border border-gray-200" alt="" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Link>

              <Link href="/cart" className="relative p-2 text-gray-600 transition-colors hover:text-black rounded-md flex items-center">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {user && (
                 <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 transition-colors hidden sm:block ml-1 border-l border-gray-200 pl-3" title="Sign Out">
                   <LogOut className="h-4 w-4" />
                 </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-30 bg-black/5 backdrop-blur-sm md:hidden animate-in fade-in" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="w-full max-w-xs h-full bg-white shadow-2xl animate-in slide-in-from-left-full duration-300 flex flex-col"
            onClick={e => e.stopPropagation()} 
          >
            <div className="p-6 border-b border-gray-50">
             <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  placeholder="Search..."
                  className="w-full rounded-md border border-gray-100 bg-gray-50 py-3 pl-10 pr-4 text-xs focus:border-black focus:bg-white focus:outline-none"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
              </div>
            </div>
            <nav className="flex flex-col p-6 gap-2">
              <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-bold uppercase tracking-widest text-black hover:bg-gray-50 rounded-md">
                Shop
              </Link>
              <Link href="/chat" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-bold uppercase tracking-widest text-black hover:bg-gray-50 rounded-md flex items-center justify-between group">
                Stylist <span className="bg-black text-white px-2 py-0.5 rounded text-[8px] transition-all group-hover:scale-105">AI</span>
              </Link>
              <Link href="/track" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-sm font-bold uppercase tracking-widest text-black hover:bg-gray-50 rounded-md">
                Track Order
              </Link>
              <div className="h-px bg-gray-100 my-4" />
              <Link href={user ? "/account" : "/auth/login"} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-3">
                <User className="h-4 w-4" />
                {user ? "Personal Profile" : "Sign In"}
              </Link>
              {user && (
                 <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors flex items-center gap-3">
                    <LogOut className="h-4 w-4" /> Sign Out
                 </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
