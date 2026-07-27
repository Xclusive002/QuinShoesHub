'use client';

import { categories } from '@/lib/products';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FiltersProps {
  onFilterChange?: (filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }) => void;
}

export function Filters({ onFilterChange }: FiltersProps) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [showSort, setShowSort] = useState(false);

  const handleSort = (value: string) => {
    setSortBy(value);
    setShowSort(false);
    onFilterChange?.({
      category: selectedCategory || undefined,
      sortBy: value,
    });
  };

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-background/95 p-4 shadow-sm md:border-0 md:bg-transparent md:p-0 md:shadow-none">
      {/* Sort */}
      <div className="border-b border-border pb-6">
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="w-full flex items-center justify-between text-sm font-medium"
          >
            <span className="text-muted-foreground">
              Sort: <span className="text-foreground capitalize">{sortBy}</span>
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showSort ? 'rotate-180' : ''}`} />
          </button>
          {showSort && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border z-10">
              {[
                { label: 'Newest', value: 'newest' },
                { label: 'Price: Low to High', value: 'price-asc' },
                { label: 'Price: High to Low', value: 'price-desc' },
                { label: 'Best Rating', value: 'rating' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSort(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors ${
                    sortBy === option.value ? 'bg-secondary' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-b border-border pb-6">
        <h3 className="font-display font-bold text-sm mb-4">CATEGORY</h3>
        <div className="space-y-2">
          <Link
            href="/shop"
            className={`block text-sm hover:underline transition-all ${!selectedCategory ? 'font-bold' : 'text-muted-foreground'}`}
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.id}`}
              className={`block text-sm hover:underline transition-all ${
                selectedCategory === category.id ? 'font-bold' : 'text-muted-foreground'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="border-b border-border pb-6">
        <h3 className="font-display font-bold text-sm mb-4">PRICE RANGE</h3>
        <div className="space-y-3">
          {[
            { label: 'Under ₦100,000', min: 0, max: 100000 },
            { label: '₦100,000 - ₦200,000', min: 100000, max: 200000 },
            { label: '₦200,000 - ₦350,000', min: 200000, max: 350000 },
            { label: 'Over ₦350,000', min: 350000, max: 10000000 },
          ].map((range) => (
            <label key={range.label} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm text-muted-foreground hover:text-foreground">{range.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
