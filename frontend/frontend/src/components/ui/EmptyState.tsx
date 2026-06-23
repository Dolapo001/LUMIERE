import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  title = "No products found", 
  description = "Try adjusting your filters or search criteria to find what you're looking for.", 
  actionText = "Clear all filters", 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-md border border-gray-100 bg-gray-50 py-24 px-4 text-center">
      <h3 className="text-sm font-medium text-black">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-sm">{description}</p>
      {onAction && (
        <button 
          onClick={onAction}
          className="mt-6 rounded-md bg-black px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
