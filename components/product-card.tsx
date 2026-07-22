'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Plus, Sparkles, Star } from 'lucide-react';
import { AuthModal } from '@/components/auth-modal';
import { getWishlist, readMemberProfile, saveWishlist } from '@/lib/member-account';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  image?: string;
  images?: string[];
  stock: number;
  rating: number;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.image ?? product.images?.[0] ?? '/images/logo.png';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const sync = () => {
      const profile = readMemberProfile();
      setIsAuthenticated(Boolean(profile));
      setSaved(getWishlist().some((item) => item.id === product.id));
    };
    sync();
    window.addEventListener('quinn-auth-changed', sync);
    return () => window.removeEventListener('quinn-auth-changed', sync);
  }, [product.id]);

  const handleAction = (action: 'cart' | 'wishlist') => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }

    if (action === 'cart') {
      const stored = window.localStorage.getItem('quinn-cart');
      const cart = stored ? JSON.parse(stored) : [];
      const existing = cart.find((item: { id: string }) => item.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image,
        });
      }
      window.localStorage.setItem('quinn-cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('quinn-cart-updated'));
      setAdded(true);
      setTimeout(() => setAdded(false), 1400);
      return;
    }

    const wishlist = getWishlist();
    if (!wishlist.some((item) => item.id === product.id)) {
      const nextWishlist = [...wishlist, { id: product.id, name: product.name, image }];
      saveWishlist(nextWishlist);
      setSaved(true);
    }
    setTimeout(() => setSaved(false), 1400);
  };

  return (
    <div className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-background shadow-[0_20px_60px_-24px_rgba(0,0,0,0.25)]">
      <div className="absolute right-3 top-3 z-10 flex gap-2">
        <button
          onClick={() => handleAction('wishlist')}
          className="rounded-full border border-border bg-background/90 p-2 transition hover:bg-secondary"
          aria-label="Save item"
        >
          <Heart className={`h-4 w-4 ${saved ? 'fill-foreground' : ''}`} />
        </button>
      </div>

      <Link href={`/shop/${product.id}`} className="block">
        <div className="relative mb-4 aspect-square overflow-hidden bg-secondary">
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>

        <div className="space-y-3 px-5 pb-5">
          <div className="space-y-1">
            <div className="mb-2 inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              {product.category ?? 'Signature'}
            </div>
            <h3 className="font-display text-lg font-bold transition-all group-hover:underline">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`h-3.5 w-3.5 ${index < Math.floor(product.rating) ? 'fill-foreground' : 'fill-border stroke-border'}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.rating.toFixed(1)} / 5)</span>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <div>
              <p className="font-display text-xl font-bold">${product.price}</p>
              <p className="text-xs text-muted-foreground">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
            </div>
            <button
              onClick={(event) => {
                event.preventDefault();
                handleAction('cart');
              }}
              className="inline-flex items-center gap-2 border border-border bg-foreground px-3 py-2 text-sm font-medium text-background transition hover:opacity-80"
            >
              <Plus className="h-4 w-4" />
              {added ? 'Added' : 'Add'}
            </button>
          </div>
        </div>
      </Link>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />
    </div>
  );
}
