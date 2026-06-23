"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { productApi } from '@/services/api';

interface CategoryDisplay {
  id: number | string;
  name: string;
  href: string;
  image: string;
}

// Fallback images specifically for these category names
const CATEGORY_IMAGES: Record<string, string> = {
  "Electronics": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80",
  "Fashion": "https://images.unsplash.com/photo-1583329931327-024036136f97?w=600&q=80",
  "Accessories": "https://images.unsplash.com/photo-1539109132381-31a1bf874dd8?w=600&q=80",
  "Footwear": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
  "Home & Living": "https://images.unsplash.com/photo-1579656333226-d4bd98cc7969?w=600&q=80",
  "Beauty": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80"
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80";

export default function Categories() {
  const [categories, setCategories] = useState<CategoryDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await productApi.getCategories();
        const mapped = data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          href: `/products?category=${cat.name.toLowerCase()}`,
          image: CATEGORY_IMAGES[cat.name] || DEFAULT_IMAGE
        }));
        setCategories(mapped.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading && categories.length === 0) {
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="h-10 w-64 animate-pulse rounded bg-gray-100 mb-10" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">Shop by Category</h2>
          <Link href="/products" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
            View all categories &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link 
              key={category.name} 
              href={category.href}
              className="group relative h-96 overflow-hidden rounded-xl bg-gray-100"
            >
              <img 
                src={category.image} 
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity group-hover:opacity-90"></div>
              
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white tracking-wide">{category.name}</h3>
                <p className="mt-2 text-sm text-gray-300 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 text-xs font-bold uppercase tracking-widest">
                  Shop collection &rarr;
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
