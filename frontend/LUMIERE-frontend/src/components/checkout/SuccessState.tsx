"use client";
import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Package, Mail, Calendar } from 'lucide-react';
import { formatPrice } from '@/utils/format';

interface SuccessStateProps {
  orderId: string;
  email: string;
  items?: any[];
}

export default function SuccessState({ orderId, email, items = [] }: SuccessStateProps) {
  const today = new Date().toLocaleDateString('en-NG', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>

        {/* Narrative */}
        <div className="space-y-3">
          <h1 className="text-4xl font-serif font-bold text-black tracking-tight">Thank you for your order.</h1>
          <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
            Your request has been accepted into the Lumière fulfillment network. A confirmation has been dispatched to <span className="text-black font-semibold">{email}</span>.
          </p>
        </div>

        {/* Order Card */}
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 text-left space-y-6 overflow-hidden">
          <div className="flex justify-between items-start border-b border-gray-200 pb-6">
             <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order Reference</p>
                <p className="text-sm font-mono font-bold text-black mt-1">
                  {orderId.toString().startsWith('LUM-') ? `#${orderId}` : `#LUM-${orderId.toString().padStart(6, '0')}`}
                </p>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Date Placed</p>
                <p className="text-sm font-bold text-black mt-1">{today}</p>
             </div>
          </div>

          {/* Purchased Items List */}
          {items.length > 0 && (
            <div className="py-2 max-h-[160px] overflow-y-auto space-y-4 border-b border-gray-200 pb-6 custom-scrollbar">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="h-12 w-10 shrink-0 rounded bg-white border border-gray-100 overflow-hidden">
                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-black truncate">{item.name}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-[10px] font-bold text-black">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-8 pt-2">
            <div className="flex gap-4">
              <Package className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black">Status</p>
                <p className="text-xs text-gray-500 mt-1">Preparing for shipment</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black">Est. Delivery</p>
                <p className="text-xs text-gray-500 mt-1">Within 3-5 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Call */}
        <div className="pt-4 flex flex-col gap-4">
          <Link 
            href="/products" 
            className="flex items-center justify-center gap-2 bg-black text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-black/10"
          >
            Continue Exploring <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex justify-center items-center gap-2 text-[10px] font-medium text-gray-400 uppercase tracking-widest cursor-default">
            <Mail className="h-3 w-3" /> Support: hello@houseoflumiere.com
          </div>
        </div>

      </div>
    </div>
  );
}
