"use client";
import React from "react";
import Link from "next/link";
import { ExternalLink, ShoppingBag } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { Product } from "@/types";
import { formatPrice } from "@/utils/format";

interface ChatProductCardProps {
  product: Product;
}

export default function ChatProductCard({ product }: ChatProductCardProps) {
  const { addToCart } = useAppContext();
  const { toast } = useToast();

  const handleAdd = () => {
    addToCart({
      ...product,
      quantity: 1
    } as any);
    toast(`${product.name} added to bag`, "success");
  };

  return (
    <div className="w-full max-w-[260px] rounded-lg border border-gray-100 bg-white p-3 space-y-3 mb-2 shadow-md hover:shadow-lg transition-shadow duration-300 group">
      <div className="aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-50 border border-gray-100 relative">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        {product.is_featured && (
            <span className="absolute top-2 left-2 text-[8px] font-bold uppercase tracking-widest bg-black text-white px-2 py-1 rounded-sm">Featured</span>
        )}
      </div>
      
      <div>
        <div className="text-[11px] font-bold text-black line-clamp-1 uppercase tracking-wider">{product.name}</div>
        <div className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-widest">{product.category_name}</div>
        <div className="text-xs font-bold text-black mt-2">{formatPrice(product.price, product.currency)}</div>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button 
          onClick={handleAdd}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-black py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-gray-800 active:scale-95"
        >
          Add to Bag <ShoppingBag className="h-3.5 w-3.5" />
        </button>
        <Link 
          href={`/products/${product.id}`}
          className="flex w-full items-center justify-center gap-1.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-black hover:underline underline-offset-4"
        >
          Details <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
