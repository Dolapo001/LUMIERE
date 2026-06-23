"use client";
import React, { useEffect, useState, useCallback, Suspense } from "react";
import FilterSidebar from "@/components/filters/FilterSidebar";
import ProductGrid from "@/components/product/ProductGrid";
import SortDropdown from "@/components/ui/SortDropdown";
import { productApi } from "@/services/api";
import type { Product } from "@/types";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ProductsContent() {
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("q");
  const query = rawQuery || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  const [filters, setFilters] = useState({
    category: "all",
    price: "all",
    color: "all",
    brand: "all"
  });
  const [sort, setSort] = useState("-created_at");

  const fetchProducts = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const queryParams: Record<string, any> = { 
        ...filters,
        ordering: sort,
        page: isLoadMore ? page + 1 : 1
      };

      if (query) queryParams.q = query;

      if (queryParams.price !== 'all') {
        const [min, max] = queryParams.price.split('-');
        if (min) queryParams.min_price = min;
        if (max && max !== 'plus') queryParams.max_price = max;
      }
      delete queryParams.price;

      if (queryParams.category === 'all') delete queryParams.category;
      if (queryParams.color === 'all') delete queryParams.color;
      if (queryParams.brand === 'all') delete queryParams.brand;

      const res = await productApi.getProducts(queryParams);
      
      const newProducts = res.results || [];
      if (isLoadMore) {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(prev => prev + 1);
      } else {
        setProducts(newProducts);
        setPage(1);
      }
      
      setHasNextPage(!!res.next);
    } catch (err) {
      console.error("Failed to fetch products", err);
      if (!isLoadMore) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, query, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [filters, query, sort]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (value: string) => {
    setSort(value);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasNextPage) {
      fetchProducts(true);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Structural Header */}
      <div className="border-b border-gray-200">
        <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl animate-in slide-in-from-bottom-2 fade-in">
                {query ? `Search: "${query}"` : "Products"}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {loading ? "Counting items..." : `${products.length} elegant essentials found.`}
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-4">
              <span className="text-xs text-gray-500 hidden sm:inline-block">Sort by:</span>
              <SortDropdown value={sort} onChange={handleSortChange} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[90rem] px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* LEFT Sidebar */}
          <div className="w-full lg:w-[260px] shrink-0">
            <FilterSidebar activeFilters={filters} onChange={handleFilterChange} />
          </div>

          {/* RIGHT Content Panel */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4 sm:gap-x-6 sm:gap-y-12 animate-pulse">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="aspect-[3/4] w-full rounded-lg bg-gray-100" />
                    <div className="h-4 w-2/3 rounded bg-gray-100" />
                    <div className="h-4 w-1/4 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <ProductGrid products={products} />
                
                {hasNextPage && (
                  <div className="mt-16 flex justify-center border-t border-gray-100 pt-10">
                    <button 
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="rounded-md border border-gray-300 bg-white px-8 py-3 text-sm font-medium text-black transition-colors hover:border-black hover:bg-gray-50 disabled:opacity-50"
                    >
                      {loadingMore ? "Loading more..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center border border-gray-100 rounded-lg bg-gray-50/50">
                <h3 className="mt-2 text-lg font-semibold text-black">No products found</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-md">
                  We couldn't locate any items matching your current filters or search query. 
                </p>
                <Link 
                  href="/products" 
                  className="mt-6 rounded-md bg-black px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Clear search & filters
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-white flex items-center justify-center">
         <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
       </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
