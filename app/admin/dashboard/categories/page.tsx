'use client';

import { useEffect, useState } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  _count?: {
    products: number;
  };
}

const emptyForm = {
  name: '',
  slug: '',
  description: '',
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

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
    void fetchCategories();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowAddForm(true);
  };

  const openEdit = (category: CategoryRow) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: '',
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories';
      const method = editingId ? 'PATCH' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          image: null,
        }),
      });
      setShowAddForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await fetchCategories();
      window.dispatchEvent(new Event('quinn-products-updated'));
    } catch {
      // keep the UI stable
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      await fetch(`/api/admin/categories/${categoryId}`, { method: 'DELETE' });
      await fetchCategories();
      window.dispatchEvent(new Event('quinn-products-updated'));
    } catch {
      // keep the UI stable
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Categories</h1>
          <p className="text-muted-foreground">Organize your products</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-foreground text-background px-6 py-3 font-medium hover:opacity-80 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="border border-border p-6 space-y-4">
          <h3 className="text-xl font-display font-bold mb-4">{editingId ? 'Edit Category' : 'Add New Category'}</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Category Name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full px-4 py-2 border border-border bg-secondary text-foreground placeholder-muted-foreground text-sm"
              required
            />
            <input
              type="text"
              placeholder="Category Slug"
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
              className="w-full px-4 py-2 border border-border bg-secondary text-foreground placeholder-muted-foreground text-sm"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="w-full px-4 py-2 border border-border bg-secondary text-foreground placeholder-muted-foreground text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-foreground text-background px-6 py-2 font-medium hover:opacity-80 transition-opacity text-sm">
              Save Category
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="border border-border p-6 hover:bg-secondary transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-lg">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.slug}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{category._count?.products ?? 0} products</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(category)}
                className="flex items-center gap-1 px-3 py-2 border border-border text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(category.id)}
                className="flex items-center gap-1 px-3 py-2 border border-border text-sm font-medium hover:bg-red-100 hover:text-red-600 text-muted-foreground transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Total Categories</p>
            <p className="text-3xl font-display font-bold">{categories.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Active</p>
            <p className="text-3xl font-display font-bold">{categories.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
