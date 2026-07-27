export interface Product {
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

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  productCount?: number;
}

export const categories: Category[] = [];
export const products: Product[] = [];

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/products/${id}`, { cache: 'no-store' });
    if (!response.ok) {
      return undefined;
    }
    const data = await response.json();
    return data.product;
  } catch {
    return undefined;
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/products?category=${encodeURIComponent(category)}`, { cache: 'no-store' });
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.products ?? [];
  } catch {
    return [];
  }
}

export async function filterProducts(
  searchTerm: string,
  category?: string,
  minPrice?: number,
  maxPrice?: number
): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (category) params.set('category', category);
    if (minPrice !== undefined) params.set('minPrice', String(minPrice));
    if (maxPrice !== undefined) params.set('maxPrice', String(maxPrice));

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/products?${params.toString()}`, { cache: 'no-store' });
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.products ?? [];
  } catch {
    return [];
  }
}
