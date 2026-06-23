"use client";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { usePathname, useRouter } from "next/navigation";
import { Clock, ArrowRight, X } from "lucide-react";

export default function AbandonedCartRecovery() {
  const { cart } = useAppContext();
  const pathname = usePathname();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Only engage recovery if they have items and are not actively checking out
    const isShoppingRoute = !pathname.includes("/cart") && !pathname.includes("/checkout");
    const hasItems = cart.length > 0;

    if (!hasItems || !isShoppingRoute || isDismissed) {
      setShow(false);
      return;
    }

    // Trigger behavior: If they have items and navigate around the site, drop a reminder after a short delay
    const timer = setTimeout(() => {
      setShow(true);
    }, 4500); // 4.5 seconds for demo realism (usually 10-15 mins in prod)

    return () => clearTimeout(timer);
  }, [cart.length, pathname, isDismissed]);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-4 sm:p-6 pointer-events-none">
      <div className="pointer-events-auto flex w-full max-w-xl items-center justify-between gap-4 rounded-lg border border-black bg-white px-5 py-4 shadow-2xl animate-in slide-in-from-top-10 fade-in duration-500">
        
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 border border-gray-100">
            <Clock className="h-5 w-5 text-black" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-black">Don't lose your selections</h4>
            <p className="text-xs font-medium text-gray-500 mt-0.5">
              Secure your cart now and enjoy <span className="text-black font-semibold">Complimentary Next-Day Shipping</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => router.push('/cart')}
            className="flex items-center gap-1.5 rounded bg-black px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
          >
            Checkout <ArrowRight className="h-3 w-3" />
          </button>
          <button 
            onClick={() => setIsDismissed(true)}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
