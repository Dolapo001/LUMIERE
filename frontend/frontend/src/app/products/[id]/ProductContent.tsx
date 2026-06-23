"use client";
import React from "react";
import type { Product } from "@/types";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import RecommendedProducts from "@/components/product/RecommendedProducts";

interface ProductContentProps {
  product: Product;
}

export default function ProductContent({ product }: ProductContentProps) {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 pt-16">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="w-full lg:w-1/2">
            <ProductGallery 
              mainImageUrl={product.imageUrl} 
              galleryImages={product.gallery_images} 
              name={product.name} 
            />
          </div>
          <div className="w-full lg:w-1/2 md:pt-4">
            <div className="sticky top-24">
              <ProductInfo product={product} />
            </div>
          </div>
        </div>
        <RecommendedProducts productId={product.id} />
      </main>
    </div>
  );
}
