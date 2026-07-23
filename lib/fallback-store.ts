type ProductRecord = {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  categoryId?: string | null;
  category?: { id: string; name: string; slug: string } | null;
  sizes: string[];
  colors: string[];
  images: string[];
  stock: number;
  sku?: string | null;
  status: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
};

type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
};

type OrderRecord = {
  id: string;
  userId?: string | null;
  status: string;
  total: number;
  currency: string;
  shippingName?: string | null;
  shippingEmail?: string | null;
  shippingPhone?: string | null;
  shippingAddress?: string | null;
  paymentReference?: string | null;
  paymentStatus: string;
  promoCode?: string | null;
  promoDiscount?: number | null;
  createdAt: string;
  updatedAt: string;
};

type UserRecord = {
  id: string;
  authUserId?: string | null;
  email?: string | null;
  name?: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type PromoRecord = {
  id: string;
  code: string;
  type: string;
  value: number;
  minSpend?: number | null;
  expiryDate?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  applicableCategories: string[];
  applicableProducts: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
};

import fs from 'fs';
import path from 'path';

type NotificationRecord = {
  id: string;
  userId?: string | null;
  type: string;
  message: string;
  read: boolean;
  target?: string | null;
  createdAt: string;
};

const fallbackStoreFilePath = path.join(process.cwd(), '.data', 'fallback-store.json');

class FallbackStore {
  private state = {
    products: [] as ProductRecord[],
    categories: [] as CategoryRecord[],
    orders: [] as OrderRecord[],
    users: [] as UserRecord[],
    promos: [] as PromoRecord[],
    notifications: [] as NotificationRecord[],
  };

  constructor() {
    this.ensureDataDirectory();
    const loaded = this.loadState();

    if (!loaded) {
      this.initializeDefaults();
      this.persistState();
    }
  }

  private initializeDefaults() {
    if (this.state.categories.length === 0) {
      this.state.categories = [
        {
          id: 'sneakers',
          name: 'Sneakers',
          slug: 'sneakers',
          description: 'Modern everyday sneakers',
          image: '/images/logo.png',
          parentId: null,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { products: 2 },
        },
        {
          id: 'formal',
          name: 'Formal',
          slug: 'formal',
          description: 'Polished formal footwear',
          image: '/images/logo.png',
          parentId: null,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { products: 1 },
        },
      ];
    }

    if (this.state.products.length === 0) {
      this.state.products = [
        {
          id: 'product-1',
          name: 'The Essential Low Top',
          description: 'Minimalist low-top sneaker crafted from premium leather with a memory foam insole for all-day comfort.',
          price: 189,
          compareAtPrice: 249,
          categoryId: 'sneakers',
          category: { id: 'sneakers', name: 'Sneakers', slug: 'sneakers' },
          sizes: ['6', '7', '8', '9', '10', '11', '12', '13'],
          colors: ['White', 'Black', 'Navy'],
          images: ['/images/logo.png'],
          stock: 45,
          sku: 'QH-001',
          status: 'PUBLISHED',
          rating: 4.8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'product-2',
          name: 'Oxford Heritage',
          description: 'Classic oxford in full-grain leather. Perfect for the office or formal occasions.',
          price: 349,
          compareAtPrice: 399,
          categoryId: 'formal',
          category: { id: 'formal', name: 'Formal', slug: 'formal' },
          sizes: ['6', '7', '8', '9', '10', '11', '12', '13'],
          colors: ['Black', 'Brown', 'Tan'],
          images: ['/images/logo.png'],
          stock: 28,
          sku: 'QH-002',
          status: 'PUBLISHED',
          rating: 4.9,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    if (this.state.orders.length === 0) {
      this.state.orders = [
        {
          id: 'order-1',
          userId: 'user-1',
          status: 'PENDING',
          total: 378,
          currency: 'NGN',
          shippingName: 'Ada Okafor',
          shippingEmail: 'ada@example.com',
          shippingPhone: '08012345678',
          shippingAddress: 'Lagos, Nigeria',
          paymentReference: 'paystack-ref-001',
          paymentStatus: 'PENDING',
          promoCode: null,
          promoDiscount: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    if (this.state.users.length === 0) {
      this.state.users = [
        {
          id: 'user-1',
          authUserId: null,
          email: 'customer@example.com',
          name: 'Ada Okafor',
          role: 'CUSTOMER',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'admin-1',
          authUserId: null,
          email: 'admin@example.com',
          name: 'Quinn Admin',
          role: 'ADMIN',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    if (this.state.promos.length === 0) {
      this.state.promos = [
        {
          id: 'promo-1',
          code: 'WELCOME10',
          type: 'PERCENTAGE',
          value: 10,
          minSpend: 100,
          expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          usageLimit: 25,
          usedCount: 3,
          applicableCategories: ['sneakers'],
          applicableProducts: [],
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    if (this.state.notifications.length === 0) {
      this.state.notifications = [
        {
          id: 'notification-1',
          userId: 'admin-1',
          type: 'NEW_ORDER',
          message: 'A new order has been placed and is awaiting review.',
          read: false,
          target: 'admin',
          createdAt: new Date().toISOString(),
        },
      ];
    }
  }

  getProducts(search = '', categorySlug = '') {
    const normalizedSearch = search.toLowerCase();

    return this.state.products
      .filter((product) => {
        const matchesSearch = !normalizedSearch || [product.name, product.description, product.sku ?? ''].join(' ').toLowerCase().includes(normalizedSearch);
        const matchesCategory = !categorySlug || product.category?.slug === categorySlug;
        return matchesSearch && matchesCategory;
      })
      .map((product) => ({ ...product }));
  }

  getProductById(id: string) {
    const product = this.state.products.find((product) => product.id === id);
    return product ? { ...product } : null;
  }

  createProduct(input: Partial<ProductRecord> & { name: string; description: string; price: number }) {
    const product: ProductRecord = {
      id: `product-${Date.now()}`,
      name: input.name,
      description: input.description,
      price: input.price,
      compareAtPrice: input.compareAtPrice ?? null,
      categoryId: input.categoryId ?? null,
      category: input.category ?? null,
      sizes: input.sizes ?? [],
      colors: input.colors ?? [],
      images: input.images ?? ['/images/logo.png'],
      stock: input.stock ?? 0,
      sku: input.sku ?? null,
      status: input.status ?? 'DRAFT',
      rating: input.rating ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.products = [product, ...this.state.products];
    this.persistState();
    return product;
  }

  updateProduct(id: string, input: Partial<ProductRecord>) {
    this.state.products = this.state.products.map((product) => {
      if (product.id !== id) {
        return product;
      }

      const updated = { ...product };
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
          (updated as any)[key] = value;
        }
      });
      updated.updatedAt = new Date().toISOString();
      return updated;
    });

    const product = this.getProductById(id);
    if (product) {
      this.persistState();
    }
    return product;
  }

  deleteProduct(id: string) {
    this.state.products = this.state.products.filter((product) => product.id !== id);
    this.persistState();
  }

  getCategories() {
    return this.state.categories.map((category) => ({ ...category }));
  }

  createCategory(input: Partial<CategoryRecord> & { name: string; slug: string }) {
    const category: CategoryRecord = {
      id: `category-${Date.now()}`,
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      image: input.image ?? null,
      parentId: input.parentId ?? null,
      sortOrder: input.sortOrder ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { products: 0 },
    };

    this.state.categories = [category, ...this.state.categories];
    this.persistState();
    return category;
  }

  updateCategory(id: string, input: Partial<CategoryRecord>) {
    this.state.categories = this.state.categories.map((category) => {
      if (category.id !== id) {
        return category;
      }

      const updated = { ...category };
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
          (updated as any)[key] = value;
        }
      });
      updated.updatedAt = new Date().toISOString();
      return updated;
    });

    const category = this.state.categories.find((category) => category.id === id) ?? null;
    if (category) {
      this.persistState();
    }
    return category;
  }

  deleteCategory(id: string) {
    this.state.categories = this.state.categories.filter((category) => category.id !== id);
    this.persistState();
  }

  getOrders() {
    return this.state.orders.map((order) => ({ ...order }));
  }

  createOrder(input: Partial<OrderRecord> & { total: number }) {
    const order: OrderRecord = {
      id: `order-${Date.now()}`,
      status: input.status ?? 'PENDING',
      total: input.total,
      currency: input.currency ?? 'NGN',
      shippingName: input.shippingName ?? null,
      shippingEmail: input.shippingEmail ?? null,
      shippingPhone: input.shippingPhone ?? null,
      shippingAddress: input.shippingAddress ?? null,
      paymentReference: input.paymentReference ?? null,
      paymentStatus: input.paymentStatus ?? 'PENDING',
      promoCode: input.promoCode ?? null,
      promoDiscount: input.promoDiscount ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.orders = [order, ...this.state.orders];
    this.persistState();
    return order;
  }

  updateOrder(id: string, input: Partial<OrderRecord>) {
    this.state.orders = this.state.orders.map((order) => {
      if (order.id !== id) {
        return order;
      }

      const updated = { ...order };
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
          (updated as any)[key] = value;
        }
      });
      updated.updatedAt = new Date().toISOString();
      return updated;
    });

    const order = this.state.orders.find((order) => order.id === id) ?? null;
    if (order) {
      this.persistState();
    }
    return order;
  }

  getUsers() {
    return this.state.users.map((user) => ({ ...user }));
  }

  updateUser(id: string, input: Partial<UserRecord>) {
    this.state.users = this.state.users.map((user) => {
      if (user.id !== id) {
        return user;
      }

      const updated = { ...user };
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
          (updated as any)[key] = value;
        }
      });
      updated.updatedAt = new Date().toISOString();
      return updated;
    });

    const user = this.state.users.find((user) => user.id === id) ?? null;
    if (user) {
      this.persistState();
    }
    return user;
  }

  getPromos() {
    return this.state.promos.map((promo) => ({ ...promo }));
  }

  getNotifications() {
    return this.state.notifications.map((notification) => ({ ...notification }));
  }

  private ensureDataDirectory() {
    try {
      fs.mkdirSync(path.dirname(fallbackStoreFilePath), { recursive: true });
    } catch (error) {
      console.error('FallbackStore directory creation failed', error);
    }
  }

  private loadState() {
    try {
      if (!fs.existsSync(fallbackStoreFilePath)) {
        return false;
      }

      const raw = fs.readFileSync(fallbackStoreFilePath, 'utf-8');
      const data = JSON.parse(raw) as Partial<{
        products: ProductRecord[];
        categories: CategoryRecord[];
        orders: OrderRecord[];
        users: UserRecord[];
        promos: PromoRecord[];
        notifications: NotificationRecord[];
      }>;

      if (data) {
        this.state = {
          ...this.state,
          ...data,
        };
      }

      return true;
    } catch (error) {
      console.error('FallbackStore load failed', error);
      return false;
    }
  }

  private persistState() {
    try {
      fs.writeFileSync(fallbackStoreFilePath, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (error) {
      console.error('FallbackStore persist failed', error);
    }
  }
}

const globalForFallbackStore = globalThis as typeof globalThis & {
  __quinnFallbackStore?: FallbackStore;
};

export const fallbackStore = globalForFallbackStore.__quinnFallbackStore ??= new FallbackStore();
