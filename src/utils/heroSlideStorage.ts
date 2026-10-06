import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

export interface HeroSlideItem {
  id: string;
  image: string;
  kicker: string;
  kickerEs?: string;
  badge: string;
  badgeEs?: string;
  title: string;
  titleEs?: string;
  subtitle: string;
  subtitleEs?: string;
  order: number;
  updatedAt: string;
}

const STORAGE_KEY = 'maris_hero_rotation_slides';
const DELETED_SLIDES_KEY = 'maris_deleted_hero_slide_ids';
const FIRESTORE_HERO_COL = 'hero_slides';

export const DEFAULT_HERO_SLIDES: HeroSlideItem[] = [
  {
    id: 'fashion-slide-1',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=85&w=1800',
    kicker: 'Central Atelier',
    kickerEs: 'Atelier Central',
    badge: 'ATELIER_AW26',
    badgeEs: 'COLECCIÓN_AW26',
    title: 'Avant-Garde\nTailoring',
    titleEs: 'Sastrería de\nVanguardia',
    subtitle: 'Artisanal Italian cashmere tailoring and strategic seasonal wardrobe curation 24/7',
    subtitleEs: 'Confección artesanal en cachemira italiana y despliegue de alta costura 24/7',
    order: 0,
    updatedAt: '2026-10-05T00:00:00.000Z'
  },
  {
    id: 'fashion-slide-2',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=85&w=1800',
    kicker: 'Fashion House',
    kickerEs: 'Casa de Moda',
    badge: 'HAUTE_COUTURE',
    badgeEs: 'ALTA_COSTURA',
    title: 'Contemporary\nSilhouette',
    titleEs: 'Silueta\nContemporánea',
    subtitle: 'Architectural cuts, noble European textiles, and timeless luxury garments for every occasion',
    subtitleEs: 'Cortes arquitectónicos, tejidos nobles europeos y prendas de lujo atemporal',
    order: 1,
    updatedAt: '2026-10-05T00:00:00.000Z'
  },
  {
    id: 'fashion-slide-3',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=85&w=1800',
    kicker: 'Silk & Linen Archive',
    kickerEs: 'Archivo Textil',
    badge: 'SILK_ARCHIVE',
    badgeEs: 'ARCHIVO_SEDA',
    title: 'Quiet Luxury\nEssentials',
    titleEs: 'Esenciales de\nLujo Silencioso',
    subtitle: 'Hand-finished garments, organic silk shirts, and bespoke styling excellence',
    subtitleEs: 'Prendas terminadas a mano, camisería en seda orgánica y estilismo privado',
    order: 2,
    updatedAt: '2026-10-05T00:00:00.000Z'
  },
  {
    id: 'fashion-slide-4',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=85&w=1800',
    kicker: 'Private Showroom',
    kickerEs: 'Showroom Privado',
    badge: 'RUNWAY_EDITION',
    badgeEs: 'EDICIÓN_PASARELA',
    title: 'Bespoke Runway\nCollection',
    titleEs: 'Colección Privada\nde Pasarela',
    subtitle: 'Exclusive limited-edition fashion pieces and signature leather accessories',
    subtitleEs: 'Piezas de moda de edición limitada y accesorios de piel de autor',
    order: 3,
    updatedAt: '2026-10-05T00:00:00.000Z'
  }
];

function sanitizeSlideId(id: string): string {
  return String(id || 'slide')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 128);
}

function getDeletedSlideIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_SLIDES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (_) {}
  return new Set();
}

export function getStoredHeroSlidesSync(): HeroSlideItem[] {
  const deleted = getDeletedSlideIds();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filtered = parsed.filter((s: HeroSlideItem) => s && s.id && !deleted.has(s.id));
        if (filtered.length > 0) {
          return filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }
      }
    }
  } catch (_) {}
  const defaults = DEFAULT_HERO_SLIDES.filter((s) => !deleted.has(s.id));
  return defaults.length > 0 ? defaults : DEFAULT_HERO_SLIDES;
}

export function saveHeroSlidesLocal(slides: HeroSlideItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
  } catch (e) {
    console.warn('Could not save hero slides to localStorage:', e);
  }
}

export async function saveHeroSlideToFirestore(slide: HeroSlideItem): Promise<void> {
  const safeId = sanitizeSlideId(slide.id);
  const cleanSlide: HeroSlideItem = {
    id: safeId,
    image: String(slide.image || ''),
    kicker: String(slide.kicker || 'Central Atelier').slice(0, 120),
    kickerEs: String(slide.kickerEs || slide.kicker || 'Atelier Central').slice(0, 120),
    badge: String(slide.badge || 'ATELIER_AW26').slice(0, 80),
    badgeEs: String(slide.badgeEs || slide.badge || 'COLECCIÓN_AW26').slice(0, 80),
    title: String(slide.title || 'Avant-Garde Tailoring').slice(0, 200),
    titleEs: String(slide.titleEs || slide.title || 'Sastrería de Vanguardia').slice(0, 200),
    subtitle: String(slide.subtitle || '').slice(0, 500),
    subtitleEs: String(slide.subtitleEs || slide.subtitle || '').slice(0, 500),
    order: Number(slide.order) || 0,
    updatedAt: new Date().toISOString()
  };

  try {
    const deleted = getDeletedSlideIds();
    if (deleted.has(safeId)) {
      deleted.delete(safeId);
      localStorage.setItem(DELETED_SLIDES_KEY, JSON.stringify(Array.from(deleted)));
    }
  } catch (_) {}

  try {
    await setDoc(doc(db, FIRESTORE_HERO_COL, safeId), cleanSlide);
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.WRITE, `${FIRESTORE_HERO_COL}/${safeId}`);
    } catch (_) {}
  }
}

export async function deleteHeroSlideFromFirestore(slideId: string): Promise<void> {
  const safeId = sanitizeSlideId(slideId);
  try {
    const deleted = getDeletedSlideIds();
    deleted.add(safeId);
    localStorage.setItem(DELETED_SLIDES_KEY, JSON.stringify(Array.from(deleted)));
  } catch (_) {}

  try {
    await deleteDoc(doc(db, FIRESTORE_HERO_COL, safeId));
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.DELETE, `${FIRESTORE_HERO_COL}/${safeId}`);
    } catch (_) {}
  }
}

export function subscribeToHeroSlides(
  onUpdate: (slides: HeroSlideItem[]) => void
): () => void {
  return onSnapshot(
    collection(db, FIRESTORE_HERO_COL),
    (colSnap) => {
      const deleted = getDeletedSlideIds();
      const fsSlides = new Map<string, HeroSlideItem>();
      colSnap.forEach((docSnap) => {
        const data = docSnap.data() as HeroSlideItem;
        if (data && data.id && data.image && !deleted.has(data.id)) {
          fsSlides.set(data.id, data);
        }
      });

      // Merge default slides with Firestore overrides and custom added slides
      const mergedMap = new Map<string, HeroSlideItem>();
      DEFAULT_HERO_SLIDES.forEach((defSlide) => {
        if (!deleted.has(defSlide.id)) {
          mergedMap.set(defSlide.id, defSlide);
        }
      });

      fsSlides.forEach((slide, id) => {
        if (!deleted.has(id)) {
          mergedMap.set(id, slide);
        }
      });

      const finalSlides = Array.from(mergedMap.values()).sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );

      if (finalSlides.length > 0) {
        saveHeroSlidesLocal(finalSlides);
        onUpdate(finalSlides);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, FIRESTORE_HERO_COL);
      } catch (_) {}
    }
  );
}
