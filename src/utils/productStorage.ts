import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import bundledData from '../data/bundledPersistedData.json';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const DB_NAME = 'maris_store_db';
const FIRESTORE_PRODUCTS_COL = 'catalog_products';
const FIRESTORE_META_COL = 'catalog_meta';
const FIRESTORE_META_DOC = 'state';

function sanitizeDocId(id: string): string {
  return String(id || 'item')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 128);
}

function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map((v) => sanitizeForFirestore(v)).filter((v) => v !== undefined);
  }
  if (typeof obj === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        out[k] = sanitizeForFirestore(v);
      }
    }
    return out;
  }
  return obj;
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  if (!product || !product.id) return;
  const safeId = sanitizeDocId(product.id);
  const cleanProduct = sanitizeForFirestore({
    ...product,
    id: safeId,
    name: String(product.name || 'Untitled').slice(0, 300),
    price: Math.max(0, Number(product.price) || 0),
    category: String(product.category || 'Outerwear').slice(0, 100),
    images: Array.isArray(product.images) ? product.images.slice(0, 20) : [],
    sizes: Array.isArray(product.sizes) ? product.sizes.slice(0, 20) : [],
    colors: Array.isArray(product.colors) ? product.colors.slice(0, 30) : [],
    updatedAt: new Date().toISOString()
  });

  try {
    await setDoc(doc(db, FIRESTORE_PRODUCTS_COL, safeId), cleanProduct);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, `${FIRESTORE_PRODUCTS_COL}/${safeId}`);
    } catch (_) {}
  }

  // Ensure this product ID is removed from Firestore deletedProductIds if it was previously deleted
  try {
    const metaRef = doc(db, FIRESTORE_META_COL, FIRESTORE_META_DOC);
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists()) {
      const data = metaSnap.data();
      if (Array.isArray(data?.deletedProductIds) && data.deletedProductIds.includes(product.id)) {
        const updatedDeleted = data.deletedProductIds.filter((id: string) => id !== product.id && id !== safeId);
        await setDoc(metaRef, {
          deletedProductIds: updatedDeleted.slice(0, 500),
          updatedAt: new Date().toISOString()
        });
      }
    }
  } catch (_) {}
}
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

export function getDeletedProductIdsSync(): Set<string> {
  const deletedIds = new Set<string>();
  try {
    const bundledDeleted = (bundledData as any)?.deletedProductIds;
    if (Array.isArray(bundledDeleted)) {
      bundledDeleted.forEach((id: string) => deletedIds.add(id));
    }
  } catch (e) {}
  try {
    const rawDeleted = localStorage.getItem('maris_deleted_product_ids');
    if (rawDeleted) {
      const parsedDeleted = JSON.parse(rawDeleted);
      if (Array.isArray(parsedDeleted)) {
        parsedDeleted.forEach((id: string) => deletedIds.add(id));
      }
    }
  } catch (e) {}
  return deletedIds;
}

