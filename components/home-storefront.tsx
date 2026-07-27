'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, BellRing, ShieldCheck, Sparkles, Truck, Warehouse } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { ProductCard } from '@/components/product-card';

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
            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
              <div className="max-w-2xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Premium Quality Since Day One
                </p>
                <h1 className="mb-6 font-display text-4xl leading-[0.95] sm:text-5xl lg:text-7xl">
                  Elevate your everyday walk with signature style.
                </h1>
                <p className="mb-8 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Discover refined footwear crafted for comfort, confidence, and timeless presence — from clean daily essentials to standout occasion pieces.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href="/shop" className="inline-flex items-center justify-center gap-2 bg-foreground px-6 py-3 font-medium text-background transition hover:opacity-80 sm:px-8">
                    Shop now <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="#featured" className="inline-flex items-center justify-center gap-2 border border-foreground px-6 py-3 font-medium text-foreground transition hover:bg-foreground hover:text-background sm:px-8">
                    Explore the edit
                  </Link>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {['Free shipping over ₦150,000', '30-day returns', 'Members get early access'].map((item) => (
                    <div key={item} className="rounded-2xl border border-border bg-secondary/70 px-4 py-3 text-sm text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-border bg-secondary/70 p-4 shadow-[0_30px_80px_-28px_rgba(0,0,0,0.25)] sm:p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.55),_transparent_65%)]" />
                <div className="relative">
                  <div className="mb-6 flex items-center justify-between rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground">
                    <span className="flex items-center gap-2"><Warehouse className="h-4 w-4" /> Curated studio drops</span>
                    <span>New in</span>
                  </div>
                  <img src="/images/logo.png" alt="Quinn Shoes Hub" className="mx-auto h-56 w-full max-w-md object-contain sm:h-72" />
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {benefits.map((benefit) => {
                      const Icon = benefit.icon;
                      return (
                        <div key={benefit.title} className="rounded-2xl border border-border bg-background/80 p-4">
                          <Icon className="mb-2 h-4 w-4" />
                          <p className="text-sm font-semibold text-foreground">{benefit.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
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

            {featuredProducts.length > 0 ? (
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
