import { db } from './index.ts';
import { products, salesTransactions, users, imageFrameSettings } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

// Products Queries
export async function getAllProducts() {
  try {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  } catch (error) {
    console.error('Database query failed for getAllProducts:', error);
    throw new Error('Database query failed for products', { cause: error });
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
    console.error('Database query failed for upsertProduct:', error);
    throw new Error('Database query failed to upsert product', { cause: error });
  }
}

export async function deleteProductById(productId: string) {
  try {
    return await db.delete(products).where(eq(products.id, productId)).returning();
  } catch (error) {
    console.error('Database query failed for deleteProductById:', error);
    throw new Error('Database query failed to delete product', { cause: error });
  }
}

// Sales Transactions Queries
export async function getAllSalesTransactions() {
  try {
    return await db.select().from(salesTransactions).orderBy(desc(salesTransactions.createdAt));
  } catch (error) {
    console.error('Database query failed for getAllSalesTransactions:', error);
    throw new Error('Database query failed for sales transactions', { cause: error });
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
    console.error('Database query failed for upsertSaleTransaction:', error);
    throw new Error('Database query failed to upsert transaction', { cause: error });
  }
}

export async function deleteSaleTransactionById(transactionId: string) {
  try {
    return await db.delete(salesTransactions).where(eq(salesTransactions.id, transactionId)).returning();
  } catch (error) {
    console.error('Database query failed for deleteSaleTransactionById:', error);
    throw new Error('Database query failed to delete transaction', { cause: error });
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
    console.error('Database query failed for getOrCreateUser:', error);
    throw new Error('Database query failed to upsert user', { cause: error });
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.error('Database query failed for getAllUsers:', error);
    throw new Error('Database query failed to fetch users', { cause: error });
  }
}

// Frame Settings Queries
export async function getFrameSettings(id: string = '__global__') {
  try {
    const rows = await db.select().from(imageFrameSettings).where(eq(imageFrameSettings.id, id));
    return rows[0]?.settings || null;
  } catch (error) {
    console.error('Database query failed for getFrameSettings:', error);
    throw new Error('Database query failed to fetch frame settings', { cause: error });
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
    console.error('Database query failed for getAllFrameSettings:', error);
    throw new Error('Database query failed to fetch all frame settings', { cause: error });
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
    console.error('Database query failed for saveFrameSettings:', error);
    throw new Error('Database query failed to save frame settings', { cause: error });
  }
}
