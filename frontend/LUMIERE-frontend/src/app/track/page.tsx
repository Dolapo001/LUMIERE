"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Package, Truck, CheckCircle2, Clock, MapPin, Search, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { orderApi } from "@/services/api";
import { formatPrice } from "@/utils/format";

const STEPS = [
  { id: 'pending', title: "Order Placed", desc: "We received your order", icon: Package, level: 0 },
  { id: 'paid', title: "Processing", desc: "Preparing your items", icon: Clock, level: 1 },
  { id: 'shipped', title: "Shipped", desc: "Handed over to carrier", icon: Truck, level: 2 },
  { id: 'delivered', title: "Delivered", desc: "Package has arrived", icon: CheckCircle2, level: 4 }
];

const STATUS_LEVELS: Record<string, number> = {
  'pending': 0,
  'paid': 1,
  'shipped': 2,
  'delivered': 4,
  'cancelled': -1
};

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("id") || "";
  
  const [orderId, setOrderId] = useState(initialOrderId);
  const [isSearching, setIsSearching] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    
    setIsSearching(true);
    setError("");
    
    try {
      const data = await orderApi.trackOrder(orderId.trim());
      setTrackingData(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not find an order with this reference. Please verify your Order ID.");
      setTrackingData(null);
    } finally {
      setIsSearching(false);
    }
  };

  const currentLevel = trackingData ? STATUS_LEVELS[trackingData.status.toLowerCase()] : 0;

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-serif tracking-tight text-black uppercase">Track Order</h1>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Real-time logistics & Status</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Form Section */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6">Order Details</h2>
            <form onSubmit={handleSearch} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Order Reference</label>
                <input 
                  type="text" 
                  required 
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. LUM-000001"
                  className="w-full rounded-md border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 text-red-600 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold uppercase leading-relaxed">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSearching}
                className="w-full flex items-center justify-center gap-3 rounded-full bg-black px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white transition-all shadow-lg shadow-black/10 hover:bg-gray-800 disabled:opacity-50 active:scale-95"
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {isSearching ? "Locating..." : "Track Package"}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-7">
            {trackingData ? (
              <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
                
                {/* Visual Tracker */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm relative overflow-hidden">
                   <div className="flex justify-between items-start mb-10">
                      <div>
                        <h3 className="text-2xl font-bold text-black uppercase tracking-tighter">#{trackingData.id}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Status: {trackingData.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estimated Delivery</p>
                        <p className="text-sm font-bold text-black mt-1">Calculating...</p>
                      </div>
                   </div>

                   <div className="relative pt-2 pb-6 px-2">
                      <div className="absolute top-[34px] left-6 right-6 h-0.5 bg-gray-100" />
                      <div 
                        className="absolute top-[34px] left-6 h-0.5 bg-black transition-all duration-1000" 
                        style={{ width: `${Math.min(100, (currentLevel / 4) * 100)}%` }}
                      />
                      
                      <div className="relative flex justify-between">
                        {STEPS.map((step) => {
                          const Icon = step.icon;
                          const isCompleted = step.level <= currentLevel;
                          const isCurrent = step.level === currentLevel;

                          return (
                            <div key={step.id} className="flex flex-col items-center">
                              <div className={`
                                z-10 flex h-10 w-10 items-center justify-center rounded-full ring-8 ring-white transition-all duration-500
                                ${isCurrent ? 'bg-black text-white shadow-xl scale-110' : isCompleted ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}
                              `}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className={`mt-4 text-[9px] font-bold uppercase tracking-widest text-center max-w-[60px] ${isCurrent ? 'text-black' : 'text-gray-400'}`}>
                                {step.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                   </div>
                </div>

                {/* Items Summary */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Package Contents</h4>
                   <div className="space-y-4">
                      {trackingData.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-lg bg-gray-50 overflow-hidden border border-gray-100">
                                 <img src={item.product?.imageUrl} className="h-full w-full object-cover" alt="" />
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-black uppercase tracking-tight">{item.product?.name}</p>
                                 <p className="text-[10px] text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                              </div>
                           </div>
                           <p className="text-xs font-bold text-black">{formatPrice(item.price)}</p>
                        </div>
                      ))}
                   </div>
                   <div className="mt-8 pt-8 border-t border-gray-50 flex justify-between items-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Paid</p>
                      <p className="text-xl font-bold text-black font-serif">{formatPrice(trackingData.total_price)}</p>
                   </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-3xl">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                  <Package className="h-8 w-8 text-gray-200" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Awaiting Order Info</h3>
                <p className="mt-2 text-xs text-gray-400 max-w-[240px] leading-relaxed font-medium">Verify your order status by providing your credentials on the left.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
