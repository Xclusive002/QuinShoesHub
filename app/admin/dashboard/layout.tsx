'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSessionFromStorage, clearSessionFromStorage } from '@/lib/auth';
import { BellRing, ClipboardList, LayoutDashboard, Package, TicketPercent, Tags, Users, LogOut } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getSessionFromStorage();
    if (!session.isAuthenticated) {
      setIsAuthenticated(false);
      setUsername('');
      setIsLoading(false);
      router.replace('/admin/login');
      return;
    }

    setIsAuthenticated(true);
    setUsername(session.username || '');
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    clearSessionFromStorage();
    router.push('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">Redirecting to the admin login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 border-r border-border flex-col">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 p-6 border-b border-border hover:opacity-70 transition-opacity">
          <img src="/images/logo.png" alt="Quinn Shoes Hub" className="h-10 w-auto" />
          <span className="font-display font-bold text-sm">ADMIN</span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-secondary transition-colors rounded"
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </Link>
          <Link
            href="/admin/dashboard/products"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-secondary transition-colors rounded"
          >
            <Package className="w-4 h-4" />
            Products
          </Link>
          <Link
            href="/admin/dashboard/categories"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-secondary transition-colors rounded"
          >
            <Tags className="w-4 h-4" />
            Categories
          </Link>
          <Link
            href="/admin/dashboard/orders"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-secondary transition-colors rounded"
          >
            <ClipboardList className="w-4 h-4" />
            Orders
          </Link>
          <Link
            href="/admin/dashboard/users"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-secondary transition-colors rounded"
          >
            <Users className="w-4 h-4" />
            Users
          </Link>
          <Link
            href="/admin/dashboard/promotions"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-secondary transition-colors rounded"
          >
            <TicketPercent className="w-4 h-4" />
            Promotions
          </Link>
          <Link
            href="/admin/dashboard/notifications"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-secondary transition-colors rounded"
          >
            <BellRing className="w-4 h-4" />
            Notifications
          </Link>
        </nav>

        {/* User Section */}
        <div className="border-t border-border p-4">
          <p className="text-xs text-muted-foreground mb-2">LOGGED IN AS</p>
          <p className="text-sm font-medium mb-4">{username}</p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="md:hidden p-2 hover:bg-secondary transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
