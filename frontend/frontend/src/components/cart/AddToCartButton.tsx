'use client';
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/context/ToastContext';
import type { Product } from '@/types';

interface AddToCartButtonProps {
    product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addToCart } = useAppContext();
    const { toast } = useToast();
    const [isPending, setIsPending] = useState(false);
    
    const handleAdd = () => {
        if (!product.inStock) return;
        setIsPending(true);
        // Simulate minor network delay for realistic feedback loop
        setTimeout(() => {
            addToCart(product);
            toast(`Added ${product.name} to your cart`, "success");
            setIsPending(false);
        }, 400);
    };

    if (!product.inStock) {
        return (
            <button disabled className="w-full rounded-md border border-gray-200 bg-gray-50 py-4 text-sm font-medium text-gray-400 cursor-not-allowed">
                Out of Stock
            </button>
        );
    }

    return (
        <button 
            onClick={handleAdd}
            disabled={isPending}
            className="w-full rounded-md bg-black py-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isPending ? 'Adding...' : 'Add to Cart'}
        </button>
    );
}
