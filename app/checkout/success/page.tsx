'use client';
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

function SuccessContent() {
  const orderId = useSearchParams().get('order');

  useEffect(() => {
    window.localStorage.removeItem('quinn-cart');
    window.dispatchEvent(new Event('quinn-cart-updated'));
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center pt-20">
      <h1 className="font-display text-4xl font-bold mb-4">Payment successful 🎉</h1>
      <p className="text-muted-foreground mb-2">Order reference: {orderId}</p>
      <p className="max-w-md text-muted-foreground">
        Our team will reach out to you on WhatsApp within 15 minutes to arrange shipping and delivery.
      </p>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <Navigation />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}
