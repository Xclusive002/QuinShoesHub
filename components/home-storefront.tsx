'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, BellRing, ShieldCheck, Sparkles, Truck, Warehouse } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { ProductCard } from '@/components/product-card';
import { TreadDivider } from '@/components/tread-divider';

interface ProductRecord {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: number[];
  colors: string[];
  image: string;
  images: string[];
  stock: number;
  rating: number;
}

interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  productCount?: number;
}

interface NotificationRecord {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const benefits = [
  { title: 'Luxury finish', description: 'Designed with premium materials and precise detailing.', icon: Sparkles },
  { title: 'Fast delivery', description: 'Express shipping on every order across Nigeria.', icon: Truck },
  { title: 'Trusted quality', description: 'Every pair is inspected before it reaches your doorstep.', icon: ShieldCheck },
];

export function HomeStorefront() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsResponse, notificationsResponse] = await Promise.all([
          fetch('/api/products', { cache: 'no-store' }),
          fetch('/api/notifications', { cache: 'no-store' }),
        ]);

        const productsData = await productsResponse.json();
        const notificationsData = await notificationsResponse.json();
        setProducts(productsData.products ?? []);
        setCategories(productsData.categories ?? []);
        setNotifications(notificationsData.notifications ?? []);
      } catch {
        setProducts([]);
        setCategories([]);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();

    const handleRefresh = () => {
      void loadData();
    };

    window.addEventListener('quinn-products-updated', handleRefresh);
    window.addEventListener('quinn-notifications-updated', handleRefresh);

    return () => {
      window.removeEventListener('quinn-products-updated', handleRefresh);
      window.removeEventListener('quinn-notifications-updated', handleRefresh);
    };
  }, []);

  const featuredProducts = products.slice(0, 4);

  return (
    <>
      <Navigation />
      <main className="bg-background">
        {notifications.length > 0 && (
          <section className="border-b border-border bg-secondary/70 px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 rounded-2xl border border-border bg-background/80 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <BellRing className="h-4 w-4" />
                <span>{notifications[0].message}</span>
              </div>
              <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Live from the admin panel</span>
            </div>
          </section>
        )}

        <section className="border-b border-border px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
              <div className="max-w-2xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Designed for every step
                </p>
                <h1 className="mb-6 font-display text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
                  Walk with confidence in footwear built for the modern edge.
                </h1>
                <p className="mb-8 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Experience bold silhouettes, premium comfort, and refined finishes crafted for daily wear, special moments, and the spaces between.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href="/shop" className="inline-flex items-center justify-center gap-2 bg-foreground px-6 py-3 font-medium text-background transition hover:opacity-90 sm:px-8">
                    Shop now <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="#featured" className="inline-flex items-center justify-center gap-2 border border-foreground px-6 py-3 font-medium text-foreground transition hover:bg-foreground hover:text-background sm:px-8">
                    Explore the edit
                  </Link>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {['Free shipping over ₦150,000', '30-day returns', 'Member exclusives'].map((item) => (
                    <div key={item} className="rounded-2xl border border-border bg-secondary/70 px-4 py-3 text-sm text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-border bg-secondary/70 p-4 shadow-[0_30px_80px_-28px_rgba(0,0,0,0.25)] sm:p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.35),_transparent_60%)]" />
                <div className="relative flex h-full flex-col gap-6">
                  <div className="flex items-center justify-between rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground">
                    <span className="flex items-center gap-2"><Warehouse className="h-4 w-4" /> New arrivals</span>
                    <span className="rounded-full border border-border bg-foreground px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-background">Drop</span>
                  </div>

                  <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-background/95 p-4 sm:p-6">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),transparent_55%)]" />
                    <img
                      src={featuredProducts[0]?.image ?? '/images/logo.png'}
                      alt={featuredProducts[0]?.name ?? 'Featured product'}
                      className="mx-auto h-72 w-full max-w-[360px] object-contain"
                    />
                    <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="rounded-full border border-ember/50 bg-ember/10 px-3 py-1 font-medium text-ember">Best seller</span>
                      <span className="rounded-full border border-border bg-background/80 px-3 py-1">Premium leather</span>
                      <span className="rounded-full border border-border bg-background/80 px-3 py-1">Easy returns</span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl border border-border bg-background/80 px-4 py-4 text-center">
                      <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Made to last</p>
                      <p className="mt-2 text-xl font-semibold text-foreground">Durable build</p>
                    </div>
                    <div className="rounded-3xl border border-border bg-background/80 px-4 py-4 text-center">
                      <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Fast delivery</p>
                      <p className="mt-2 text-xl font-semibold text-foreground">Across Nigeria</p>
                    </div>
                    <div className="rounded-3xl border border-border bg-background/80 px-4 py-4 text-center">
                      <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Shop with ease</p>
                      <p className="mt-2 text-xl font-semibold text-foreground">Secure checkout</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <TreadDivider className="mx-auto h-[2px] w-40" />
            </div>
          </div>
        </section>

        <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {categories.map((category) => (
                <Link key={category.id} href={`/shop?category=${category.slug}`} className="flex items-center justify-center rounded-2xl border border-border bg-secondary px-4 py-5 text-center text-sm font-medium transition hover:bg-muted">
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="featured" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Curated selection</p>
                <h2 className="font-display text-4xl sm:text-5xl">Featured essentials</h2>
              </div>
              <Link href="/shop" className="inline-flex items-center gap-2 font-medium text-foreground hover:underline">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse overflow-hidden rounded-sm border border-border bg-card">
                    <div className="aspect-square bg-muted" />
                    <div className="space-y-3 px-5 pb-5 pt-4">
                      <div className="h-3 w-20 rounded bg-muted" />
                      <div className="h-4 w-3/4 rounded bg-muted" />
                      <div className="h-3 w-full rounded bg-muted" />
                      <div className="h-6 w-1/3 rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-secondary/60 p-12 text-center text-muted-foreground">
                There are no published products yet. Add products from the admin dashboard to populate the storefront.
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-border bg-secondary/70 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Stay updated</p>
            <h3 className="mb-6 font-display text-4xl sm:text-5xl">New drops, member-only offers, and early release access.</h3>
            <p className="mb-8 text-lg text-muted-foreground">
              Subscribe to receive exclusive launch alerts, seasonal edits, and first access to premium collections.
            </p>
            <form className="flex flex-col gap-2 sm:flex-row">
              <input type="email" placeholder="Enter your email" className="flex-1 border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground" />
              <button type="submit" className="whitespace-nowrap bg-foreground px-8 py-3 font-medium text-background transition hover:opacity-80">
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
