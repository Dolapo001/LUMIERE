"use client";
import React, { useEffect, useState } from 'react';
import FilterSection from './FilterSection';
import { productApi } from '@/services/api';

interface FilterSidebarProps {
  activeFilters: {
    category: string;
    price: string;
    color: string;
    brand: string;
  };
  onChange: (key: string, value: string) => void;
}

const PRICE_OPTIONS = [
  { label: 'Any price', value: 'all' },
  { label: 'Under $100', value: '0-100' },
  { label: '$100 - $300', value: '100-300' },
  { label: '$300 - $500', value: '300-500' },
  { label: 'Over $500', value: '500-plus' }
];

export default function FilterSidebar({ activeFilters, onChange }: FilterSidebarProps) {
  const [categories, setCategories] = useState([{ label: 'All Categories', value: 'all' }]);
  const [colors, setColors] = useState([{ label: 'All Colors', value: 'all' }]);
  const [brands, setBrands] = useState([{ label: 'All Brands', value: 'all' }]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await productApi.getMetadata();
        
        if (data.categories) {
          const catOptions = data.categories.map((c: any) => ({ label: c.name, value: c.name }));
          setCategories([{ label: 'All Categories', value: 'all' }, ...catOptions]);
        }

        if (data.colors) {
          const colorOptions = data.colors.map((c: string) => ({ 
            label: c.charAt(0).toUpperCase() + c.slice(1), 
            value: c 
          }));
          setColors([{ label: 'All Colors', value: 'all' }, ...colorOptions]);
        }

        if (data.brands) {
          const brandOptions = data.brands.map((b: string) => ({ label: b, value: b }));
          setBrands([{ label: 'All Brands', value: 'all' }, ...brandOptions]);
        }
      } catch (err) {
        console.error("Failed to fetch filter metadata", err);
      }
    };

    fetchMetadata();
  }, []);

  return (
    <aside className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Refine Selection</h2>
        <button 
          onClick={() => {
            onChange('category', 'all');
            onChange('price', 'all');
            onChange('color', 'all');
            onChange('brand', 'all');
          }}
          className="text-[10px] font-bold uppercase tracking-widest text-black underline underline-offset-4 hover:opacity-60 transition-opacity"
        >
          Clear
        </button>
      </div>

      <div className="flex flex-col gap-10">
        <FilterSection 
          title="Collections" 
          options={categories} 
          selectedValue={activeFilters.category} 
          onChange={(val) => onChange('category', val)} 
        />
        
        <FilterSection 
          title="Price" 
          options={PRICE_OPTIONS} 
          selectedValue={activeFilters.price} 
          onChange={(val) => onChange('price', val)} 
        />

        <FilterSection 
          title="Brand" 
          options={brands} 
          selectedValue={activeFilters.brand} 
          onChange={(val) => onChange('brand', val)} 
        />
        
        <FilterSection 
          title="Palette" 
          options={colors} 
          selectedValue={activeFilters.color} 
          onChange={(val) => onChange('color', val)} 
          type="pill"
        />
      </div>
    </aside>
  );
}
