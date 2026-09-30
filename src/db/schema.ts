import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  cellphone: text('cellphone'),
  profile: text('profile').default('User'),
  avatar: text('avatar'),
  memberTier: text('member_tier').default('Atelier Member'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  subtitle: text('subtitle'),
  price: integer('price').notNull(),
  costPrice: integer('cost_price'),
  category: text('category').notNull(),
  description: text('description'),
  images: jsonb('images').$type<string[]>(),
  colors: jsonb('colors').$type<{ name: string; hex: string; image?: string }[]>(),
  sizes: jsonb('sizes').$type<string[]>(),
  stock: jsonb('stock').$type<Record<string, number>>(),
  fabricDetails: jsonb('fabric_details').$type<string[]>(),
  garmentCare: jsonb('garment_care').$type<string[]>(),
  shippingInfo: text('shipping_info'),
  isNewArrival: boolean('is_new_arrival').default(false),
  isBestseller: boolean('is_bestseller').default(false),
  isFeatured: boolean('is_featured').default(false),
  imageFrameSettings: jsonb('image_frame_settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const salesTransactions = pgTable('sales_transactions', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  year: text('year').notNull(),
  quarter: text('quarter').notNull(),
  productName: text('product_name').notNull(),
  productId: text('product_id').notNull(),
  productImage: text('product_image'),
  size: text('size').notNull(),
  color: text('color').notNull(),
  category: text('category').notNull(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: integer('unit_price').notNull(),
  unitCost: integer('unit_cost').notNull(),
  totalSale: integer('total_sale').notNull(),
  grossProfit: integer('gross_profit').notNull(),
  paymentMethod: text('payment_method').notNull(),
  channel: text('channel').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const imageFrameSettings = pgTable('image_frame_settings', {
  id: text('id').primaryKey(),
  settings: jsonb('settings').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
