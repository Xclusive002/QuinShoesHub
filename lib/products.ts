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

const fallbackCategories: Category[] = [
  { id: 'sneakers', name: 'Sneakers', slug: 'sneakers' },
  { id: 'formal', name: 'Formal', slug: 'formal' },
  { id: 'casual', name: 'Casual', slug: 'casual' },
  { id: 'boots', name: 'Boots', slug: 'boots' },
  { id: 'loafers', name: 'Loafers', slug: 'loafers' },
];

const fallbackProducts: Product[] = [
  {
    id: '1',
    name: 'The Essential Low Top',
    description: 'Minimalist low-top sneaker crafted from premium leather with a memory foam insole for all-day comfort.',
    price: 189,
    category: 'sneakers',
    sizes: [6, 7, 8, 9, 10, 11, 12, 13],
    colors: ['White', 'Black', 'Navy'],
    image: '/images/logo.png',
    images: ['/images/logo.png'],
    stock: 45,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Oxford Heritage',
    description: 'Classic oxford in full-grain leather. Perfect for the office or formal occasions.',
    price: 349,
    category: 'formal',
    sizes: [6, 7, 8, 9, 10, 11, 12, 13],
    colors: ['Black', 'Brown', 'Tan'],
    image: '/images/logo.png',
    images: ['/images/logo.png'],
    stock: 28,
    rating: 4.9,
  },
];

export const categories: Category[] = fallbackCategories;
export const products: Product[] = fallbackProducts;

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/products/${id}`, { cache: 'no-store' });
    if (!response.ok) {
      return fallbackProducts.find((product) => product.id === id);
    }
    const data = await response.json();
    return data.product;
  } catch {
    return fallbackProducts.find((product) => product.id === id);
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/products?category=${encodeURIComponent(category)}`, { cache: 'no-store' });
    if (!response.ok) {
      return fallbackProducts.filter((product) => product.category === category);
    }
    const data = await response.json();
    return data.products ?? [];
  } catch {
    return fallbackProducts.filter((product) => product.category === category);
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
      return fallbackProducts.filter((product) => {
        const matchesSearch = searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !category || product.category === category;
        const matchesPrice = (minPrice === undefined || product.price >= minPrice) && (maxPrice === undefined || product.price <= maxPrice);
        return matchesSearch && matchesCategory && matchesPrice;
      });
    }

    const data = await response.json();
    return data.products ?? [];
  } catch {
    return fallbackProducts.filter((product) => {
      const matchesSearch = searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !category || product.category === category;
      const matchesPrice = (minPrice === undefined || product.price >= minPrice) && (maxPrice === undefined || product.price <= maxPrice);
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }
}
