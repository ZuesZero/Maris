export type Category = 'Outerwear' | 'Suits & Blazers' | 'Knitwear' | 'Trousers' | 'Shirts & Silk' | 'Shoes' | 'Accessories' | 'Miscellaneous';

export type Size = 'EU 40' | 'EU 41' | 'EU 42' | 'EU 43' | 'EU 44' | 'EU 46' | 'EU 48' | 'EU 50' | 'EU 52' | 'EU 54' | 'One Size';

export interface ImageFrameSettings {
  fit: 'cover' | 'contain' | 'fill' | 'scale-down';
  positionY: number; // 0 to 100
  positionX: number; // 0 to 100
  zoom: number; // 50 to 200
  padding: number; // 0 to 40
  backgroundColor: string; // e.g. '#F4F0EA'
  rotation?: number; // 0, 90, 180, 270, 360
  mirrorX?: boolean; // horizontal flip
  mirrorY?: boolean; // vertical flip
  cropTop?: number; // 0 to 45 (%)
  cropRight?: number; // 0 to 45 (%)
  cropBottom?: number; // 0 to 45 (%)
  cropLeft?: number; // 0 to 45 (%)
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  costPrice?: number;
  category: Category;
  colors: { name: string; hex: string; image?: string }[];
  sizes: Size[];
  images: string[];
  description: string;
  fabricDetails: string[];
  garmentCare: string[];
  shippingInfo: string;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  stockQuantity?: number;
  inStock?: boolean;
  imageFrameSettings?: ImageFrameSettings;
  stock: Record<string, number>; // size -> count
  reviews: Review[];
  completeTheLookIds: string[];
}

export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

export interface CartItem {
  product: Product;
  selectedColor: string;
  selectedSize: Size;
  quantity: number;
}

export type ViewMode = 'home' | 'catalog' | 'product-detail' | 'cart' | 'editorial' | 'concierge' | 'inventory' | 'users';

export interface FilterState {
  category: string;
  color: string;
  size: string;
  maxPrice: number;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest';
  searchQuery: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  cellphone?: string;
  profile?: string; // "Developer" or "User"
  avatar?: string;
  memberTier?: string;
  createdAt?: string;
}

export interface SaleTransaction {
  id: string;
  date: string;
  year: '2024' | '2025' | '2026';
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  productName: string;
  productId: string;
  category: Category;
  productImage: string;
  size: string;
  color: string;
  customerName: string;
  customerEmail: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  totalSale: number;
  grossProfit: number;
  paymentMethod: 'Credit Card' | 'Apple Pay' | 'Wire Transfer' | 'Amex Centurion';
  channel: 'Boutique Milano' | 'Online Store' | 'Atelier Paris' | 'VIP Private Concierge';
  status: 'Completed' | 'Delivered' | 'In Transit' | 'Refunded';
}

