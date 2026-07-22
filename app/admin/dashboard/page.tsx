'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Package, BarChart3, TrendingUp } from 'lucide-react';

interface ProductSummary {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: { name?: string } | null;
}

interface CategorySummary {
  id: string;
  name: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/categories'),
        ]);
        const productsData = await productsResponse.json();
        const categoriesData = await categoriesResponse.json();
        setProducts(productsData.products ?? []);
        setCategories(categoriesData.categories ?? []);
      } catch {
        setProducts([]);
        setCategories([]);
      }
    };

    void loadData();
  }, []);

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const avgPrice = totalProducts > 0 ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / totalProducts) : 0;

  const stats = [
    {
      label: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'bg-black',
    },
    {
      label: 'Categories',
      value: totalCategories,
      icon: ShoppingBag,
      color: 'bg-gray-800',
    },
    {
      label: 'Total Inventory Value',
      value: `$${totalValue.toLocaleString()}`,
      icon: BarChart3,
      color: 'bg-black',
    },
    {
      label: 'Average Price',
      value: `$${avgPrice}`,
      icon: TrendingUp,
      color: 'bg-gray-800',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-bold mb-2">Welcome back</h1>
        <p className="text-muted-foreground">Here&apos;s an overview of your Quinn Shoes Hub store</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.color} text-white p-3 rounded`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-display font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="border border-border">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-2xl font-display font-bold">Top Products by Stock</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Product</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Price</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Stock</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Value</th>
              </tr>
            </thead>
            <tbody>
              {products
                .slice()
                .sort((a, b) => b.stock - a.stock)
                .slice(0, 5)
                .map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground capitalize">{product.category?.name ?? 'Uncategorized'}</td>
                    <td className="px-6 py-4 text-sm font-medium">${product.price}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded ${product.stock > 30 ? 'bg-green-100 text-green-700' : product.stock > 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">${(product.price * product.stock).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="/admin/dashboard/products" className="border border-border p-6 hover:bg-secondary transition-colors">
          <h3 className="font-display font-bold text-lg mb-2">Manage Products</h3>
          <p className="text-muted-foreground text-sm mb-4">Add, edit, or remove products from your catalog</p>
          <span className="text-sm font-medium hover:underline">View Products →</span>
        </a>
        <a href="/admin/dashboard/categories" className="border border-border p-6 hover:bg-secondary transition-colors">
          <h3 className="font-display font-bold text-lg mb-2">Manage Categories</h3>
          <p className="text-muted-foreground text-sm mb-4">Organize your products into categories</p>
          <span className="text-sm font-medium hover:underline">View Categories →</span>
        </a>
        <a href="/admin/dashboard/orders" className="border border-border p-6 hover:bg-secondary transition-colors">
          <h3 className="font-display font-bold text-lg mb-2">Track Orders</h3>
          <p className="text-muted-foreground text-sm mb-4">Review payment status, shipping progress, and fulfillment updates</p>
          <span className="text-sm font-medium hover:underline">View Orders →</span>
        </a>
        <a href="/admin/dashboard/notifications" className="border border-border p-6 hover:bg-secondary transition-colors">
          <h3 className="font-display font-bold text-lg mb-2">Review Alerts</h3>
          <p className="text-muted-foreground text-sm mb-4">Keep on top of low-stock warnings, new orders, and failed payments</p>
          <span className="text-sm font-medium hover:underline">View Notifications →</span>
        </a>
      </div>
    </div>
  );
}
