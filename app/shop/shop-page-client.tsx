'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Filters } from '@/components/filters';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/products';
import { ChevronDown } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export function ShopPageClient() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = () => {
      fetch(`/api/products${category ? `?category=${encodeURIComponent(category)}` : ''}`, { cache: 'no-store' })
        .then((response) => response.json())
        .then((data) => {
          if (isMounted) {
            setProducts(data.products ?? []);
          }
        })
        .catch(() => {
          if (isMounted) {
            setProducts([]);
          }
        });
    };

    const handleRefresh = () => {
      loadProducts();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProducts();
      }
    };

    loadProducts();

    window.addEventListener('quinn-products-updated', handleRefresh);
    window.addEventListener('quinn-notifications-updated', handleRefresh);
    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener('quinn-products-updated', handleRefresh);
      window.removeEventListener('quinn-notifications-updated', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [category]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        break;
    }

    return filtered;
  }, [products, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedProducts = filteredAndSortedProducts.slice(startIdx, endIdx);

  const handleFilterChange = (filters: any) => {
    setSortBy(filters.sortBy || 'newest');
    setCurrentPage(1);
  };

  return (
    <>
      <Navigation />
      <main className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-sm font-medium text-muted-foreground mb-2 tracking-widest uppercase">
              Shop
            </p>
            <h1 className="text-5xl lg:text-6xl font-display font-bold mb-4">
              {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Products'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {filteredAndSortedProducts.length} products available
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <aside className="hidden lg:block">
              <Filters onFilterChange={handleFilterChange} />
            </aside>

            <div className="lg:col-span-3">
              <div className="mb-8 flex items-center justify-between lg:hidden">
                <p className="text-sm text-muted-foreground">{filteredAndSortedProducts.length} products</p>
                <button
                  onClick={() => setShowMobileFilters((value) => !value)}
                  className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium"
                >
                  Filters <ChevronDown className={`h-4 w-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showMobileFilters && (
                <div className="mb-8 lg:hidden">
                  <Filters onFilterChange={handleFilterChange} />
                </div>
              )}

              {paginatedProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {paginatedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-border text-sm font-medium disabled:opacity-50 hover:bg-secondary transition-colors"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-4 py-2 border border-border text-sm font-medium transition-colors ${
                            currentPage === i + 1 ? 'bg-foreground text-background' : 'hover:bg-secondary'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-border text-sm font-medium disabled:opacity-50 hover:bg-secondary transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">No products found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
