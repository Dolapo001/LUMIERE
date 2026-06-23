"use client";
import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { productApi } from "@/services/api";
import type { Product } from "@/types";

interface RecommendedProductsProps {
    productId?: string;
}

export default function RecommendedProducts({ productId }: RecommendedProductsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            try {
                let data;
                if (productId) {
                    // Fetch category-related items from backend
                    data = await productApi.getRelatedProducts(productId);
                } else {
                    // Fallback to featured items
                    const res = await productApi.getProducts({ is_featured: true });
                    data = res.results || [];
                }
                
                if (Array.isArray(data)) {
                    setProducts(data.slice(0, 4));
                }
            } catch (err) {
                console.error("Failed to load recommendations", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [productId]);

    if (!loading && products.length === 0) return null;

    return (
        <section className="mt-24 border-t border-gray-200 pt-16">
            <h2 className="text-xl font-semibold text-black tracking-tight mb-8">You may also like</h2>
            
            {loading ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-12 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[3/4] w-full rounded-lg bg-gray-100" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-12">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
}
