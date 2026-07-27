'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { ProductCard } from '@/components/product-card';
import { AuthModal } from '@/components/auth-modal';
import { ChevronLeft, Star, Minus, Plus, Heart, ShieldCheck } from 'lucide-react';
import { getWishlist, readMemberProfile, saveWishlist } from '@/lib/member-account';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  sizes: number[] | string[];
  colors: string[];
  image?: string;
  images?: string[];
  stock: number;
  rating: number;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'cart' | 'wishlist' | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const refreshProductData = () => {
      fetch(`/api/products/${resolvedParams.id}`, { cache: 'no-store' })
        .then((response) => response.json())
        .then((data) => {
          if (!isMounted) return;
          setProduct(data.product ?? null);
        })
        .catch(() => {
          if (!isMounted) return;
          setProduct(null);
        });

      fetch('/api/products', { cache: 'no-store' })
        .then((response) => response.json())
        .then((data) => {
          if (!isMounted) return;
          setRelatedProducts((data.products ?? []).slice(0, 4));
        })
        .catch(() => {
          if (!isMounted) return;
          setRelatedProducts([]);
        });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshProductData();
      }
    };

    refreshProductData();
    window.addEventListener('focus', refreshProductData);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', refreshProductData);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resolvedParams.id]);

  useEffect(() => {
    setSelectedImage(0);
    setSelectedSize(product?.sizes[0]);
    setSelectedColor(product?.colors[0]);
    setQuantity(1);
  }, [product]);

  const requireMember = (action: 'cart' | 'wishlist') => {
    if (!readMemberProfile()) {
      setPendingAction(action);
      setAuthOpen(true);
      return false;
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!requireMember('cart')) return;

    const cartKey = 'quinn-cart';
    const current = window.localStorage.getItem(cartKey);
    const parsed = current ? JSON.parse(current) : [];
    const existing = parsed.find((item: { id: string }) => item.id === product?.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      parsed.push({
        id: product?.id,
        name: product?.name,
        price: product?.price,
        quantity,
        image: product?.image ?? product?.images?.[0] ?? '/images/logo.png',
      });
    }

    window.localStorage.setItem(cartKey, JSON.stringify(parsed));
    window.dispatchEvent(new Event('quinn-cart-updated'));
    setNotice('Added to your member cart.');
    setTimeout(() => setNotice(null), 1800);
  };

  const handleWishlistToggle = () => {
    if (!requireMember('wishlist')) return;
    const wishlist = getWishlist();
    const exists = wishlist.some((item) => item.id === product?.id);
    const nextWishlist = exists
      ? wishlist.filter((item) => item.id !== product?.id)
      : [...wishlist, { id: product?.id ?? '', name: product?.name ?? 'Product', image: product?.image ?? product?.images?.[0] ?? '/images/logo.png' }];
    saveWishlist(nextWishlist);
    setIsFavorited(!exists);
    setNotice(exists ? 'Removed from your wishlist.' : 'Saved to your wishlist.');
    setTimeout(() => setNotice(null), 1600);
  };

  if (!product) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen px-4 pb-20 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl py-20 text-center">
            <h1 className="mb-4 font-display text-4xl font-bold">Product not found</h1>
            <Link href="/shop" className="font-medium text-foreground hover:underline">
              Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen px-4 pb-20 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/shop" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground transition hover:underline">
            <ChevronLeft className="h-4 w-4" /> Back to Shop
          </Link>

          <div className="mb-20 grid gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="mb-4 aspect-square overflow-hidden rounded-[2rem] border border-border bg-secondary">
                <img src={(product.images ?? [])[selectedImage] ?? '/images/logo.png'} alt={product.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex gap-2">
                {(product.images ?? []).map((img, idx) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className={`h-20 w-20 overflow-hidden rounded-2xl border-2 transition-all ${selectedImage === idx ? 'border-foreground' : 'border-border'}`}>
                    <img src={img} alt={`View ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-start">
              <div className="mb-8 rounded-[2rem] border border-border bg-secondary/70 p-6">
                <p className="mb-2 text-sm uppercase tracking-[0.3em] text-muted-foreground">{product.category ?? 'Uncategorized'}</p>
                <h1 className="mb-4 font-display text-4xl sm:text-5xl">{product.name}</h1>

                <div className="mb-4 flex items-center gap-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} className={`h-4 w-4 ${index < Math.floor(product.rating) ? 'fill-foreground' : 'fill-border stroke-border'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({Math.floor(Math.random() * 100) + 10} reviews)</span>
                </div>

                <p className="mb-6 text-4xl font-display font-bold">{formatCurrency(product.price)}</p>
                <p className="text-lg leading-relaxed text-muted-foreground">{product.description}</p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="mb-4 block text-sm font-medium">Color</label>
                  <div className="flex flex-wrap gap-3">
                    {(product.colors ?? []).map((color) => (
                      <button key={color} onClick={() => setSelectedColor(color)} className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${selectedColor === color ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'}`}>
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-4 block text-sm font-medium">Size (US)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(product.sizes ?? []).map((size) => (
                      <button key={size} onClick={() => setSelectedSize(size)} className={`rounded-2xl border py-3 text-sm font-medium transition-all ${selectedSize === size ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-4 block text-sm font-medium">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="border border-border p-2 transition hover:bg-secondary"><Minus className="h-4 w-4" /></button>
                    <span className="w-8 text-center text-lg font-medium">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="border border-border p-2 transition hover:bg-secondary"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}</p>
              </div>

              <div className="my-8 border-b border-border" />

              <div className="flex flex-wrap gap-4">
                <button disabled={product.stock === 0} onClick={handleAddToCart} className="flex-1 bg-foreground px-4 py-4 font-medium text-background transition hover:opacity-80 disabled:opacity-50">
                  Add to cart
                </button>
                <button onClick={handleWishlistToggle} className={`rounded-2xl border p-4 transition-all ${isFavorited ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'}`}>
                  <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              {notice ? <p className="mt-3 text-sm text-foreground">{notice}</p> : null}

              <div className="mt-8 rounded-[2rem] border border-border bg-background/80 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground"><ShieldCheck className="h-4 w-4" /> Members get saved carts and faster checkout.</div>
              </div>

              <div className="mt-8 space-y-3 text-sm text-muted-foreground">
                <p>✓ Free shipping on orders over ₦150,000</p>
                <p>✓ 30-day returns</p>
                <p>✓ 2-year quality guarantee</p>
                <p>✓ Contact: +234 806 262 2541 (WhatsApp)</p>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <section className="border-t border-border pt-20">
              <div className="mb-12 flex items-center justify-between">
                <h2 className="font-display text-4xl sm:text-5xl">You may also like</h2>
                <Link href={`/shop?category=${encodeURIComponent(product.category ?? '')}`} className="text-sm font-medium hover:underline">View all</Link>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => { setAuthOpen(false); if (pendingAction === 'cart') { handleAddToCart(); } else if (pendingAction === 'wishlist') { handleWishlistToggle(); } setPendingAction(null); }} />
    </>
  );
}
