import React from 'react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  type?: 'list' | 'pill';
}

export default function FilterSection({ title, options, selectedValue, onChange, type = 'list' }: FilterSectionProps) {
  return (
    <div className="border-b border-gray-100 py-6 last:border-0">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-900">{title}</h3>
      
      {type === 'list' && (
        <ul className="space-y-3">
          {options.map((option) => {
            const isSelected = selectedValue === option.value;
            return (
              <li key={option.value}>
                <label className="flex cursor-pointer items-center gap-3 group">
                  <div className={`flex h-4 w-4 items-center justify-center rounded-sm border transition-colors ${isSelected ? 'border-black bg-black' : 'border-gray-300 bg-white group-hover:border-black'}`}>
                    {isSelected && (
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${isSelected ? 'font-medium text-black' : 'text-gray-500 group-hover:text-black'}`}>
                    {option.label}
                  </span>
                  {/* Invisible input */}
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={isSelected}
                    onChange={() => onChange(isSelected ? 'all' : option.value)}
                  />
                </label>
              </li>
            );
          })}
        </ul>
      )}
      
      {type === 'pill' && (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = selectedValue === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onChange(isSelected ? 'all' : option.value)}
                className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                  isSelected 
                    ? 'border-black bg-black text-white' 
                    : 'border-gray-200 bg-white text-gray-600 hover:border-black hover:text-black'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
