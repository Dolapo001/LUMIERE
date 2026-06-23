import { Metadata } from 'next';
import Hero from "@/components/landing/Hero";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import Categories from "@/components/landing/Categories";
import AIEntry from "@/components/landing/AIEntry";

export const metadata: Metadata = {
  title: 'Lumière | Modern Nigerian Fashion & AI Stylist',
  description: 'Discover luxury Nigerian fashion curated by AI. Shop our latest collections of bespoke-grade pieces and experience personalized styling like never before.',
};

export default function HomePage() {
  return (
    <div className="flex w-full flex-col">
      <Hero />
      <FeaturedProducts />
      <Categories />
      <AIEntry />
    </div>
  );
}
