"use client";
import React from 'react';
import { formatPrice } from '@/utils/format';

interface CartSummaryProps {
    subtotal: number;
    freeShippingThreshold?: number;
    onCheckout?: () => void;
}

export default function CartSummary({ subtotal, freeShippingThreshold = 50000, onCheckout }: CartSummaryProps) {
    const shipping = subtotal >= freeShippingThreshold ? 0 : 5000;
    const total = subtotal + shipping;

    return (
        <div className="w-full">
            <h2 className="text-lg font-semibold tracking-tight text-black mb-6">Order summary</h2>
            
            <div className="space-y-4 border-t border-gray-200 py-6">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium text-black">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Delivery</span>
                    <span className="font-medium text-black">
                        {shipping === 0 ? 'Complimentary' : formatPrice(shipping)}
                    </span>
                </div>
                {shipping > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                        Add {formatPrice(freeShippingThreshold - subtotal)} more for complimentary delivery.
                    </p>
                )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                <span className="text-base font-bold text-black">Total</span>
                <span className="text-lg font-bold text-black">{formatPrice(total)}</span>
            </div>

        </div>
    );
}
