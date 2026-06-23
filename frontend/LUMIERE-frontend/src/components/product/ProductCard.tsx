"use client";
import React from "react";
import Link from "next/link";
import type { Product } from "@/types";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice } from "@/utils/format";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useAppContext();
  const { toast } = useToast();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast(`Added ${product.name} to your cart`, "success");
  };

  // Backend returns category_name (from FK), frontend type has category
  const categoryLabel = (product as any).category_name || product.category || "Essential";

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="flex flex-col gap-3 transition-opacity hover:opacity-90">
        {/* Image */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
              <span className="rounded-full bg-white px-4 py-1.5 text-[10px] font-bold text-black uppercase tracking-widest shadow-sm">
                Sold Out
              </span>
            </div>
          )}
          
          {/* Quick Add Overlay */}
          {product.inStock && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <button 
                className="whitespace-nowrap rounded-full bg-white/95 px-6 py-2 text-xs font-semibold text-black shadow-lg backdrop-blur-md transition-colors hover:bg-black hover:text-white"
                onClick={handleQuickAdd}
              >
                Quick Add
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1 px-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium leading-tight text-gray-900 group-hover:underline underline-offset-4">{product.name}</h3>
            <p className="text-sm font-semibold text-black">{formatPrice(product.price, product.currency)}</p>
          </div>
          <p className="text-xs text-gray-500">{categoryLabel}</p>
        </div>
      </div>
    </Link>
  );
}
