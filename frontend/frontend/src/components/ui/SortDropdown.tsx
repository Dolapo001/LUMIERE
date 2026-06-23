"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Newest Arrivals', value: '-created_at' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' }
];

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = SORT_OPTIONS.find(opt => opt.value === value) || SORT_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-black transition-colors hover:border-gray-300 min-w-[160px] justify-between"
      >
        <span>{selected.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider transition-colors hover:bg-gray-50/80 ${
                value === option.value ? 'bg-gray-100 text-black' : 'text-gray-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
