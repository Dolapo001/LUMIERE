"use client";
import React from "react";
import type { CartItem as CartItemType } from "@/types";
import QuantitySelector from "./QuantitySelector";
import { X } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { formatPrice } from "@/utils/format";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { toast } = useToast();

  const handleRemove = () => {
    onRemove(item.id);
    toast(`${item.name} removed from cart`, "info");
  };

  return (
    <div className="flex gap-6 py-8 first:pt-0">
      {/* Image */}
      <div className="h-32 w-24 shrink-0 overflow-hidden rounded-md bg-gray-100 border border-gray-100">
        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-black truncate">{item.name}</h3>
            {item.category && <p className="mt-1 text-xs text-gray-500">{item.category}</p>}
            <p className="mt-2 text-sm font-medium text-black">{formatPrice(item.price, (item as any).currency)}</p>
          </div>
          {/* Line Total */}
          <div className="text-right">
             <button
              onClick={handleRemove}
              className="text-gray-400 hover:text-black transition-colors focus:outline-none"
              aria-label="Remove item"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-end justify-between mt-4">
          <QuantitySelector 
            quantity={item.quantity} 
            onUpdate={(newQuantity) => onUpdateQuantity(item.id, newQuantity)}
          />
          <p className="text-sm font-bold text-black border-b border-black">
            {formatPrice(item.price * item.quantity, (item as any).currency)}
          </p>
        </div>
      </div>
    </div>
  );
}
