import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import bundledData from '../data/bundledPersistedData.json';

const DB_NAME = 'maris_store_db';
const DB_VERSION = 1;
const STORE_CUSTOM = 'custom_products';
const STORE_EDITS = 'edited_products';

// Open or initialize IndexedDB
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_CUSTOM)) {
        db.createObjectStore(STORE_CUSTOM, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_EDITS)) {
        db.createObjectStore(STORE_EDITS, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get all items from an IndexedDB object store
async function idbGetAll<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (e) {
    return [];
  }
}

// Save items into an IndexedDB object store
async function idbPutAll<T extends { id: string }>(storeName: string, items: T[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    items.forEach((item) => store.put(item));
  } catch (e) {
    console.warn('IndexedDB put error:', e);
  }
}

// Read custom and edited products from all local sources (bundled DB snapshot, localStorage, IndexedDB)
export function getLocalStoredProductsSync(): { custom: Product[]; edited: Product[] } {
  const customMap = new Map<string, Product>();
  const editedMap = new Map<string, Product>();

  let deletedIds = new Set<string>();
  try {
    const rawDeleted = localStorage.getItem('maris_deleted_product_ids');
    if (rawDeleted) {
      const parsedDeleted = JSON.parse(rawDeleted);
      if (Array.isArray(parsedDeleted)) {
        deletedIds = new Set(parsedDeleted);
      }
    }
  } catch (e) {}

  // Seed with bundled database snapshot (so Vercel / GitHub Pages static builds match AI Studio DB)
  try {
    const bundledCustom = (bundledData as any)?.customProducts;
    if (Array.isArray(bundledCustom)) {
      bundledCustom.forEach((p: Product) => {
        if (p && p.id && !deletedIds.has(p.id) && !PRODUCTS.some((dp) => dp.id === p.id)) {
          customMap.set(p.id, p);
        }
      });
    }
    const bundledEdited = (bundledData as any)?.editedProducts;
    if (Array.isArray(bundledEdited)) {
      bundledEdited.forEach((p: Product) => {
        if (p && p.id && !deletedIds.has(p.id) && PRODUCTS.some((dp) => dp.id === p.id)) {
          editedMap.set(p.id, p);
        }
      });
    }
  } catch (e) {}

  // Check all possible localStorage keys
  const customKeys = [
    'maris_custom_products',
    'ales_custom_products',
    'custom_products',
    'maris_products',
    'ales_products',
    'products'
  ];

  const editKeys = [
    'maris_edited_products',
    'ales_edited_products',
    'edited_products'
  ];

  for (const key of editKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((p: Product) => {
            if (p && p.id && PRODUCTS.some((dp) => dp.id === p.id)) {
              editedMap.set(p.id, p);
            }
          });
        }
      }
    } catch (e) {}
  }

  for (const key of customKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((p: Product) => {
            if (p && p.id && !PRODUCTS.some((dp) => dp.id === p.id)) {
              customMap.set(p.id, p);
            }
          });
        }
      }
    } catch (e) {}
  }

  return {
    custom: Array.from(customMap.values()),
    edited: Array.from(editedMap.values())
  };
}

