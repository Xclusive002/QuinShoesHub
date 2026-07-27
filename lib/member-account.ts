export interface MemberProfile {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  joinedAt: string;
  mode: 'local' | 'supabase';
  authUserId?: string;
  isAuthenticated: boolean;
}

export interface WishlistItem {
  id: string;
  name: string;
  image?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'Processing' | 'Packed' | 'Out for delivery' | 'Delivered';
  total: number;
  trackingCode: string;
  items: OrderItem[];
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readMemberProfile(): MemberProfile | null {
  const profile = readStorage<MemberProfile | null>('quinn-user-profile', null);
  if (!profile) return null;
  return {
    ...profile,
    isAuthenticated: Boolean(profile.isAuthenticated),
  };
}

export function saveMemberProfile(profile: Partial<MemberProfile> & { email: string }) {
  const nextProfile: MemberProfile = {
    email: profile.email,
    fullName: profile.fullName ?? '',
    phone: profile.phone ?? '',
    address: profile.address ?? '',
    city: profile.city ?? '',
    country: profile.country ?? '',
    joinedAt: profile.joinedAt ?? new Date().toISOString(),
    mode: profile.mode ?? 'local',
    authUserId: profile.authUserId,
    isAuthenticated: profile.isAuthenticated ?? true,
  };

  writeStorage('quinn-user-profile', nextProfile);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('quinn-auth-changed'));
  }

  return nextProfile;
}

export function clearMemberProfile() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('quinn-user-profile');
  window.dispatchEvent(new Event('quinn-auth-changed'));
}

export function getWishlist(): WishlistItem[] {
  return readStorage<WishlistItem[]>('quinn-wishlist', []);
}

export function saveWishlist(items: WishlistItem[]) {
  writeStorage('quinn-wishlist', items);
}

export function getOrders(): OrderRecord[] {
  return readStorage<OrderRecord[]>('quinn-orders', []);
}

export function saveOrders(orders: OrderRecord[]) {
  writeStorage('quinn-orders', orders);
}

export function createOrderFromCart(items: OrderItem[], total: number): OrderRecord {
  const orderNumber = `QH-${Math.floor(1000 + Math.random() * 9000)}`;
  return {
    id: `order-${Date.now()}`,
    orderNumber,
    createdAt: new Date().toISOString(),
    status: 'Processing',
    total,
    trackingCode: `${orderNumber}-TRK`,
    items,
  };
}

export function getTrackingSteps(status: OrderRecord['status']) {
  switch (status) {
    case 'Delivered':
      return ['Placed', 'Packed', 'Out for delivery', 'Delivered'];
    case 'Out for delivery':
      return ['Placed', 'Packed', 'Out for delivery'];
    case 'Packed':
      return ['Placed', 'Packed'];
    default:
      return ['Placed', 'Processing'];
  }
}
