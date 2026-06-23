"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User as UserIcon, Package, MapPin, LogOut, ChevronRight, Loader2 } from "lucide-react";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-black" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-12">
          
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center text-white font-serif text-xl">
                  {user.first_name?.[0] || user.email[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider">{user.first_name || 'Member'}</h3>
                  <p className="text-[10px] font-medium text-gray-400 truncate w-32">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                <Link 
                  href="/account"
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${pathname === '/account' ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-4 w-4" /> Profile
                  </div>
                  <ChevronRight className={`h-3 w-3 ${pathname === '/account' ? 'opacity-100' : 'opacity-0'}`} />
                </Link>
                <Link 
                  href="/account/orders"
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${pathname === '/account/orders' ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4" /> Orders
                  </div>
                  <ChevronRight className={`h-3 w-3 ${pathname === '/account/orders' ? 'opacity-100' : 'opacity-0'}`} />
                </Link>
                <Link 
                  href="/account/addresses"
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${pathname === '/account/addresses' ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4" /> Addresses
                  </div>
                  <ChevronRight className={`h-3 w-3 ${pathname === '/account/addresses' ? 'opacity-100' : 'opacity-0'}`} />
                </Link>
                <div className="h-px bg-gray-100 my-4" />
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-50 transition-all"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </nav>
            </div>
          </aside>

          <main className="flex-1 w-full relative">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