// Asynchronously load from IndexedDB + localStorage + server
export async function loadAllPersistedProducts(): Promise<{
  mergedProducts: Product[];
  customProducts: Product[];
  editedProducts: Product[];
}> {
  // 1. Start with base products
  let baseProducts = [...PRODUCTS];

  // 2. Read from sync local storage
  const syncData = getLocalStoredProductsSync();
  const customMap = new Map<string, Product>();
  const editedMap = new Map<string, Product>();

  syncData.custom.forEach((p) => customMap.set(p.id, p));
  syncData.edited.forEach((p) => editedMap.set(p.id, p));

  // 3. Read from IndexedDB
  try {
    const idbCustom = await idbGetAll<Product>(STORE_CUSTOM);
    const idbEdits = await idbGetAll<Product>(STORE_EDITS);

    idbCustom.forEach((p) => {
      if (p && p.id && !PRODUCTS.some((dp) => dp.id === p.id)) {
        customMap.set(p.id, p);
      }
    });

    idbEdits.forEach((p) => {
      if (p && p.id && PRODUCTS.some((dp) => dp.id === p.id)) {
        editedMap.set(p.id, p);
      }
    });
  } catch (e) {}

  // 4. Fetch from Server
  try {
    const res = await fetch('/api/products/persisted');
    if (res.ok) {
      const { custom: srvCustom, edited: srvEdits } = await res.json();
      if (Array.isArray(srvCustom)) {
        srvCustom.forEach((p: Product) => {
          if (p && p.id && !PRODUCTS.some((dp) => dp.id === p.id)) {
            customMap.set(p.id, p);
          }
        });
      }
      if (Array.isArray(srvEdits)) {
        srvEdits.forEach((p: Product) => {
          if (p && p.id && PRODUCTS.some((dp) => dp.id === p.id)) {
            editedMap.set(p.id, p);
          }
        });
      }
    }
  } catch (e) {
    console.warn('Server sync offline or skipped:', e);
  }

  const finalCustom = Array.from(customMap.values());
  const finalEdits = Array.from(editedMap.values());

  // Apply edits to base products
  if (finalEdits.length > 0) {
    baseProducts = baseProducts.map((p) => {
      const e = editedMap.get(p.id);
      return e ? e : p;
    });
  }

  const merged = [...finalCustom, ...baseProducts];

  // Save reconciled data back to IndexedDB and localStorage
  saveProductsToStorage(merged);

  // Sync any custom products and modified base products to the server (and bundledPersistedData.json)
  finalCustom.forEach((cp) => {
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: cp, isEdit: false })
    }).catch(() => {});
  });

  finalEdits.forEach((ep) => {
    const orig = PRODUCTS.find((dp) => dp.id === ep.id);
    if (!orig || JSON.stringify(ep) !== JSON.stringify(orig)) {
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: ep, isEdit: true })
      }).catch(() => {});
    }
  });

  return {
    mergedProducts: merged,
    customProducts: finalCustom,
    editedProducts: finalEdits
  };
}

// Persist all products into IndexedDB, localStorage & Server
export function saveProductsToStorage(allProducts: Product[]): void {
  const customItems = allProducts.filter((p) => !PRODUCTS.some((dp) => dp.id === p.id));
  const editedItems = allProducts.filter((p) => PRODUCTS.some((dp) => dp.id === p.id));

  // Save to IndexedDB (asynchronous, high capacity)
  idbPutAll(STORE_CUSTOM, customItems);
  idbPutAll(STORE_EDITS, editedItems);

  // Save to localStorage with quota safety
  try {
    const customJson = JSON.stringify(customItems);
    localStorage.setItem('maris_custom_products', customJson);
    localStorage.setItem('ales_custom_products', customJson);
    localStorage.setItem('custom_products', customJson);
  } catch (e) {
    console.warn('LocalStorage quota limit reached, relying on IndexedDB & Server:', e);
  }

  try {
    const editedJson = JSON.stringify(editedItems);
    localStorage.setItem('maris_edited_products', editedJson);
    localStorage.setItem('ales_edited_products', editedJson);
    localStorage.setItem('edited_products', editedJson);
  } catch (e) {}
}

// Delete a product permanently from all storage tiers (IndexedDB, LocalStorage, Server)
export async function deleteProductFromStorage(productId: string): Promise<void> {
  // 1. Delete from IndexedDB
  try {
    const db = await openDatabase();
    const txCustom = db.transaction(STORE_CUSTOM, 'readwrite');
    txCustom.objectStore(STORE_CUSTOM).delete(productId);

    const txEdits = db.transaction(STORE_EDITS, 'readwrite');
    txEdits.objectStore(STORE_EDITS).delete(productId);
  } catch (e) {
    console.warn('IndexedDB delete error:', e);
  }

  // 2. Delete from LocalStorage and record deleted ID
  try {
    const rawDel = localStorage.getItem('maris_deleted_product_ids');
    const delList: string[] = rawDel ? JSON.parse(rawDel) : [];
    if (!delList.includes(productId)) {
      delList.push(productId);
      localStorage.setItem('maris_deleted_product_ids', JSON.stringify(delList));
    }
  } catch (e) {}

  const customKeys = ['maris_custom_products', 'ales_custom_products', 'custom_products', 'maris_products', 'ales_products', 'products'];
  for (const k of customKeys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((p: Product) => p?.id !== productId);
          localStorage.setItem(k, JSON.stringify(filtered));
        }
      }
    } catch (e) {}
  }

  const editKeys = ['maris_edited_products', 'ales_edited_products', 'edited_products'];
  for (const k of editKeys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((p: Product) => p?.id !== productId);
          localStorage.setItem(k, JSON.stringify(filtered));
        }
      }
    } catch (e) {}
  }

  // 3. Delete from Server API
  try {
    await fetch(`/api/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.warn('Server delete error:', e);
  }
}

// Optimize / compress images in browser before upload to prevent quota issues
export async function optimizeImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export as JPEG with 0.88 quality (crisp luxury look, lightweight size)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
