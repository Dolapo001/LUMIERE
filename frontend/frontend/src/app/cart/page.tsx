"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { productApi } from "@/services/api";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import EmptyCart from "@/components/cart/EmptyCart";
import { Product } from "@/types";
import { formatPrice } from "@/utils/format";
import { Loader2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, cartTotal, addToCart } = useAppContext();
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [upsellProducts, setUpsellProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchUpsells = async () => {
      try {
        let data;
        if (cart.length > 0) {
          // AI Recommendation based on what's in your cart
          data = await productApi.getRelatedProducts(cart[0].id);
        } else {
          const res = await productApi.getProducts({ is_featured: true });
          data = res.results || [];
        }
        setUpsellProducts(data?.slice(0, 2) || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUpsells();
  }, [cart]);

  const handleCheckout = async () => {
    setIsValidating(true);
    try {
      const simplifiedItems = cart.map(item => ({ id: item.id, quantity: item.quantity }));
      const res = await productApi.validateCart(simplifiedItems);
      
      if (res.is_valid) {
        router.push('/checkout');
      } else {
        // Find inconsistencies
        const issues = res.items.filter((i: any) => i.status !== "available");
        if (issues.length > 0) {
          toast(`Some items in your cart are no longer available in the requested quantity.`, "error");
        }
      }
    } catch (err) {
      toast("Checkout unavailable. Please try again later.", "error");
    } finally {
      setIsValidating(false);
    }
  };

  const handleUpsell = (product: Product) => {
    addToCart(product);
    toast(`${product.name} added to bag`, "success");
  };

  if (cart.length === 0) {
    return <EmptyCart onContinueShopping={() => router.push("/products")} />;
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Structural Header */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-black font-serif">Your Bag</h1>
            <p className="mt-2 text-sm text-gray-500 uppercase tracking-widest font-bold">
              {cart.length} {cart.length === 1 ? 'Individual Piece' : 'Selected Pieces'}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <ShieldCheck className="h-4 w-4" /> Secure Checkout Verified
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-20">
          
          {/* LEFT: Cart Item List */}
          <div className="w-full lg:w-3/5">
            <div className="divide-y divide-gray-100 border-t border-gray-100">
              {cart.map((item) => (
                <div key={item.id} className="py-8 animate-in fade-in slide-in-from-left-4">
                  <CartItem
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-12 pt-10 border-t border-gray-100 flex justify-between items-center">
               <Link href="/products" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-2">
                 ← Continue Shopping
               </Link>
               <div className="flex items-center gap-4">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3 opacity-30" alt="Visa" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5 opacity-30" alt="Mastercard" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4 opacity-30" alt="PayPal" />
               </div>
            </div>
          </div>

          {/* RIGHT: Totals & Upsell */}
          <div className="w-full lg:w-2/5">
            <div className="sticky top-28 space-y-12">
              
              {/* Checkout Summary */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl shadow-gray-100/50">
                <CartSummary 
                  subtotal={cartTotal} 
                  onCheckout={handleCheckout} 
                  freeShippingThreshold={50000}
                />
                
                <button 
                  onClick={handleCheckout}
                  disabled={isValidating}
                  className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-black px-6 py-5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-gray-800 disabled:bg-gray-300 shadow-lg shadow-black/10 active:scale-95"
                >
                  {isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <>
                      Go to Checkout <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
                
                <p className="mt-4 text-[10px] text-center text-gray-400 font-medium">
                  Complimentary carbon-neutral shipping on this order.
                </p>
              </div>

              {/* Dynamic Upsell: Complete the Look */}
              {upsellProducts.length > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="h-4 w-4 text-black" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">Complete Your Look</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {upsellProducts.map(product => (
                      <div key={product.id} className="flex gap-4 items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-black transition-colors group">
                        <div className="h-20 w-16 shrink-0 overflow-hidden rounded bg-gray-50 border border-gray-100">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[11px] font-bold text-black uppercase tracking-wider">{product.name}</h4>
                          <p className="text-[10px] font-medium text-gray-400 mt-1">{formatPrice(product.price, (product as any).currency)}</p>
                        </div>
                        <button 
                          onClick={() => handleUpsell(product)}
                          className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-black border border-black rounded-full px-5 py-2 transition-all hover:bg-black hover:text-white"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
