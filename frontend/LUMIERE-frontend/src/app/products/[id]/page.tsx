import React from "react";
import { Metadata } from 'next';
import { productApi } from "@/services/api";
import ProductContent from "./ProductContent";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await productApi.getProduct(id);
    return {
      title: `${product.name} | Lumière`,
      description: product.description || `Experience the elegance of the ${product.name} at Lumière. Pure luxury, modern Nigerian craft.`,
      openGraph: {
        images: [product.imageUrl],
      },
    };
  } catch {
    return { title: 'Product Not Found' };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  
  try {
    const product = await productApi.getProduct(id);
    if (!product) return notFound();
    
    return <ProductContent product={product} />;
  } catch (err) {
    console.error("Error loading product:", err);
    return notFound();
  }
}
