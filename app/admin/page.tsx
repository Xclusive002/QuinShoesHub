'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionFromStorage } from '@/lib/auth';

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSessionFromStorage();
    router.replace(session.isAuthenticated ? '/admin/dashboard' : '/admin/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Redirecting to the admin area...
    </div>
  );
}