// Read custom and edited products from all local sources (bundled DB snapshot, localStorage, IndexedDB)
export function getLocalStoredProductsSync(): { custom: Product[]; edited: Product[] } {
  const customMap = new Map<string, Product>();
  const editedMap = new Map<string, Product>();

  const deletedIds = getDeletedProductIdsSync();

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
            if (p && p.id && !deletedIds.has(p.id) && PRODUCTS.some((dp) => dp.id === p.id)) {
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
            if (p && p.id && !deletedIds.has(p.id) && !PRODUCTS.some((dp) => dp.id === p.id)) {
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
  const deletedIds = getDeletedProductIdsSync();

  // 1. Start with base products
  let baseProducts = [...PRODUCTS];

  // 2. Read from sync local storage
  const syncData = getLocalStoredProductsSync();
  const customMap = new Map<string, Product>();
  const editedMap = new Map<string, Product>();

  syncData.custom.forEach((p) => {
    if (!deletedIds.has(p.id)) customMap.set(p.id, p);
  });
  syncData.edited.forEach((p) => {
    if (!deletedIds.has(p.id)) editedMap.set(p.id, p);
  });

  // 3. Read from IndexedDB
  try {
    const idbCustom = await idbGetAll<Product>(STORE_CUSTOM);
    const idbEdits = await idbGetAll<Product>(STORE_EDITS);

    idbCustom.forEach((p) => {
      if (p && p.id && !deletedIds.has(p.id) && !PRODUCTS.some((dp) => dp.id === p.id)) {
        customMap.set(p.id, p);
      }
    });

    idbEdits.forEach((p) => {
      if (p && p.id && !deletedIds.has(p.id) && PRODUCTS.some((dp) => dp.id === p.id)) {
        editedMap.set(p.id, p);
      }
    });
  } catch (e) {}

  // 4. Fetch from Server (when running in AI Studio)
  try {
    const res = await fetch('/api/products/persisted');
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const { custom: srvCustom, edited: srvEdits, deletedIds: srvDeletedIds } = await res.json();
        if (Array.isArray(srvDeletedIds)) {
          srvDeletedIds.forEach((id: string) => {
            deletedIds.add(id);
            customMap.delete(id);
            editedMap.delete(id);
          });
          try {
            localStorage.setItem('maris_deleted_product_ids', JSON.stringify(Array.from(deletedIds)));
          } catch (e) {}
        }
        if (Array.isArray(srvCustom)) {
          srvCustom.forEach((p: Product) => {
            if (p && p.id && !deletedIds.has(p.id) && !PRODUCTS.some((dp) => dp.id === p.id)) {
              customMap.set(p.id, p);
            }
          });
        }
        if (Array.isArray(srvEdits)) {
          srvEdits.forEach((p: Product) => {
            if (p && p.id && !deletedIds.has(p.id) && PRODUCTS.some((dp) => dp.id === p.id)) {
              editedMap.set(p.id, p);
            }
          });
        }
      }
    }
  } catch (e) {
    console.warn('Server sync offline or skipped:', e);
  }

  // 5. Fetch from Firebase Firestore (works on Vercel, GitHub Pages, Cellphone, and AI Studio!)
  try {
    const metaRef = doc(db, FIRESTORE_META_COL, FIRESTORE_META_DOC);
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists()) {
      const metaData = metaSnap.data();
      if (Array.isArray(metaData?.deletedProductIds)) {
        metaData.deletedProductIds.forEach((id: string) => {
          deletedIds.add(id);
          customMap.delete(id);
          editedMap.delete(id);
        });
        try {
          localStorage.setItem('maris_deleted_product_ids', JSON.stringify(Array.from(deletedIds)));
        } catch (e) {}
      }
    } else if (deletedIds.size > 0) {
      await setDoc(metaRef, {
        deletedProductIds: Array.from(deletedIds).slice(0, 500),
        updatedAt: new Date().toISOString()
      });
    }

    const colSnap = await getDocs(collection(db, FIRESTORE_PRODUCTS_COL));
    const fsIds = new Set<string>();
    colSnap.forEach((docSnap) => {
      const p = docSnap.data() as Product;
      if (p && p.id && !deletedIds.has(p.id)) {
        fsIds.add(p.id);
        if (PRODUCTS.some((dp) => dp.id === p.id)) {
          editedMap.set(p.id, p);
        } else {
          customMap.set(p.id, p);
        }
      }
    });

    // Seed any local custom products that aren't in Firestore yet
    for (const cp of Array.from(customMap.values())) {
      if (!fsIds.has(cp.id) && !deletedIds.has(cp.id)) {
        saveProductToFirestore(cp).catch(() => {});
      }
    }
    for (const ep of Array.from(editedMap.values())) {
      const orig = PRODUCTS.find((dp) => dp.id === ep.id);
      if (!fsIds.has(ep.id) && !deletedIds.has(ep.id) && (!orig || JSON.stringify(ep) !== JSON.stringify(orig))) {
        saveProductToFirestore(ep).catch(() => {});
      }
    }
  } catch (e) {
    console.warn('Firestore initial sync skipped:', e);
  }

  baseProducts = baseProducts.filter((p) => !deletedIds.has(p.id));

  const finalCustom = Array.from(customMap.values()).filter((p) => !deletedIds.has(p.id));
  const finalEdits = Array.from(editedMap.values()).filter((p) => !deletedIds.has(p.id));

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
  // Remove any active product IDs from deleted list
  try {
    const activeIds = new Set(allProducts.map((p) => p.id));
    const rawDel = localStorage.getItem('maris_deleted_product_ids');
    if (rawDel) {
      const delList: string[] = JSON.parse(rawDel);
      if (Array.isArray(delList)) {
        const remainingDeleted = delList.filter((id) => !activeIds.has(id));
        localStorage.setItem('maris_deleted_product_ids', JSON.stringify(remainingDeleted));
      }
    }
  } catch (e) {}

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

