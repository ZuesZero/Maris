import React, { CSSProperties } from 'react';
import { ImageFrameSettings, Product } from '../types';

export const DEFAULT_IMAGE_FRAME_SETTINGS: ImageFrameSettings = {
  fit: 'cover',
  positionY: 0,
  positionX: 50,
  zoom: 100,
  padding: 0,
  backgroundColor: '#F4F0EA'
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
  } catch (e) {
    console.error('Failed to parse image frame settings', e);
  }
  return null;
}

export function saveStoredImageSettings(productId: string, settings: ImageFrameSettings, isGlobal = false) {
  try {
    const raw = localStorage.getItem('maris_image_frame_settings') || localStorage.getItem('ales_image_frame_settings');
    const parsed = raw ? JSON.parse(raw) : {};
    if (isGlobal) {
      parsed['__global__'] = settings;
    } else {
      parsed[productId] = settings;
    }
    localStorage.setItem('maris_image_frame_settings', JSON.stringify(parsed));
    localStorage.setItem('ales_image_frame_settings', JSON.stringify(parsed));

    // Async sync to server API
    fetch('/api/image-frame-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, settings, isGlobal, allSettings: parsed })
    }).catch(err => console.warn('Could not sync frame settings to server', err));
  } catch (e) {
    console.error('Failed to save image frame settings', e);
  }
}

export async function fetchServerImageSettings(): Promise<Record<string, ImageFrameSettings>> {
  try {
    const res = await fetch('/api/image-frame-settings');
    if (res.ok) {
      const serverSettings = await res.json();
      if (serverSettings && typeof serverSettings === 'object') {
        const localRaw = localStorage.getItem('maris_image_frame_settings') || localStorage.getItem('ales_image_frame_settings');
        const localParsed = localRaw ? JSON.parse(localRaw) : {};
        const merged = { ...localParsed, ...serverSettings };
        localStorage.setItem('maris_image_frame_settings', JSON.stringify(merged));
        localStorage.setItem('ales_image_frame_settings', JSON.stringify(merged));
        return merged;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch image settings from server', e);
  }
  return {};
}

export function getImageFrameStyles(product?: Product, customSettings?: ImageFrameSettings) {
  const settings = customSettings || product?.imageFrameSettings || (product ? getStoredImageSettings(product.id) : null) || DEFAULT_IMAGE_FRAME_SETTINGS;

  return {
    containerStyle: {
      backgroundColor: settings.backgroundColor || '#F4F0EA',
      padding: `${settings.padding}px`,
    } as React.CSSProperties,
    imageStyle: {
      objectFit: settings.fit || 'cover',
      objectPosition: `${settings.positionX}% ${settings.positionY}%`,
      transform: `scale(${settings.zoom / 100})`,
      transformOrigin: `${settings.positionX}% ${settings.positionY}%`,
    } as React.CSSProperties
  };
}
