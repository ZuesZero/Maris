import { db } from './index.ts';
import { products, salesTransactions, users, imageFrameSettings } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

function formatDbError(error: unknown): string {
  if (error instanceof Error) {
    return error.message.slice(0, 300);
  }
  return String(error).slice(0, 300);
}

// Products Queries
export async function getAllProducts() {
  try {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  } catch (error) {
    console.warn('Database query notice for getAllProducts:', formatDbError(error));
    throw new Error('Database query failed for products');
  }
}

export async function upsertProduct(productData: any) {
  try {
    return await db
      .insert(products)
      .values({
        id: productData.id,
        name: productData.name,
        subtitle: productData.subtitle || null,
        price: Number(productData.price) || 0,
        costPrice: productData.costPrice ? Number(productData.costPrice) : null,
        category: productData.category,
        description: productData.description || null,
        images: productData.images || [],
        colors: productData.colors || [],
        sizes: productData.sizes || [],
        stock: productData.stock || {},
        fabricDetails: productData.fabricDetails || [],
        garmentCare: productData.garmentCare || [],
        shippingInfo: productData.shippingInfo || null,
        isNewArrival: Boolean(productData.isNewArrival),
        isBestseller: Boolean(productData.isBestseller),
        isFeatured: Boolean(productData.isFeatured),
        imageFrameSettings: productData.imageFrameSettings || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: products.id,
        set: {
          name: productData.name,
          subtitle: productData.subtitle || null,
          price: Number(productData.price) || 0,
          costPrice: productData.costPrice ? Number(productData.costPrice) : null,
          category: productData.category,
          description: productData.description || null,
          images: productData.images || [],
          colors: productData.colors || [],
          sizes: productData.sizes || [],
          stock: productData.stock || {},
          fabricDetails: productData.fabricDetails || [],
          garmentCare: productData.garmentCare || [],
          shippingInfo: productData.shippingInfo || null,
          isNewArrival: Boolean(productData.isNewArrival),
          isBestseller: Boolean(productData.isBestseller),
          isFeatured: Boolean(productData.isFeatured),
          imageFrameSettings: productData.imageFrameSettings || null,
          updatedAt: new Date(),
        },
      })
      .returning();
  } catch (error) {
    console.warn('Database query notice for upsertProduct:', formatDbError(error));
    throw new Error('Database query failed to upsert product');
  }
}

export async function deleteProductById(productId: string) {
  try {
    return await db.delete(products).where(eq(products.id, productId)).returning();
  } catch (error) {
    console.warn('Database query notice for deleteProductById:', formatDbError(error));
    throw new Error('Database query failed to delete product');
  }
}

// Sales Transactions Queries
export async function getAllSalesTransactions() {
  try {
    return await db.select().from(salesTransactions).orderBy(desc(salesTransactions.createdAt));
  } catch (error) {
    console.warn('Database query notice for getAllSalesTransactions:', formatDbError(error));
    throw new Error('Database query failed for sales transactions');
  }
}

export async function upsertSaleTransaction(tx: any) {
  try {
    return await db
      .insert(salesTransactions)
      .values({
        id: tx.id,
        date: tx.date,
        year: tx.year,
        quarter: tx.quarter,
        productName: tx.productName,
        productId: tx.productId,
        productImage: tx.productImage || null,
        size: tx.size,
        color: tx.color,
        category: tx.category,
        customerName: tx.customerName,
        customerEmail: tx.customerEmail,
        quantity: Number(tx.quantity) || 1,
        unitPrice: Number(tx.unitPrice) || 0,
        unitCost: Number(tx.unitCost) || 0,
        totalSale: Number(tx.totalSale) || 0,
        grossProfit: Number(tx.grossProfit) || 0,
        paymentMethod: tx.paymentMethod,
        channel: tx.channel,
        status: tx.status,
      })
      .onConflictDoUpdate({
        target: salesTransactions.id,
        set: {
          date: tx.date,
          year: tx.year,
          quarter: tx.quarter,
          productName: tx.productName,
          productId: tx.productId,
          productImage: tx.productImage || null,
          size: tx.size,
          color: tx.color,
          category: tx.category,
          customerName: tx.customerName,
          customerEmail: tx.customerEmail,
          quantity: Number(tx.quantity) || 1,
          unitPrice: Number(tx.unitPrice) || 0,
          unitCost: Number(tx.unitCost) || 0,
          totalSale: Number(tx.totalSale) || 0,
          grossProfit: Number(tx.grossProfit) || 0,
          paymentMethod: tx.paymentMethod,
          channel: tx.channel,
          status: tx.status,
        },
      })
      .returning();
  } catch (error) {
    console.warn('Database query notice for upsertSaleTransaction:', formatDbError(error));
    throw new Error('Database query failed to upsert transaction');
  }
}

export async function deleteSaleTransactionById(transactionId: string) {
  try {
    return await db.delete(salesTransactions).where(eq(salesTransactions.id, transactionId)).returning();
  } catch (error) {
    console.warn('Database query notice for deleteSaleTransactionById:', formatDbError(error));
    throw new Error('Database query failed to delete transaction');
  }
}

// Users Queries
export async function getOrCreateUser(uid: string, email: string, name?: string, avatar?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name || null,
        avatar: avatar || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(name ? { name } : {}),
          ...(avatar ? { avatar } : {}),
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.warn('Database query notice for getOrCreateUser:', formatDbError(error));
    throw new Error('Database query failed to upsert user');
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.warn('Database query notice for getAllUsers:', formatDbError(error));
    throw new Error('Database query failed to fetch users');
  }
}

// Frame Settings Queries
export async function getFrameSettings(id: string = '__global__') {
  try {
    const rows = await db.select().from(imageFrameSettings).where(eq(imageFrameSettings.id, id));
    return rows[0]?.settings || null;
  } catch (error) {
    console.warn('Database query notice for getFrameSettings:', formatDbError(error));
    throw new Error('Database query failed to fetch frame settings');
  }
}

export async function getAllFrameSettings() {
  try {
    const rows = await db.select().from(imageFrameSettings);
    const map: Record<string, any> = {};
    rows.forEach(r => {
      map[r.id] = r.settings;
    });
    return map;
  } catch (error) {
    console.warn('Database query notice for getAllFrameSettings:', formatDbError(error));
    throw new Error('Database query failed to fetch all frame settings');
  }
}

export async function saveFrameSettings(id: string, settings: any) {
  try {
    return await db
      .insert(imageFrameSettings)
      .values({
        id,
        settings,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: imageFrameSettings.id,
        set: {
          settings,
          updatedAt: new Date(),
        },
      })
      .returning();
  } catch (error) {
    console.warn('Database query notice for saveFrameSettings:', formatDbError(error));
    throw new Error('Database query failed to save frame settings');
  }
}
