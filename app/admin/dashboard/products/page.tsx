'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductRow {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  rating: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'OUT_OF_STOCK';
  images: string[];
  category?: CategoryOption | null;
  categoryId?: string | null;
}

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
  sku: '',
  status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT' | 'OUT_OF_STOCK',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      setProducts(data.products ?? []);
    } catch {
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      setCategories(data.categories ?? []);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    void fetchProducts();
    void fetchCategories();
  }, []);

  const filteredProducts = products.filter((product) => {
    const query = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      (product.category?.name ?? '').toLowerCase().includes(query)
    );
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageUrls([]);
    setMainImageIndex(0);
    setShowAddForm(true);
  };

  const openEdit = (product: ProductRow) => {
    const productImages = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      categoryId: product.categoryId ?? '',
      sku: '',
      status: product.status ?? 'PUBLISHED',
    });
    setImageUrls(productImages);
    setMainImageIndex(0);
    setShowAddForm(true);
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const nextImages = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read image'));
            reader.readAsDataURL(file);
          })
      )
    );

    const mergedImages = [...imageUrls, ...nextImages.filter((image) => image.length > 0)];
    setImageUrls(mergedImages);
    if (mergedImages.length === nextImages.length) {
      setMainImageIndex(0);
    }
    event.target.value = '';
  };

  const handleRemoveImage = (imageToRemove: string) => {
    const index = imageUrls.findIndex((image) => image === imageToRemove);
    const cleanedImages = imageUrls.filter((image) => image !== imageToRemove);
    setImageUrls(cleanedImages);
    if (index === mainImageIndex) {
      setMainImageIndex(0);
    } else if (index < mainImageIndex) {
      setMainImageIndex((current) => Math.max(0, current - 1));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedImages = imageUrls.filter(Boolean);
    const orderedImages = normalizedImages.length > 1 && mainImageIndex > 0 && mainImageIndex < normalizedImages.length
      ? [normalizedImages[mainImageIndex], ...normalizedImages.filter((_, index) => index !== mainImageIndex)]
      : normalizedImages;

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: form.categoryId || undefined,
      sku: form.sku || undefined,
      status: form.status,
      images: orderedImages,
      sizes: [],
      colors: [],
    };

    try {
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
      const method = editingId ? 'PATCH' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setShowAddForm(false);
      setForm(emptyForm);
      setEditingId(null);
      setImageUrls([]);
      await fetchProducts();
      window.dispatchEvent(new Event('quinn-products-updated'));
    } catch {
      // keep the form visible on failure
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
      await fetchProducts();
      window.dispatchEvent(new Event('quinn-products-updated'));
    } catch {
      // keep the UI stable
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-foreground text-background px-6 py-3 font-medium hover:opacity-80 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="border border-border p-6 space-y-4">
          <h3 className="text-xl font-display font-bold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="px-4 py-2 border border-border bg-secondary text-foreground placeholder-muted-foreground text-sm"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
              className="px-4 py-2 border border-border bg-secondary text-foreground placeholder-muted-foreground text-sm"
              required
            />
            <textarea
              placeholder="Description"
              rows={3}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="col-span-1 md:col-span-2 px-4 py-2 border border-border bg-secondary text-foreground placeholder-muted-foreground text-sm"
              required
            />
            <select
              value={form.categoryId}
              onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
              className="px-4 py-2 border border-border bg-secondary text-foreground text-sm"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(event) => setForm({ ...form, stock: event.target.value })}
              className="px-4 py-2 border border-border bg-secondary text-foreground placeholder-muted-foreground text-sm"
              required
            />
            <input
              type="text"
              placeholder="SKU"
              value={form.sku}
              onChange={(event) => setForm({ ...form, sku: event.target.value })}
              className="px-4 py-2 border border-border bg-secondary text-foreground placeholder-muted-foreground text-sm"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Product images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="block w-full text-sm text-muted-foreground"
            />
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {imageUrls.map((image, index) => (
                  <div key={`${image}-${index}`} className="rounded-xl border border-border p-2">
                    <div className="relative overflow-hidden rounded-lg">
                      <img src={image} alt={`Product preview ${index + 1}`} className="h-24 w-full object-cover" />
                      <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold ${index === mainImageIndex ? 'bg-foreground text-background' : 'bg-background text-muted-foreground border border-border'}`}>
                        {index === mainImageIndex ? 'Main' : 'Set main'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      {index !== mainImageIndex ? (
                        <button
                          type="button"
                          onClick={() => setMainImageIndex(index)}
                          className="text-xs text-foreground hover:underline"
                        >
                          Set as main
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Primary</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-foreground text-background px-6 py-2 font-medium hover:opacity-80 transition-opacity text-sm">
              Save Product
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="border border-border px-6 py-2 font-medium hover:bg-secondary transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full px-4 py-3 border border-border bg-secondary text-foreground placeholder-muted-foreground text-sm"
        />
      </div>

      <div className="border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="text-left px-6 py-4 text-sm font-medium">Product</th>
              <th className="text-left px-6 py-4 text-sm font-medium">Category</th>
              <th className="text-left px-6 py-4 text-sm font-medium">Price</th>
              <th className="text-left px-6 py-4 text-sm font-medium">Stock</th>
              <th className="text-left px-6 py-4 text-sm font-medium">Rating</th>
              <th className="text-center px-6 py-4 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-b border-border hover:bg-secondary transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images?.[0] ?? '/images/logo.png'}
                      alt={product.name}
                      className="w-10 h-10 object-cover"
                    />
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm capitalize text-muted-foreground">{product.category?.name ?? 'Uncategorized'}</td>
                <td className="px-6 py-4 text-sm font-medium">{formatCurrency(product.price)}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${product.stock > 30 ? 'bg-green-100 text-green-700' : product.stock > 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">{product.rating.toFixed(1)} ⭐</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="p-2 hover:bg-secondary transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(product.id)}
                      className="p-2 hover:bg-red-100 hover:text-red-600 transition-colors text-muted-foreground"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-4 p-6 border border-border">
        <div>
          <p className="text-muted-foreground text-sm">Total Products</p>
          <p className="text-3xl font-display font-bold">{filteredProducts.length}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Total Value</p>
          <p className="text-3xl font-display font-bold">
            {formatCurrency(filteredProducts.reduce((sum, product) => sum + product.price * product.stock, 0))}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Average Price</p>
          <p className="text-3xl font-display font-bold">
            {formatCurrency(Math.round(filteredProducts.reduce((sum, product) => sum + product.price, 0) / filteredProducts.length))}
          </p>
        </div>
      </div>
    </div>
  );
}