// Delete all products permanently from all storage tiers (IndexedDB, LocalStorage, Server)
export async function deleteAllProductsFromStorage(currentProductIds: string[] = []): Promise<void> {
  const allIdsToDelete = Array.from(
    new Set([
      ...PRODUCTS.map((p) => p.id),
      ...currentProductIds,
      ...Array.from(getDeletedProductIdsSync())
    ])
  );

  // 1. Clear IndexedDB stores
  try {
    const db = await openDatabase();
    const txCustom = db.transaction(STORE_CUSTOM, 'readwrite');
    txCustom.objectStore(STORE_CUSTOM).clear();

    const txEdits = db.transaction(STORE_EDITS, 'readwrite');
    txEdits.objectStore(STORE_EDITS).clear();
  } catch (e) {
    console.warn('IndexedDB clear error:', e);
  }

  // 2. Clear LocalStorage and record all deleted IDs
  try {
    localStorage.setItem('maris_deleted_product_ids', JSON.stringify(allIdsToDelete));
  } catch (e) {}

  const customKeys = ['maris_custom_products', 'ales_custom_products', 'custom_products', 'maris_products', 'ales_products', 'products'];
  for (const k of customKeys) {
    try {
      localStorage.setItem(k, JSON.stringify([]));
    } catch (e) {}
  }

  const editKeys = ['maris_edited_products', 'ales_edited_products', 'edited_products'];
  for (const k of editKeys) {
    try {
      localStorage.setItem(k, JSON.stringify([]));
    } catch (e) {}
  }

  // 3. Delete all from Server API & Firebase Firestore
  try {
    await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deletedIds: allIdsToDelete })
    });
  } catch (e) {
    console.warn('Server delete all error:', e);
  }

  try {
    await setDoc(doc(db, FIRESTORE_META_COL, FIRESTORE_META_DOC), {
      deletedProductIds: allIdsToDelete.slice(0, 500),
      updatedAt: new Date().toISOString()
    });
    const colSnap = await getDocs(collection(db, FIRESTORE_PRODUCTS_COL));
    const deletePromises: Promise<void>[] = [];
    colSnap.forEach((docSnap) => {
      deletePromises.push(deleteDoc(doc(db, FIRESTORE_PRODUCTS_COL, docSnap.id)));
    });
    await Promise.all(deletePromises);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.DELETE, FIRESTORE_PRODUCTS_COL);
    } catch (_) {}
  }
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

  // 3. Delete from Server API & Firebase Firestore
  try {
    await fetch(`/api/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.warn('Server delete error:', e);
  }

  try {
    const safeId = sanitizeDocId(productId);
    await deleteDoc(doc(db, FIRESTORE_PRODUCTS_COL, safeId));
    const currentDeleted = Array.from(getDeletedProductIdsSync());
    if (!currentDeleted.includes(productId)) currentDeleted.push(productId);
    await setDoc(doc(db, FIRESTORE_META_COL, FIRESTORE_META_DOC), {
      deletedProductIds: currentDeleted.slice(0, 500),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.DELETE, `${FIRESTORE_PRODUCTS_COL}/${productId}`);
    } catch (_) {}
  }
}

// Real-time Firestore listener so changes on Vercel (computer) appear immediately on cellphone
export function subscribeToRealtimeCatalog(
  onUpdate: (mergedProducts: Product[]) => void
): () => void {
  let latestFsProducts = new Map<string, Product>();
  let latestDeletedIds = getDeletedProductIdsSync();
  let hasLoadedMeta = false;
  let hasLoadedProducts = false;

  const recomputeAndNotify = () => {
    if (!hasLoadedMeta && !hasLoadedProducts) return;

    let baseProducts = PRODUCTS.filter((p) => !latestDeletedIds.has(p.id));
    const customMap = new Map<string, Product>();
    const editedMap = new Map<string, Product>();

    // Include bundled snapshot items unless deleted
    try {
      const bundledCustom = (bundledData as any)?.customProducts;
      if (Array.isArray(bundledCustom)) {
        bundledCustom.forEach((p: Product) => {
          if (p && p.id && !latestDeletedIds.has(p.id) && !PRODUCTS.some((dp) => dp.id === p.id)) {
            customMap.set(p.id, p);
          }
        });
      }
      const bundledEdited = (bundledData as any)?.editedProducts;
      if (Array.isArray(bundledEdited)) {
        bundledEdited.forEach((p: Product) => {
          if (p && p.id && !latestDeletedIds.has(p.id) && PRODUCTS.some((dp) => dp.id === p.id)) {
            editedMap.set(p.id, p);
          }
        });
      }
    } catch (_) {}

    // Overlay live Firestore products
    latestFsProducts.forEach((p) => {
      if (p && p.id && !latestDeletedIds.has(p.id)) {
        if (PRODUCTS.some((dp) => dp.id === p.id)) {
          editedMap.set(p.id, p);
        } else {
          customMap.set(p.id, p);
        }
      }
    });

    baseProducts = baseProducts.map((p) => {
      const edited = editedMap.get(p.id);
      return edited ? edited : p;
    });

    const merged = [...Array.from(customMap.values()), ...baseProducts];
    saveProductsToStorage(merged);
    onUpdate(merged);
  };

  const unsubMeta = onSnapshot(
    doc(db, FIRESTORE_META_COL, FIRESTORE_META_DOC),
    (docSnap) => {
      hasLoadedMeta = true;
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data?.deletedProductIds)) {
          latestDeletedIds = new Set<string>(data.deletedProductIds);
          try {
            localStorage.setItem('maris_deleted_product_ids', JSON.stringify(data.deletedProductIds));
          } catch (_) {}
        }
      }
      recomputeAndNotify();
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, `${FIRESTORE_META_COL}/${FIRESTORE_META_DOC}`);
      } catch (_) {}
    }
  );

  const unsubProducts = onSnapshot(
    collection(db, FIRESTORE_PRODUCTS_COL),
    (colSnap) => {
      hasLoadedProducts = true;
      const nextMap = new Map<string, Product>();
      colSnap.forEach((docSnap) => {
        const p = docSnap.data() as Product;
        if (p && p.id) {
          nextMap.set(p.id, p);
        }
      });
      latestFsProducts = nextMap;
      recomputeAndNotify();
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, FIRESTORE_PRODUCTS_COL);
      } catch (_) {}
    }
  );

  return () => {
    unsubMeta();
    unsubProducts();
  };
}

// Optimize / compress images in browser before upload to prevent quota issues
export async function optimizeImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
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
        // Export as JPEG with 0.82 quality (crisp luxury look, fits well within Firestore 1MB limit)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
