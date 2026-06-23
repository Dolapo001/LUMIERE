"use client";
import React, { useEffect, useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types';
import { productApi } from '@/services/api';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await productApi.getProducts({ is_featured: true });
        // The API might return { results: [...] } or just an array
        const data = Array.isArray(response) ? response : (response.results || []);
        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  if (loading && products.length === 0) {
    return (
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="h-8 w-32 animate-pulse rounded bg-gray-100 mb-8" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-xl font-semibold text-black">Featured</h2>
          <a href="/products" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">View all</a>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
