import React, { CSSProperties } from 'react';
import { ImageFrameSettings, Product } from '../types';
import bundledData from '../data/bundledPersistedData.json';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, onSnapshot } from 'firebase/firestore';

const FIRESTORE_FRAMES_COL = 'image_frames';

function sanitizeFrameDocId(id: string): string {
  return String(id || 'default')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 128);
}

export const DEFAULT_IMAGE_FRAME_SETTINGS: ImageFrameSettings = {
  fit: 'cover',
  positionY: 0,
  positionX: 50,
  zoom: 100,
  padding: 0,
  backgroundColor: '#F4F0EA',
  rotation: 0,
  mirrorX: false,
  mirrorY: false,
  cropTop: 0,
  cropRight: 0,
  cropBottom: 0,
  cropLeft: 0
};

export const HAT_CENTERED_PRESET: ImageFrameSettings = {
  fit: 'contain',
  positionY: 50,
  positionX: 50,
  zoom: 95,
  padding: 12,
  backgroundColor: '#F4F0EA'
};

export const LUXURY_FULL_BLEED_PRESET: ImageFrameSettings = {
  fit: 'cover',
  positionY: 0,
  positionX: 50,
  zoom: 100,
  padding: 0,
  backgroundColor: '#F4F0EA'
};

export function getStoredImageSettings(productId: string): ImageFrameSettings | null {
  try {
    const raw = localStorage.getItem('maris_image_frame_settings') || localStorage.getItem('ales_image_frame_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed[productId]) return parsed[productId];
      if (parsed['__global__']) return parsed['__global__'];
    }
    const bundledFrames = (bundledData as any)?.frameSettings;
    if (bundledFrames && typeof bundledFrames === 'object') {
      if (bundledFrames[productId]) return bundledFrames[productId];
      if (bundledFrames['__global__']) return bundledFrames['__global__'];
    }
  } catch (e) {
    console.error('Failed to parse image frame settings', e);
  }
  return null;
}

export function saveStoredImageSettings(productId: string, settings: ImageFrameSettings, isGlobal = false) {
  try {
    const raw = localStorage.getItem('maris_image_frame_settings') || localStorage.getItem('ales_image_frame_settings');
    const parsed = raw ? JSON.parse(raw) : {};
    const targetKey = isGlobal ? '__global__' : productId;
    parsed[targetKey] = settings;
    localStorage.setItem('maris_image_frame_settings', JSON.stringify(parsed));
    localStorage.setItem('ales_image_frame_settings', JSON.stringify(parsed));

    // Async sync to server API
    fetch('/api/image-frame-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, settings, isGlobal, allSettings: parsed })
    }).catch(err => console.warn('Could not sync frame settings to server', err));

    // Async sync to Firebase Firestore for live cross-device sync on Vercel & mobile
    const safeId = sanitizeFrameDocId(targetKey);
    const cleanSettings: ImageFrameSettings = {
      fit: (settings.fit || 'cover') as ImageFrameSettings['fit'],
      positionX: Number(settings.positionX) || 0,
      positionY: Number(settings.positionY) || 0,
      zoom: Number(settings.zoom) || 100,
      padding: Number(settings.padding) || 0,
      backgroundColor: String(settings.backgroundColor || '#F4F0EA').slice(0, 32),
      rotation: Number(settings.rotation) || 0,
      mirrorX: Boolean(settings.mirrorX),
      mirrorY: Boolean(settings.mirrorY),
      cropTop: Number(settings.cropTop) || 0,
      cropRight: Number(settings.cropRight) || 0,
      cropBottom: Number(settings.cropBottom) || 0,
      cropLeft: Number(settings.cropLeft) || 0
    };
    setDoc(doc(db, FIRESTORE_FRAMES_COL, safeId), cleanSettings).catch(error => {
      try {
        handleFirestoreError(error, OperationType.WRITE, `${FIRESTORE_FRAMES_COL}/${safeId}`);
      } catch (_) {}
    });
  } catch (e) {
    console.error('Failed to save image frame settings', e);
  }
}

