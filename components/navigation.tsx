'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingCart, UserCircle2 } from 'lucide-react';
import { AuthModal } from '@/components/auth-modal';
import { readMemberProfile } from '@/lib/member-account';

export function Navigation() {
  const [cartCount, setCartCount] = useState(0);
  const [memberProfile, setMemberProfile] = useState<{ email?: string } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const saved = window.localStorage.getItem('quinn-cart');
        if (!saved) {
          setCartCount(0);
          return;
        }

        const items = JSON.parse(saved) as Array<{ quantity?: number }>;
        setCartCount(items.reduce((sum, item) => sum + (item.quantity ?? 1), 0));
      } catch {
        setCartCount(0);
      }
    };

    const syncMemberState = () => {
      setMemberProfile(readMemberProfile());
      updateCartCount();
    };

    syncMemberState();
    window.addEventListener('storage', syncMemberState);
    window.addEventListener('quinn-cart-updated', updateCartCount);
    window.addEventListener('quinn-auth-changed', syncMemberState);
    return () => {
      window.removeEventListener('storage', syncMemberState);
      window.removeEventListener('quinn-cart-updated', updateCartCount);
      window.removeEventListener('quinn-auth-changed', syncMemberState);
    };
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-70">
            <img src="/images/logo.png" alt="Quinn Shoes Hub" className="h-10 w-auto sm:h-12" />
            <span className="truncate font-display text-sm font-bold sm:text-lg">Quinn Shoes Hub</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-5">
            <a
              href="https://wa.me/2348062622541"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-sm font-medium transition-all hover:underline sm:inline"
            >
              HELP
            </a>
            <Link
              href={memberProfile?.email ? '/account' : '#'}
              onClick={(event) => {
                if (!memberProfile?.email) {
                  event.preventDefault();
                  setIsAuthOpen(true);
                }
              }}
              className="flex items-center gap-2 rounded-full border border-border bg-secondary px-2.5 py-2 text-sm font-medium transition hover:bg-muted sm:px-3"
            >
              <UserCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">{memberProfile?.email ? 'Account' : 'Sign in'}</span>
            </Link>
            <Link href="/cart" className="relative transition-opacity hover:opacity-70">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
      <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={() => setIsAuthOpen(false)} />
    </>
  );
}
