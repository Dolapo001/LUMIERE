import React from 'react';
import type { Product } from '@/types';
import AddToCartButton from '../cart/AddToCartButton';
import { formatPrice } from '@/utils/format';

interface ProductInfoProps {
    product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    return (
        <div className="flex flex-col w-full">
            <div className="border-b border-gray-200 pb-6 mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">{product.name}</h1>
                <p className="mt-2 text-xl text-gray-900">{formatPrice(product.price, product.currency)}</p>
                <div className="mt-6 prose prose-sm text-gray-500">
                    <p>{product.description || "A structured, high-quality essential meticulously crafted for precision and ease. This piece represents the modern intersection of calm design and dependable utility."}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="mb-10 space-y-4">
                <AddToCartButton product={product} />
            </div>

            {/* Expander Info */}
            <div className="border-t border-gray-200 divide-y divide-gray-200">
                <details className="group py-4">
                    <summary className="flex cursor-pointer items-center justify-between font-medium text-sm text-black">
                        Details & Care
                        <span className="text-gray-400 group-open:rotate-180 transition-transform">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </span>
                    </summary>
                    <div className="mt-4 text-sm text-gray-500 leading-relaxed">
                        <ul className="list-disc pl-4 space-y-1">
                            <li>100% premium sourced material.</li>
                            <li>Dry clean only.</li>
                            <li>Responsibly manufactured.</li>
                        </ul>
                    </div>
                </details>
                <details className="group py-4">
                    <summary className="flex cursor-pointer items-center justify-between font-medium text-sm text-black">
                        Shipping & Returns
                        <span className="text-gray-400 group-open:rotate-180 transition-transform">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </span>
                    </summary>
                    <div className="mt-4 text-sm text-gray-500 leading-relaxed">
                        Complimentary shipping on all orders over ₦50,000. Returns accepted within 7 days of delivery in original, unworn condition.
                    </div>
                </details>
            </div>
        </div>
    );
}