export async function fetchServerImageSettings(): Promise<Record<string, ImageFrameSettings>> {
  const localRaw = localStorage.getItem('maris_image_frame_settings') || localStorage.getItem('ales_image_frame_settings');
  const localParsed = localRaw ? JSON.parse(localRaw) : {};
  const bundledFrames = (bundledData as any)?.frameSettings || {};
  let merged: Record<string, ImageFrameSettings> = { ...bundledFrames, ...localParsed };

  try {
    const res = await fetch('/api/image-frame-settings');
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const serverSettings = await res.json();
        if (serverSettings && typeof serverSettings === 'object') {
          merged = { ...merged, ...serverSettings };
        }
      }
    }
  } catch (e) {
    console.warn('Failed to fetch image settings from server', e);
  }

  try {
    const snap = await getDocs(collection(db, FIRESTORE_FRAMES_COL));
    const fsSettings: Record<string, ImageFrameSettings> = {};
    snap.forEach((docSnap) => {
      const data = docSnap.data() as ImageFrameSettings;
      if (data && typeof data.fit === 'string') {
        fsSettings[docSnap.id] = data;
      }
    });
    merged = { ...merged, ...fsSettings };
  } catch (e) {
    console.warn('Firestore image frame fetch skipped:', e);
  }

  try {
    localStorage.setItem('maris_image_frame_settings', JSON.stringify(merged));
    localStorage.setItem('ales_image_frame_settings', JSON.stringify(merged));
  } catch (_) {}

  return merged;
}

export function subscribeToRealtimeImageFrames(onUpdate?: () => void): () => void {
  return onSnapshot(
    collection(db, FIRESTORE_FRAMES_COL),
    (colSnap) => {
      try {
        const localRaw = localStorage.getItem('maris_image_frame_settings') || localStorage.getItem('ales_image_frame_settings');
        const localParsed = localRaw ? JSON.parse(localRaw) : {};
        const bundledFrames = (bundledData as any)?.frameSettings || {};
        const fsSettings: Record<string, ImageFrameSettings> = {};
        colSnap.forEach((docSnap) => {
          const data = docSnap.data() as ImageFrameSettings;
          if (data && typeof data.fit === 'string') {
            fsSettings[docSnap.id] = data;
          }
        });
        const merged = { ...bundledFrames, ...localParsed, ...fsSettings };
        localStorage.setItem('maris_image_frame_settings', JSON.stringify(merged));
        localStorage.setItem('ales_image_frame_settings', JSON.stringify(merged));
        if (onUpdate) onUpdate();
      } catch (_) {}
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, FIRESTORE_FRAMES_COL);
      } catch (_) {}
    }
  );
}

export function getImageFrameStyles(product?: Product, customSettings?: ImageFrameSettings) {
  const settings = customSettings || product?.imageFrameSettings || (product ? getStoredImageSettings(product.id) : null) || DEFAULT_IMAGE_FRAME_SETTINGS;

  const zoomScale = (settings.zoom ?? 100) / 100;
  const rotationDeg = settings.rotation ?? 0;
  const flipX = settings.mirrorX ? -1 : 1;
  const flipY = settings.mirrorY ? -1 : 1;

  const cropT = Math.max(0, Math.min(45, settings.cropTop ?? 0));
  const cropR = Math.max(0, Math.min(45, settings.cropRight ?? 0));
  const cropB = Math.max(0, Math.min(45, settings.cropBottom ?? 0));
  const cropL = Math.max(0, Math.min(45, settings.cropLeft ?? 0));
  const hasCrop = cropT > 0 || cropR > 0 || cropB > 0 || cropL > 0;

  // Build transform string combining zoom, rotation, and mirror flips
  const transforms: string[] = [`scale(${zoomScale})`];
  if (rotationDeg !== 0) {
    transforms.push(`rotate(${rotationDeg}deg)`);
  }
  if (flipX !== 1 || flipY !== 1) {
    transforms.push(`scale(${flipX}, ${flipY})`);
  }

  // If rotation or mirror or crop is applied, center transform origin so turning 90/180/270/360 or mirroring stays inside the frame
  const useCenterOrigin = rotationDeg !== 0 || flipX !== 1 || flipY !== 1;

  return {
    containerStyle: {
      backgroundColor: settings.backgroundColor || '#F4F0EA',
      padding: `${settings.padding ?? 0}px`,
    } as React.CSSProperties,
    imageStyle: {
      objectFit: settings.fit || 'cover',
      objectPosition: `${settings.positionX ?? 50}% ${settings.positionY ?? 0}%`,
      transform: transforms.join(' '),
      transformOrigin: useCenterOrigin ? '50% 50%' : `${settings.positionX ?? 50}% ${settings.positionY ?? 0}%`,
      clipPath: hasCrop ? `inset(${cropT}% ${cropR}% ${cropB}% ${cropL}%)` : undefined,
    } as React.CSSProperties
  };
}
