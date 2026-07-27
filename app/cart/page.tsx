'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { AuthModal } from '@/components/auth-modal';
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { createOrderFromCart, getOrders, readMemberProfile, saveOrders } from '@/lib/member-account';
import { formatCurrency } from '@/lib/utils';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('quinn-cart');
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch {
      setCartItems([]);
    }
    setIsMember(Boolean(readMemberProfile()));
  }, []);

  useEffect(() => {
    window.localStorage.setItem('quinn-cart', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('quinn-cart-updated'));
  }, [cartItems]);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((current) => current.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)).filter((item) => item.quantity > 0));
  };

  const removeItem = (id: string) => {
    setCartItems((current) => current.filter((item) => item.id !== id));
  };

  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const shipping = subtotal > 150000 ? 0 : 15000;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (!isMember) {
      setIsAuthOpen(true);
      return;
    }

    const orders = getOrders();
    const newOrder = createOrderFromCart(cartItems, total);
    saveOrders([newOrder, ...orders]);
    setCartItems([]);
    setCheckoutNotice(`Order ${newOrder.orderNumber} placed successfully.`);
    window.dispatchEvent(new Event('quinn-auth-changed'));
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen px-4 pb-20 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Shopping cart</p>
              <h1 className="font-display text-5xl lg:text-6xl">Your bag</h1>
            </div>
            {!isMember ? (
              <button onClick={() => setIsAuthOpen(true)} className="inline-flex items-center gap-2 border border-border bg-secondary px-4 py-3 text-sm font-medium transition hover:bg-muted">
                Create an account for faster checkout <ArrowRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {cartItems.length === 0 ? (
            <div className="border border-border bg-secondary/60 p-12 text-center">
              <div className="mb-6 flex justify-center">
                <svg className="h-24 w-24 text-muted-foreground opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="mb-2 font-display text-2xl font-bold">Your cart is empty</h2>
              <p className="mb-8 text-muted-foreground">Discover our collection of premium shoes and add some to your bag.</p>
              <Link href="/shop" className="inline-flex items-center gap-2 bg-foreground px-8 py-3 font-medium text-background transition hover:opacity-80">
                Continue shopping <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex flex-col justify-between gap-4 border border-border bg-background p-6 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 overflow-hidden bg-secondary">
                        <img src={item.image ?? '/images/logo.png'} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 border border-border px-3 py-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 transition hover:bg-secondary"><Minus className="h-4 w-4" /></button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 transition hover:bg-secondary"><Plus className="h-4 w-4" /></button>
                      </div>
                      <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      <button onClick={() => removeItem(item.id)} className="p-2 text-muted-foreground transition hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="h-fit border border-border bg-background p-8">
                <h2 className="mb-6 font-display text-lg font-bold">Order summary</h2>
                <div className="mb-6 space-y-4 border-b border-border pb-6 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-medium">{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="font-medium">Calculated at checkout</span></div>
                </div>
                <div className="mb-8 flex items-center justify-between font-display text-lg font-bold"><span>Total</span><span>{formatCurrency(total)}</span></div>
                <button onClick={handleCheckout} className="mb-4 w-full bg-foreground py-4 font-medium text-background transition hover:opacity-80">Proceed to checkout</button>
                {checkoutNotice ? <p className="mb-4 text-sm text-foreground">{checkoutNotice}</p> : null}
                <Link href="/shop" className="block w-full border border-border py-3 text-center font-medium transition hover:bg-secondary">Continue shopping</Link>
                <div className="mt-8 space-y-3 text-xs text-muted-foreground">
                  <p>✓ Free shipping on orders over ₦150,000</p>
                  <p>✓ Easy 30-day returns</p>
                  <p>✓ Secure checkout</p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <AuthModal open={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={() => { setIsAuthOpen(false); setIsMember(true); }} />
    </>
  );
}
