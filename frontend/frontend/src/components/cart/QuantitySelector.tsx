import React from 'react';

interface QuantitySelectorProps {
    quantity: number;
    onUpdate: (newQuantity: number) => void;
}

export default function QuantitySelector({ quantity, onUpdate }: QuantitySelectorProps) {
    return (
        <div className="flex h-9 w-28 items-center rounded-md border border-gray-200 bg-white">
            <button 
                onClick={() => onUpdate(quantity - 1)}
                className="flex h-full w-1/3 items-center justify-center text-gray-500 transition-colors hover:text-black hover:bg-gray-50 disabled:opacity-50"
                disabled={quantity <= 0}
            >
                <span className="text-lg leading-none">-</span>
            </button>
            <div className="flex h-full w-1/3 items-center justify-center border-x border-gray-200 text-xs font-medium text-black">
                {quantity}
            </div>
            <button 
                onClick={() => onUpdate(quantity + 1)}
                className="flex h-full w-1/3 items-center justify-center text-gray-500 transition-colors hover:text-black hover:bg-gray-50"
            >
                <span className="text-lg leading-none">+</span>
            </button>
        </div>
    );
}
