"use client";
import React from 'react';
import Link from 'next/link';

interface EmptyCartProps {
    onContinueShopping?: () => void;
}

export default function EmptyCart({ onContinueShopping }: EmptyCartProps) {
    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">Your cart is empty</h1>
            <p className="mt-4 text-sm text-gray-500">Looks like you haven't added anything yet.</p>
            <div className="mt-8">
                {onContinueShopping ? (
                    <button 
                        onClick={onContinueShopping}
                        className="rounded-md bg-black px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                        Continue shopping
                    </button>
                ) : (
                    <Link 
                        href="/products" 
                        className="inline-block rounded-md bg-black px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                        Continue shopping
                    </Link>
                )}
            </div>
        </div>
    );
}
