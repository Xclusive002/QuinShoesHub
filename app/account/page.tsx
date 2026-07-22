'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { AuthModal } from '@/components/auth-modal';
import { supabase } from '@/lib/supabase';
import { clearMemberProfile, getOrders, getTrackingSteps, getWishlist, readMemberProfile, saveMemberProfile, saveOrders, saveWishlist, type MemberProfile, type OrderRecord, type WishlistItem } from '@/lib/member-account';
import { Edit3, Heart, Package, UserCircle2 } from 'lucide-react';

export default function AccountPage() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ fullName: '', phone: '', address: '', city: '', country: '' });
  const [authOpen, setAuthOpen] = useState(false);

  const sync = () => {
    const currentProfile = readMemberProfile();
    setProfile(currentProfile);
    setWishlist(getWishlist());
    setOrders(getOrders());
    if (currentProfile) {
      setDraft({
        fullName: currentProfile.fullName ?? '',
        phone: currentProfile.phone ?? '',
        address: currentProfile.address ?? '',
        city: currentProfile.city ?? '',
        country: currentProfile.country ?? '',
      });
    }
  };

  useEffect(() => {
    sync();
    const onChange = () => sync();
    window.addEventListener('quinn-auth-changed', onChange);
    return () => window.removeEventListener('quinn-auth-changed', onChange);
  }, []);

  useEffect(() => {
    if (!profile) {
      setAuthOpen(true);
    }
  }, [profile]);

  const saveProfile = () => {
    if (!profile?.email) return;
    const nextProfile = saveMemberProfile({
      email: profile.email,
      fullName: draft.fullName,
      phone: draft.phone,
      address: draft.address,
      city: draft.city,
      country: draft.country,
      joinedAt: profile.joinedAt,
      mode: profile.mode,
      isAuthenticated: true,
    });
    setProfile(nextProfile);
    setEditing(false);
  };

  const removeWishlistItem = (id: string) => {
    const nextWishlist = wishlist.filter((item) => item.id !== id);
    setWishlist(nextWishlist);
    saveWishlist(nextWishlist);
  };

  const totalSpend = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);

  if (!profile) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen px-4 pb-20 pt-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-border bg-secondary/70 p-10 text-center">
            <h1 className="mb-4 font-display text-4xl font-bold">Your account</h1>
            <p className="mb-8 text-muted-foreground">Sign in to see orders, saved products, tracking, and profile details.</p>
            <button onClick={() => setAuthOpen(true)} className="bg-foreground px-6 py-3 font-medium text-background">Sign in</button>
          </div>
        </main>
        <Footer />
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => { setAuthOpen(false); sync(); }} />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="rounded-[2rem] border border-border bg-background p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-secondary">
                  <UserCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Member account</p>
                  <h1 className="font-display text-3xl font-bold">{profile.fullName || profile.email}</h1>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/70 px-4 py-3 text-sm text-muted-foreground">
                Joined {new Date(profile.joinedAt).toLocaleDateString()}
              </div>
              <button
                onClick={async () => {
                  if (supabase) {
                    try {
                      await supabase.auth.signOut();
                    } catch {
                      // Ignore Supabase sign out failures and clear local profile anyway.
                    }
                  }
                  clearMemberProfile();
                  setProfile(null);
                  setEditing(false);
                  setAuthOpen(false);
                }}
                className="mt-4 inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-secondary"
              >
                Log out
              </button>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-border bg-background p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Profile details</p>
                  <h2 className="font-display text-2xl font-bold">Personal information</h2>
                </div>
                <button onClick={() => setEditing((current) => !current)} className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm font-medium transition hover:bg-secondary">
                  <Edit3 className="h-4 w-4" />
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <input value={draft.fullName} onChange={(event) => setDraft({ ...draft, fullName: event.target.value })} placeholder="Full name" className="w-full border border-border bg-secondary px-4 py-3 text-sm" />
                  <input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} placeholder="Phone" className="w-full border border-border bg-secondary px-4 py-3 text-sm" />
                  <input value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} placeholder="Address" className="w-full border border-border bg-secondary px-4 py-3 text-sm" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <input value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} placeholder="City" className="w-full border border-border bg-secondary px-4 py-3 text-sm" />
                    <input value={draft.country} onChange={(event) => setDraft({ ...draft, country: event.target.value })} placeholder="Country" className="w-full border border-border bg-secondary px-4 py-3 text-sm" />
                  </div>
                  <button onClick={saveProfile} className="bg-foreground px-5 py-3 text-sm font-medium text-background">Save changes</button>
                </div>
              ) : (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">Name:</span> {profile.fullName || 'Not provided'}</p>
                  <p><span className="font-medium text-foreground">Phone:</span> {profile.phone || 'Not provided'}</p>
                  <p><span className="font-medium text-foreground">Address:</span> {profile.address || 'Not provided'}</p>
                  <p><span className="font-medium text-foreground">City:</span> {profile.city || 'Not provided'}</p>
                  <p><span className="font-medium text-foreground">Country:</span> {profile.country || 'Not provided'}</p>
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-border bg-background p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Account summary</p>
              <h2 className="mt-2 font-display text-2xl font-bold">Member status</h2>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/70 px-4 py-3">
                  <span>Orders placed</span>
                  <span className="font-semibold text-foreground">{orders.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/70 px-4 py-3">
                  <span>Saved products</span>
                  <span className="font-semibold text-foreground">{wishlist.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/70 px-4 py-3">
                  <span>Total spent</span>
                  <span className="font-semibold text-foreground">${totalSpend.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-border bg-background p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Orders & tracking</p>
                <h2 className="font-display text-2xl font-bold">Recent orders</h2>
              </div>
            </div>
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-border bg-secondary/70 p-8 text-sm text-muted-foreground">
                No orders yet. Head to the shop and place your first order.
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-[1.5rem] border border-border p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{order.orderNumber}</p>
                        <h3 className="mt-1 font-display text-xl font-bold">{order.status}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Placed {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-secondary/70 px-4 py-3 text-sm text-muted-foreground">
                        Tracking: {order.trackingCode}
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {getTrackingSteps(order.status).map((step, index) => (
                        <div key={step} className={`rounded-full px-3 py-2 text-sm ${index < getTrackingSteps(order.status).length - 1 ? 'bg-foreground text-background' : 'border border-border bg-background'}`}>
                          {step}
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/70 px-3 py-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold">{item.quantity}x</div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
                      <span>Total</span>
                      <span className="font-semibold text-foreground">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-border bg-background p-8">
              <div className="mb-6 flex items-center gap-2">
                <Heart className="h-5 w-5" />
                <h2 className="font-display text-2xl font-bold">Liked products</h2>
              </div>
              {wishlist.length === 0 ? (
                <div className="rounded-2xl border border-border bg-secondary/70 p-8 text-sm text-muted-foreground">No liked products yet.</div>
              ) : (
                <div className="space-y-3">
                  {wishlist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border bg-secondary/70 px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Saved for later</p>
                      </div>
                      <button onClick={() => removeWishlistItem(item.id)} className="text-sm font-medium text-muted-foreground transition hover:text-foreground">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-border bg-background p-8">
              <div className="mb-6 flex items-center gap-2">
                <Package className="h-5 w-5" />
                <h2 className="font-display text-2xl font-bold">Need help?</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Contact our concierge for returns, exchanges, and delivery questions.</p>
                <p>WhatsApp: +234 806 262 2541</p>
                <p>Email: support@quinnshoeshub.com</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => { setAuthOpen(false); sync(); }} />
    </>
  );
}
