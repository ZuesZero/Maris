import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Check,
  Image as ImageIcon,
  Sparkles,
  Tag,
  DollarSign,
  Layers,
  Pencil,
  Sliders,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Scissors,
  Crop,
  Maximize2,
  Minimize2,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Product, Category, Size, ImageFrameSettings } from '../types';
import { Language } from '../data/translations';
import { getCategoryDisplayName } from '../utils/productTranslations';
import { convertUSDToCurrency, convertCurrencyToUSD } from '../utils/currency';
import { optimizeImageFile } from '../utils/productStorage';
import {
  DEFAULT_IMAGE_FRAME_SETTINGS,
  HAT_CENTERED_PRESET,
  LUXURY_FULL_BLEED_PRESET,
  getStoredImageSettings,
  saveStoredImageSettings,
  getImageFrameStyles
} from '../utils/imageFrame';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
  onAddMultipleProducts?: (products: Product[]) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  productToEdit?: Product | null;
  currency: string;
  language?: Language;
}

const CATEGORIES: Category[] = [
  'Outerwear',
  'Suits & Blazers',
  'Knitwear',
  'Trousers',
  'Shirts & Silk',
  'Shoes',
  'Accessories',
  'Miscellaneous'
];

const ALL_SIZES: Size[] = ['EU 46', 'EU 48', 'EU 50', 'EU 52', 'EU 54', 'One Size'];

const PRESET_COLORS = [
  { name: 'Oatmeal Melange', hex: '#D8CFB9' },
  { name: 'Midnight Obsidian', hex: '#1C1B20' },
  { name: 'Charcoal Tweed', hex: '#3E3D40' },
  { name: 'Warm Camel', hex: '#B88A58' },
  { name: 'Pristine Cream', hex: '#F7F5EE' },
  { name: 'Navy Cashmere', hex: '#1A2433' },
  { name: 'Sage Clay', hex: '#8C9083' },
  { name: 'Espresso Earth', hex: '#3B2F2F' },
  { name: 'Cognac Suede', hex: '#9E5B32' },
  { name: 'Bordeaux Wine', hex: '#4A1521' },
];

export function AddProductModal({ isOpen, onClose, onAddProduct, onAddMultipleProducts, onEditProduct, onDeleteProduct, productToEdit, currency, language = 'en' }: AddProductModalProps) {
  const isEs = language === 'es';

  // Batch Mode Toggle
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [batchTitles, setBatchTitles] = useState<Record<number, string>>({});
  const [createdBatchCount, setCreatedBatchCount] = useState<number>(1);

  // Form State
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<Category>('Outerwear');
  const [price, setPrice] = useState<number>(0);
  const [stockUnits, setStockUnits] = useState<number>(1);
  const [stockPerSize, setStockPerSize] = useState<Record<string, number>>({ 'EU 48': 1 });
  const [description, setDescription] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<Size[]>(['EU 48', 'EU 50', 'EU 52']);
  
  // Images (data URLs or URLs)
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Optional: Adjust Frame, Rotation, Mirror & Cut state
  const [showFrameStudio, setShowFrameStudio] = useState<boolean>(true);
  const [enableCustomFrame, setEnableCustomFrame] = useState<boolean>(true);
  const [frameSettings, setFrameSettings] = useState<ImageFrameSettings>(DEFAULT_IMAGE_FRAME_SETTINGS);
  const [activeStudioImgIdx, setActiveStudioImgIdx] = useState<number>(0);
  const [isInteractiveCutMode, setIsInteractiveCutMode] = useState<boolean>(false);
  const [isApplyingCut, setIsApplyingCut] = useState<boolean>(false);
  const [originalImagesBackup, setOriginalImagesBackup] = useState<Record<number, string>>({});
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [draggingHandle, setDraggingHandle] = useState<
    null | 'top' | 'bottom' | 'left' | 'right' | 'tl' | 'tr' | 'bl' | 'br'
  >(null);
  
  // Colors
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Oatmeal Melange', hex: '#DED3C4' },
    { name: 'Noir Black', hex: '#1C1B20' }
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#B88A58');

  // Fabric & Care
  const [fabricDetails, setFabricDetails] = useState<string>('');
  const [garmentCare, setGarmentCare] = useState<string>('');

  // Badges
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  // UI feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsConfirmingDelete(false);
      setBatchTitles({});
      if (productToEdit) {
        setIsBatchMode(false);
        setName(productToEdit.name || '');
        setSubtitle(productToEdit.subtitle || '');
        setCategory(productToEdit.category || 'Outerwear');
        setPrice(convertUSDToCurrency(productToEdit.price || 70, currency));
        setDescription(productToEdit.description || '');
        setSelectedSizes(productToEdit.sizes && productToEdit.sizes.length > 0 ? productToEdit.sizes : ['EU 48', 'EU 50']);
        setUploadedImages(productToEdit.images || []);
        setColors(productToEdit.colors || [{ name: 'Default', hex: '#1C1B20' }]);
        const rawFabric = productToEdit.fabricDetails ? productToEdit.fabricDetails.join('\n') : '';
        const rawCare = productToEdit.garmentCare ? productToEdit.garmentCare.join('\n') : '';
        const isLegacyDefaultFabric = rawFabric === '100% Loro Piana Italian Virgin Cashmere\n100% Bemberg Cupro Lining\nHand-finished Horn Buttons';
        const isLegacyDefaultCare = rawCare === 'Specialist dry clean only\nStore on contoured wooden coat hanger\nDo not wash or tumble dry';
        setFabricDetails(productToEdit.id?.startsWith('custom-') && isLegacyDefaultFabric ? '' : rawFabric);
        setGarmentCare(productToEdit.id?.startsWith('custom-') && isLegacyDefaultCare ? '' : rawCare);
        setIsNewArrival(!!productToEdit.isNewArrival);
        setIsBestseller(!!productToEdit.isBestseller);
        setIsFeatured(!!productToEdit.isFeatured);

        const initialStockMap = productToEdit.stock || {};
        const mapTotal = (Object.values(initialStockMap) as number[]).reduce((a, b) => a + b, 0);
        const initialStockTotal = productToEdit.stockQuantity !== undefined
          ? productToEdit.stockQuantity
          : (mapTotal > 0 ? mapTotal : 10);

        setStockUnits(initialStockTotal);
        setStockPerSize(initialStockMap);

        const existingFrame =
          productToEdit.imageFrameSettings ||
          getStoredImageSettings(productToEdit.id) ||
          DEFAULT_IMAGE_FRAME_SETTINGS;
        setFrameSettings({
          ...DEFAULT_IMAGE_FRAME_SETTINGS,
          ...existingFrame,
        });
        setEnableCustomFrame(true);
        setActiveStudioImgIdx(0);
        setOriginalImagesBackup({});
      } else {
        setName('');
        setSubtitle('');
        setCategory('Outerwear');
        setPrice(0);
        setDescription('');
        setSelectedSizes(['EU 48', 'EU 50', 'EU 52']);
        setUploadedImages([]);
        setColors([
          { name: 'Oatmeal Melange', hex: '#DED3C4' },
          { name: 'Noir Black', hex: '#1C1B20' }
        ]);
        setFabricDetails('');
        setGarmentCare('');
        setIsNewArrival(true);
        setIsBestseller(false);
        setIsFeatured(false);
        setStockUnits(1);
        setStockPerSize({ 'EU 48': 1 });
        setFrameSettings({ ...DEFAULT_IMAGE_FRAME_SETTINGS });
        setEnableCustomFrame(true);
        setActiveStudioImgIdx(0);
        setOriginalImagesBackup({});
      }
      setIsInteractiveCutMode(false);
      setErrorMsg('');
      setIsSuccess(false);
    }
  }, [isOpen, productToEdit, currency]);

  // Interactive Cut Box drag handler on live preview
  useEffect(() => {
    if (!draggingHandle) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!previewContainerRef.current) return;
      const rect = previewContainerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const relX = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const relY = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

      setFrameSettings((prev) => {
        let top = prev.cropTop ?? 0;
        let right = prev.cropRight ?? 0;
        let bottom = prev.cropBottom ?? 0;
        let left = prev.cropLeft ?? 0;

        if (draggingHandle === 'top' || draggingHandle === 'tl' || draggingHandle === 'tr') {
          top = Math.min(45, Math.max(0, Math.round(relY)));
        }
        if (draggingHandle === 'bottom' || draggingHandle === 'bl' || draggingHandle === 'br') {
          bottom = Math.min(45, Math.max(0, Math.round(100 - relY)));
        }
        if (draggingHandle === 'left' || draggingHandle === 'tl' || draggingHandle === 'bl') {
          left = Math.min(45, Math.max(0, Math.round(relX)));
        }
        if (draggingHandle === 'right' || draggingHandle === 'tr' || draggingHandle === 'br') {
          right = Math.min(45, Math.max(0, Math.round(100 - relX)));
        }

        return {
          ...prev,
          cropTop: top,
          cropRight: right,
          cropBottom: bottom,
          cropLeft: left
        };
      });
    };

    const handleMouseUp = () => {
      setDraggingHandle(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [draggingHandle]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleStockUnitsChange = (newTotal: number) => {
    setStockUnits(newTotal);
    if (selectedSizes.length > 0) {
      const perSize = Math.floor(newTotal / selectedSizes.length);
      const rem = newTotal % selectedSizes.length;
      const updatedMap: Record<string, number> = {};
      selectedSizes.forEach((sz, idx) => {
        updatedMap[sz] = perSize + (idx === 0 ? rem : 0);
      });
      setStockPerSize(updatedMap);
    }
  };

  const handleSizeStockChange = (sz: string, newQty: number) => {
    const updated = { ...stockPerSize, [sz]: newQty };
    setStockPerSize(updated);
    const newSum = (Object.values(updated) as number[]).reduce((a, b) => a + b, 0);
    setStockUnits(newSum);
  };

  if (!isOpen) return null;

  // File Upload Handler with Canvas Optimization
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || !file.type.startsWith('image/')) {
        setErrorMsg(isEs ? 'Por favor seleccione archivos de imagen válidos (JPG, PNG, WEBP).' : 'Please select valid image files (JPG, PNG, WEBP).');
        continue;
      }
      try {
        const optimizedUrl = await optimizeImageFile(file);
        setUploadedImages(prev => [...prev, optimizedUrl]);
      } catch (err) {
        console.error('Error optimizing image', err);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setUploadedImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
    setErrorMsg('');
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setUploadedImages(prev => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (activeStudioImgIdx >= next.length) {
        setActiveStudioImgIdx(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  const handleSetRotation = (deg: number) => {
    setEnableCustomFrame(true);
    setFrameSettings(prev => ({
      ...prev,
      rotation: deg === 360 ? 360 : deg
    }));
  };

  const handleStepRotation = () => {
    setEnableCustomFrame(true);
    setFrameSettings(prev => {
      const current = prev.rotation ?? 0;
      const next = current === 0 ? 90 : current === 90 ? 180 : current === 180 ? 270 : current === 270 ? 360 : 90;
      return { ...prev, rotation: next };
    });
  };

  const handleToggleMirrorX = () => {
    setEnableCustomFrame(true);
    setFrameSettings(prev => ({ ...prev, mirrorX: !prev.mirrorX }));
  };

  const handleToggleMirrorY = () => {
    setEnableCustomFrame(true);
    setFrameSettings(prev => ({ ...prev, mirrorY: !prev.mirrorY }));
  };

  const handleApplyCutToUploadedImage = async () => {
    const currentImageSrc = uploadedImages[activeStudioImgIdx];
    if (!currentImageSrc) return;

    setIsApplyingCut(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (err) => reject(err);
        img.src = currentImageSrc;
      });

      const naturalW = img.naturalWidth || img.width || 1000;
      const naturalH = img.naturalHeight || img.height || 1250;

      const cTop = Math.max(0, Math.min(45, frameSettings.cropTop ?? 0)) / 100;
      const cRight = Math.max(0, Math.min(45, frameSettings.cropRight ?? 0)) / 100;
      const cBottom = Math.max(0, Math.min(45, frameSettings.cropBottom ?? 0)) / 100;
      const cLeft = Math.max(0, Math.min(45, frameSettings.cropLeft ?? 0)) / 100;

      const sx = Math.round(naturalW * cLeft);
      const sy = Math.round(naturalH * cTop);
      const sw = Math.max(40, Math.round(naturalW * (1 - cLeft - cRight)));
      const sh = Math.max(40, Math.round(naturalH * (1 - cTop - cBottom)));

      const rot = (frameSettings.rotation ?? 0) % 360;
      const isSwapped = rot === 90 || rot === 270;

      const canvas = document.createElement('canvas');
      canvas.width = isSwapped ? sh : sw;
      canvas.height = isSwapped ? sw : sh;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      if (rot !== 0) {
        ctx.rotate((rot * Math.PI) / 180);
      }
      const scaleX = frameSettings.mirrorX ? -1 : 1;
      const scaleY = frameSettings.mirrorY ? -1 : 1;
      if (scaleX !== 1 || scaleY !== 1) {
        ctx.scale(scaleX, scaleY);
      }

      ctx.drawImage(img, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);
      ctx.restore();

      const newDataUrl = canvas.toDataURL('image/jpeg', 0.92);

      setOriginalImagesBackup(prev => ({
        ...prev,
        [activeStudioImgIdx]: prev[activeStudioImgIdx] || currentImageSrc
      }));

      setUploadedImages(prev => {
        const next = [...prev];
        next[activeStudioImgIdx] = newDataUrl;
        return next;
      });

      setFrameSettings(prev => ({
        ...prev,
        cropTop: 0,
        cropRight: 0,
        cropBottom: 0,
        cropLeft: 0,
        rotation: 0,
        mirrorX: false,
        mirrorY: false
      }));
      setIsInteractiveCutMode(false);
    } catch (err) {
      console.warn('Canvas cut fallback to non-destructive clip-path:', err);
      setIsInteractiveCutMode(false);
    } finally {
      setIsApplyingCut(false);
    }
  };

  const handleUndoImageCut = () => {
    const backup = originalImagesBackup[activeStudioImgIdx];
    if (!backup) return;
    setUploadedImages(prev => {
      const next = [...prev];
      next[activeStudioImgIdx] = backup;
      return next;
    });
    setOriginalImagesBackup(prev => {
      const copy = { ...prev };
      delete copy[activeStudioImgIdx];
      return copy;
    });
  };

  const handleToggleSize = (size: Size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleAddCustomColor = () => {
    if (!newColorName.trim()) return;
    setColors(prev => [...prev, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
  };

  const handleRemoveColor = (index: number) => {
    setColors(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(isEs ? 'Por favor ingrese un título de producto.' : 'Please enter a product title.');
      return;
    }
    if (uploadedImages.length === 0) {
      setErrorMsg(isEs ? 'Por favor cargue al menos una imagen o proporcione una URL de imagen.' : 'Please upload at least one image or provide an image URL.');
      return;
    }
    if (selectedSizes.length === 0) {
      setErrorMsg(isEs ? 'Por favor seleccione al menos un talle disponible.' : 'Please select at least one available size.');
      return;
    }

    // Convert input price from selected currency to base USD for storage
    const basePriceInUSD = convertCurrencyToUSD(Number(price) || 0, currency);

    const finalStockMap = selectedSizes.length > 0
      ? selectedSizes.reduce((acc, sz) => {
          acc[sz] = stockPerSize[sz] !== undefined ? stockPerSize[sz] : Math.floor(stockUnits / selectedSizes.length);
          return acc;
        }, {} as Record<string, number>)
      : { 'One Size': stockUnits };

    const actualTotalStock = (Object.values(finalStockMap) as number[]).reduce((a, b) => a + b, 0);
    const activeFrameSettings = enableCustomFrame ? frameSettings : undefined;

    if (productToEdit) {
      const updatedProduct: Product = {
        ...productToEdit,
        name: name.trim(),
        subtitle: subtitle.trim() || productToEdit.subtitle,
        price: basePriceInUSD !== undefined ? basePriceInUSD : productToEdit.price,
        category,
        colors: colors.length > 0 ? colors : productToEdit.colors,
        sizes: selectedSizes,
        images: uploadedImages,
        description: description.trim() || productToEdit.description,
        fabricDetails: fabricDetails.split('\n').filter(line => line.trim().length > 0),
        garmentCare: garmentCare.split('\n').filter(line => line.trim().length > 0),
        isNewArrival,
        isBestseller,
        isFeatured,
        stockQuantity: actualTotalStock,
        inStock: actualTotalStock > 0,
        stock: finalStockMap,
        ...(activeFrameSettings ? { imageFrameSettings: activeFrameSettings } : {})
      };

      if (activeFrameSettings) {
        saveStoredImageSettings(updatedProduct.id, activeFrameSettings, false);
      }

      if (onEditProduct) {
        onEditProduct(updatedProduct);
      } else {
        onAddProduct(updatedProduct);
      }
      setCreatedBatchCount(1);
    } else if (isBatchMode && uploadedImages.length > 0) {
      // MULTI-ITEM BATCH UPLOAD: Create 1 individual distinct product per image
      const createdList: Product[] = uploadedImages.map((imgUrl, idx) => {
        const customTitle = batchTitles[idx]?.trim();
        const fallbackTitle = uploadedImages.length > 1 ? `${name.trim()} #${idx + 1}` : name.trim();
        const finalTitle = customTitle || fallbackTitle;
        const newProductId = `custom-${Date.now()}-${idx}-${finalTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

        if (activeFrameSettings) {
          saveStoredImageSettings(newProductId, activeFrameSettings, false);
        }

        return {
          id: newProductId,
          name: finalTitle,
          subtitle: subtitle.trim() || (isEs ? 'Prenda Artesanal a Medida' : 'Handcrafted Bespoke Garment'),
          price: basePriceInUSD,
          category,
          colors: colors.length > 0 ? colors : [{ name: isEs ? 'Predeterminado' : 'Default', hex: '#1C1B20' }],
          sizes: selectedSizes,
          images: [imgUrl],
          description: description.trim() || (isEs ? 'Silueta arquitectónica diseñada con artesanía italiana tradicional y texturas de tacto suave.' : 'Architectural silhouette engineered with traditional Italian craftsmanship and soft touch textures.'),
          fabricDetails: fabricDetails.split('\n').filter(line => line.trim().length > 0),
          garmentCare: garmentCare.split('\n').filter(line => line.trim().length > 0),
          shippingInfo: isEs ? 'Envío exprés internacional de cortesía y empaque de regalo de lujo.' : 'Complimentary worldwide express shipping & luxury gift packaging.',
          isNewArrival,
          isBestseller,
          isFeatured,
          stockQuantity: actualTotalStock,
          inStock: actualTotalStock > 0,
          stock: finalStockMap,
          ...(activeFrameSettings ? { imageFrameSettings: activeFrameSettings } : {}),
          reviews: [
            {
              id: `rev-${Date.now()}-${idx}`,
              author: 'Mari Studio VIP',
              location: 'Milan, Italy',
              rating: 5,
              date: isEs ? 'Ahora mismo' : 'Just now',
              title: isEs ? 'Artesanía Exquisita' : 'Exquisite Craftsmanship',
              comment: isEs ? 'El peso de la tela y la precisión de la costura son incomparables.' : 'The weight of the cloth and precision of the stitching are unmatched.',
              verified: true
            }
          ],
          completeTheLookIds: []
        };
      });

      setCreatedBatchCount(createdList.length);

      if (onAddMultipleProducts) {
        onAddMultipleProducts(createdList);
      } else {
        createdList.forEach(prod => onAddProduct(prod));
      }
    } else {
      // SINGLE PRODUCT UPLOAD
      setCreatedBatchCount(1);
      const newProductId = `custom-${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      if (activeFrameSettings) {
        saveStoredImageSettings(newProductId, activeFrameSettings, false);
      }

      const newProduct: Product = {
        id: newProductId,
        name: name.trim(),
        subtitle: subtitle.trim() || (isEs ? 'Prenda Artesanal a Medida' : 'Handcrafted Bespoke Garment'),
        price: basePriceInUSD,
        category,
        colors: colors.length > 0 ? colors : [{ name: isEs ? 'Predeterminado' : 'Default', hex: '#1C1B20' }],
        sizes: selectedSizes,
        images: uploadedImages,
        description: description.trim() || (isEs ? 'Silueta arquitectónica diseñada con artesanía italiana tradicional y texturas de tacto suave.' : 'Architectural silhouette engineered with traditional Italian craftsmanship and soft touch textures.'),
        fabricDetails: fabricDetails.split('\n').filter(line => line.trim().length > 0),
        garmentCare: garmentCare.split('\n').filter(line => line.trim().length > 0),
        shippingInfo: isEs ? 'Envío exprés internacional de cortesía y empaque de regalo de lujo.' : 'Complimentary worldwide express shipping & luxury gift packaging.',
        isNewArrival,
        isBestseller,
        isFeatured,
        stockQuantity: actualTotalStock,
        inStock: actualTotalStock > 0,
        stock: finalStockMap,
        ...(activeFrameSettings ? { imageFrameSettings: activeFrameSettings } : {}),
        reviews: [
          {
            id: `rev-${Date.now()}`,
            author: 'Mari Studio VIP',
            location: 'Milan, Italy',
            rating: 5,
            date: isEs ? 'Ahora mismo' : 'Just now',
            title: isEs ? 'Artesanía Exquisita' : 'Exquisite Craftsmanship',
            comment: isEs ? 'El peso de la tela y la precisión de la costura son incomparables.' : 'The weight of the cloth and precision of the stitching are unmatched.',
            verified: true
          }
        ],
        completeTheLookIds: []
      };

      onAddProduct(newProduct);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1300);
  };

  const isEditing = Boolean(productToEdit);
  const currentPreviewImg = uploadedImages[activeStudioImgIdx] || uploadedImages[0] || '';
  const { containerStyle, imageStyle } = getImageFrameStyles(
    undefined,
    enableCustomFrame ? frameSettings : DEFAULT_IMAGE_FRAME_SETTINGS
  );
  const cropT = Math.max(0, Math.min(45, frameSettings.cropTop ?? 0));
  const cropR = Math.max(0, Math.min(45, frameSettings.cropRight ?? 0));
  const cropB = Math.max(0, Math.min(45, frameSettings.cropBottom ?? 0));
  const cropL = Math.max(0, Math.min(45, frameSettings.cropLeft ?? 0));
  const hasActiveCrop = cropT > 0 || cropR > 0 || cropB > 0 || cropL > 0;
  const activeRotation = frameSettings.rotation ?? 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-[#FAF8F5] text-[#1C1B20] w-full max-w-4xl rounded-md shadow-2xl overflow-hidden border border-[#E8E2D9] my-8 relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#1C1B20] text-[#FAF8F5] px-6 py-5 flex items-center justify-between border-b border-[#3E3C45]">
          <div className="flex items-center gap-2.5">
            {isEditing ? <Pencil className="w-5 h-5 text-[#B88A58]" /> : <Sparkles className="w-5 h-5 text-[#B88A58]" />}
            <div>
              <h2 className="text-base font-serif font-semibold tracking-wide">
                {isEditing
                  ? (isEs ? `Editar Pieza: ${productToEdit?.name}` : `Edit Piece: ${productToEdit?.name}`)
                  : isBatchMode
                  ? (isEs ? 'Carga Masiva de Múltiples Prendas' : 'Batch Multi-Item Upload')
                  : (isEs ? 'Cargar Nuevo Diseño / Pieza' : 'Upload New Design / Piece')}
              </h2>
              <p className="text-[11px] text-[#A8A49E]">
                {isEditing
                  ? (isEs ? 'Modifique detalles de la prenda, imágenes, precio o especificaciones' : 'Modify garment details, images, price or specifications')
                  : isBatchMode
                  ? (isEs ? 'Suba múltiples imágenes a la vez: cada imagen creará una prenda individual en la tienda' : 'Upload multiple images: each image will create an individual item in the store')
                  : (isEs ? 'Agregue una nueva prenda con fotos de alta resolución y detalles' : 'Add a new apparel item with high-res photo and details')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A8A49E] hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/10"
            aria-label={isEs ? "Cerrar modal" : "Close modal"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-[#B88A58]/20 text-[#B88A58] rounded-full flex items-center justify-center mx-auto animate-bounce">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1C1B20]">
                {isEditing
                  ? (isEs ? '¡Pieza Actualizada con Éxito!' : 'Piece Updated Successfully!')
                  : createdBatchCount > 1
                  ? (isEs ? `¡${createdBatchCount} Prendas Agregadas a la Colección!` : `¡${createdBatchCount} Pieces Added to Collection!`)
                  : (isEs ? '¡Pieza Agregada a la Colección!' : 'Piece Added to Collection!')}
              </h3>
              <p className="text-sm text-[#66635B]">
                {isEditing
                  ? (isEs ? 'Sus cambios se han guardado en la colección del atelier.' : 'Your changes have been saved to the atelier collection.')
                  : createdBatchCount > 1
                  ? (isEs ? `Las ${createdBatchCount} prendas se crearon individualmente y ya están disponibles en el catálogo.` : `All ${createdBatchCount} items were created individually and are now live in the catalog.`)
                  : (isEs ? 'Su nueva prenda ya está publicada y disponible en el catálogo.' : 'Your new garment is live and available in the catalog.')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                  {errorMsg}
                </div>
              )}

              {/* UPLOAD MODE SWITCHER (When creating new pieces) */}
              {!isEditing && (
                <div className="bg-[#EFEAE1]/70 border border-[#D8D1C5] p-3.5 rounded-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1C1B20] flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-[#B88A58]" />
                        {isEs ? 'Modo de Carga' : 'Upload Mode'}
                      </span>
                      <p className="text-[11px] text-[#66635B] mt-0.5">
                        {isBatchMode
                          ? (isEs
                              ? 'Carga múltiple: Cada imagen que selecciones creará una prenda individual en la tienda con la misma categoría, precio y stock.'
                              : 'Batch mode: Each selected image creates an individual item with shared category, price, and stock.')
                          : (isEs
                              ? 'Carga individual: Todas las fotos subidas pertenecerán a una sola prenda.'
                              : 'Single mode: All uploaded photos belong to one single garment.')}
                      </p>
                    </div>

                    <div className="flex items-center bg-[#E5DFD5] p-1 rounded-sm shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsBatchMode(false)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-all cursor-pointer ${
                          !isBatchMode
                            ? 'bg-[#1C1B20] text-white shadow-xs'
                            : 'text-[#55524B] hover:text-[#1C1B20]'
                        }`}
                      >
                        {isEs ? '1 Prenda (Vistas/Fotos)' : '1 Single Piece'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsBatchMode(true)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                          isBatchMode
                            ? 'bg-[#B88A58] text-[#1C1B20] shadow-xs'
                            : 'text-[#55524B] hover:text-[#1C1B20]'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        {isEs ? 'Múltiples Prendas (1 por Foto)' : 'Batch Items (1 per photo)'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 1: IMAGE UPLOAD */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold tracking-wider uppercase text-[#1C1B20] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#B88A58]" />
                    <span>
                      {isBatchMode
                        ? (isEs ? `1. SELECCIONAR IMÁGENES (${uploadedImages.length} PRENDAS INDIVIDUALES) *` : `1. Select Images (${uploadedImages.length} Individual Items) *`)
                        : (isEs ? '1. UPLOAD PRODUCT IMAGE(S) *' : '1. Upload Product Image(s) *')}
                    </span>
                  </label>
                  {isBatchMode && uploadedImages.length > 0 && (
                    <span className="text-[11px] font-bold text-[#B88A58] bg-[#B88A58]/10 px-2 py-0.5 rounded-full">
                      {isEs ? `${uploadedImages.length} prendas a crear` : `${uploadedImages.length} items to create`}
                    </span>
                  )}
                </div>

                {/* Drag & Drop File Upload */}
                <div className="border border-dashed border-[#D1C9BD] hover:border-[#B88A58] transition-colors rounded-md py-4 px-4 text-center bg-[#F4F0EA]/60 cursor-pointer relative group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                    <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-[#B88A58] shadow-xs group-hover:scale-105 transition-transform">
                      <Upload className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-medium text-[#1C1B20] leading-tight">
                      <span className="font-bold text-[#B88A58]">
                        {isEs ? 'Haga clic para elegir varias imágenes' : 'Click to choose multiple images'}
                      </span>{' '}
                      {isEs ? 'o arrastre y suelte los archivos' : 'or drag & drop files'}
                    </p>
                    <p className="text-[10px] text-[#88847C] leading-none">
                      {isBatchMode
                        ? (isEs ? '💡 Puede seleccionar varias fotos a la vez con Ctrl o Shift' : '💡 You can select multiple files at once using Ctrl or Shift')
                        : (isEs ? 'Soporta PNG, JPG, WEBP, GIF (Se recomienda alta resolución)' : 'Supports PNG, JPG, WEBP, GIF (High resolution recommended)')}
                    </p>
                  </div>
                </div>

                {/* Fallback Image URL Input */}
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    placeholder={isEs ? "O pegue la URL de la imagen (ej. https://...)" : "Or paste image URL (e.g., https://...)"}
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-[#D1C9BD] bg-white rounded-sm focus:outline-none focus:border-[#B88A58]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-2 bg-[#1C1B20] text-white text-xs font-bold rounded-sm hover:bg-[#3B3A40] transition-colors"
                  >
                    {isEs ? 'Agregar URL' : 'Add URL'}
                  </button>
                </div>

                {/* Uploaded Images Preview Strip */}
                {uploadedImages.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <p className="text-[11px] font-medium text-[#66635B]">
                      {isBatchMode
                        ? (isEs ? `Prendas a Crear Individualmente (${uploadedImages.length}):` : `Items to be Created Individually (${uploadedImages.length}):`)
                        : (isEs ? `Imágenes Cargadas (${uploadedImages.length}):` : `Uploaded Images (${uploadedImages.length}):`)}
                    </p>
                    <div className={isBatchMode ? "grid grid-cols-2 sm:grid-cols-3 gap-3" : "grid grid-cols-4 sm:grid-cols-6 gap-3"}>
                      {uploadedImages.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActiveStudioImgIdx(idx)}
                          className={`bg-white p-2 border rounded-sm shadow-xs space-y-1.5 group relative cursor-pointer transition-all ${
                            activeStudioImgIdx === idx ? 'border-[#B88A58] ring-1 ring-[#B88A58]' : 'border-[#D1C9BD]'
                          }`}
                        >
                          <div
                            className="relative aspect-[4/5] rounded-xs overflow-hidden border border-[#E8E2D9]"
                            style={containerStyle}
                          >
                            <img
                              src={img}
                              alt={`Upload ${idx}`}
                              className="w-full h-full transition-all duration-200"
                              style={imageStyle}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(idx);
                              }}
                              className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-80 hover:opacity-100 hover:bg-red-600 transition-colors"
                              title={isEs ? "Eliminar imagen" : "Remove image"}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <span className="absolute bottom-1 left-1 bg-black/75 text-[9px] text-white px-1.5 py-0.5 rounded-xs font-mono">
                              #{idx + 1}
                            </span>
                          </div>

                          {isBatchMode && (
                            <div>
                              <label className="block text-[9px] font-bold text-[#88847C] uppercase truncate">
                                {isEs ? `Nombre prenda #${idx + 1}` : `Piece #${idx + 1} Title`}
                              </label>
                              <input
                                type="text"
                                placeholder={name.trim() ? `${name.trim()} #${idx + 1}` : `Prenda #${idx + 1}`}
                                value={batchTitles[idx] || ''}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setBatchTitles(prev => ({ ...prev, [idx]: e.target.value }))}
                                className="w-full text-[11px] px-1.5 py-1 border border-[#D1C9BD] bg-[#FAF8F5] rounded-xs focus:outline-none focus:border-[#B88A58] focus:bg-white"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* OPTIONAL: ADJUST FRAME, ROTATION, MIRROR & CUT */}
                <div className="mt-3 border border-[#D8D1C5] rounded-md bg-[#F4F0EA]/80 overflow-hidden">
                  {/* Top Toggle Bar */}
                  <div className="px-3.5 py-2.5 bg-[#1C1B20] text-[#FAF8F5] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#B88A58]" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        {isEs
                          ? 'Ajustar Marco, Rotación, Espejo y Recorte'
                          : 'Adjust Frame, Rotation, Mirror & Cut'}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#B88A58]/25 text-[#E5C158] border border-[#B88A58]/40">
                        {isEs ? 'Opcional' : 'Optional'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-[10px] text-[#D8D1C5] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={enableCustomFrame}
                          onChange={(e) => setEnableCustomFrame(e.target.checked)}
                          className="rounded text-[#B88A58] focus:ring-[#B88A58] w-3.5 h-3.5"
                        />
                        <span>{isEs ? 'Aplicar al publicar' : 'Apply on publish'}</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowFrameStudio(prev => !prev)}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[10px] font-bold uppercase tracking-wider rounded-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {showFrameStudio ? (
                          <>
                            <span>{isEs ? 'Ocultar' : 'Hide'}</span>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>{isEs ? 'Mostrar Opciones' : 'Show Options'}</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Single-Shot Studio Body */}
                  {showFrameStudio && (
                    <div className="p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                      {/* Left Column: Live Preview & Quick Presets */}
                      <div className="md:col-span-4 flex flex-col items-center bg-white border border-[#E2DCD3] rounded-sm p-2.5">
                        <div className="w-full flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#706B63]">
                            {isEs ? 'Vista Previa en Vivo' : 'Live Frame Preview'}
                          </span>
                          {uploadedImages.length > 1 && (
                            <span className="text-[9px] font-mono text-[#B88A58] font-bold">
                              #{activeStudioImgIdx + 1} / {uploadedImages.length}
                            </span>
                          )}
                        </div>

                        <div
                          ref={previewContainerRef}
                          className="w-full max-w-[185px] aspect-[4/5] rounded-xs overflow-hidden border border-[#D8D1C5] relative select-none flex items-center justify-center"
                          style={containerStyle}
                        >
                          {currentPreviewImg ? (
                            <>
                              <img
                                src={currentPreviewImg}
                                alt="Live Frame Preview"
                                className="w-full h-full transition-all duration-150 pointer-events-none"
                                style={{
                                  ...imageStyle,
                                  clipPath: isInteractiveCutMode ? undefined : imageStyle.clipPath,
                                }}
                              />

                              {/* Interactive Cut Overlay */}
                              {isInteractiveCutMode && (
                                <div className="absolute inset-0 z-20">
                                  <div
                                    className="absolute top-0 left-0 right-0 bg-black/55 pointer-events-none"
                                    style={{ height: `${cropT}%` }}
                                  />
                                  <div
                                    className="absolute bottom-0 left-0 right-0 bg-black/55 pointer-events-none"
                                    style={{ height: `${cropB}%` }}
                                  />
                                  <div
                                    className="absolute left-0 bg-black/55 pointer-events-none"
                                    style={{ top: `${cropT}%`, bottom: `${cropB}%`, width: `${cropL}%` }}
                                  />
                                  <div
                                    className="absolute right-0 bg-black/55 pointer-events-none"
                                    style={{ top: `${cropT}%`, bottom: `${cropB}%`, width: `${cropR}%` }}
                                  />

                                  <div
                                    className="absolute border-2 border-[#E5C158] shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
                                    style={{
                                      top: `${cropT}%`,
                                      right: `${cropR}%`,
                                      bottom: `${cropB}%`,
                                      left: `${cropL}%`,
                                    }}
                                  >
                                    <div
                                      onMouseDown={() => setDraggingHandle('top')}
                                      onTouchStart={() => setDraggingHandle('top')}
                                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3.5 bg-[#1C1B20] border border-[#E5C158] rounded-full cursor-ns-resize"
                                    />
                                    <div
                                      onMouseDown={() => setDraggingHandle('bottom')}
                                      onTouchStart={() => setDraggingHandle('bottom')}
                                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-3.5 bg-[#1C1B20] border border-[#E5C158] rounded-full cursor-ns-resize"
                                    />
                                    <div
                                      onMouseDown={() => setDraggingHandle('left')}
                                      onTouchStart={() => setDraggingHandle('left')}
                                      className="absolute top-1/2 -left-2 -translate-y-1/2 w-3.5 h-8 bg-[#1C1B20] border border-[#E5C158] rounded-full cursor-ew-resize"
                                    />
                                    <div
                                      onMouseDown={() => setDraggingHandle('right')}
                                      onTouchStart={() => setDraggingHandle('right')}
                                      className="absolute top-1/2 -right-2 -translate-y-1/2 w-3.5 h-8 bg-[#1C1B20] border border-[#E5C158] rounded-full cursor-ew-resize"
                                    />
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-center p-3 space-y-1">
                              <ImageIcon className="w-6 h-6 text-[#B88A58]/70 mx-auto" />
                              <p className="text-[10px] font-medium text-[#66635B] leading-tight">
                                {isEs
                                  ? 'Suba una imagen arriba para previsualizar el ajuste en vivo'
                                  : 'Upload an image above to preview adjustments live'}
                              </p>
                            </div>
                          )}

                          {/* Status badges */}
                          <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1 z-30 pointer-events-none">
                            <span className="bg-black/75 text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-xs">
                              {frameSettings.fit} · {frameSettings.zoom}%
                            </span>
                            {activeRotation !== 0 && (
                              <span className="bg-[#B88A58] text-[#1C1B20] text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-xs">
                                {activeRotation}°
                              </span>
                            )}
                            {(frameSettings.mirrorX || frameSettings.mirrorY) && (
                              <span className="bg-[#1C1B20] text-[#E5C158] text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-xs">
                                {frameSettings.mirrorX && frameSettings.mirrorY
                                  ? 'Mirror H+V'
                                  : frameSettings.mirrorX
                                  ? 'Mirror H'
                                  : 'Mirror V'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="w-full mt-2 pt-2 border-t border-[#E8E2D9] grid grid-cols-2 gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEnableCustomFrame(true);
                              setFrameSettings(prev => ({ ...prev, ...HAT_CENTERED_PRESET }));
                            }}
                            className="px-2 py-1 text-[9px] font-bold uppercase bg-[#FAF8F5] hover:bg-[#1C1B20] hover:text-white border border-[#D8D1C5] rounded-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Minimize2 className="w-2.5 h-2.5 text-[#B88A58]" />
                            {isEs ? 'Accesorio' : 'Accessory'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEnableCustomFrame(true);
                              setFrameSettings(prev => ({ ...prev, ...LUXURY_FULL_BLEED_PRESET }));
                            }}
                            className="px-2 py-1 text-[9px] font-bold uppercase bg-[#FAF8F5] hover:bg-[#1C1B20] hover:text-white border border-[#D8D1C5] rounded-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Maximize2 className="w-2.5 h-2.5 text-[#B88A58]" />
                            {isEs ? 'Completo' : 'Full Bleed'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEnableCustomFrame(true);
                              setFrameSettings(prev => ({
                                ...prev,
                                fit: 'cover',
                                positionX: 50,
                                positionY: 20,
                                zoom: 115,
                                padding: 0
                              }));
                            }}
                            className="px-2 py-1 text-[9px] font-bold uppercase bg-[#FAF8F5] hover:bg-[#1C1B20] hover:text-white border border-[#D8D1C5] rounded-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {isEs ? 'Zoom 115%' : 'Zoom 115%'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFrameSettings({ ...DEFAULT_IMAGE_FRAME_SETTINGS });
                              setIsInteractiveCutMode(false);
                            }}
                            className="px-2 py-1 text-[9px] font-bold uppercase bg-[#FAF8F5] hover:bg-red-600 hover:text-white border border-[#D8D1C5] rounded-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            {isEs ? 'Restablecer' : 'Reset'}
                          </button>
                        </div>
                      </div>

                      {/* Right Column: Rotation, Mirror, Cut & Frame Controls in One Shot */}
                      <div className="md:col-span-8 space-y-2.5">
                        {/* Row 1: Rotation (90°, 180°, 270°, 360°) & Mirror (Horizontal, Vertical) */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className="sm:col-span-7 bg-white border border-[#E2DCD3] rounded-sm p-2.5">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1B20] flex items-center gap-1">
                                <RotateCw className="w-3 h-3 text-[#B88A58]" />
                                {isEs ? 'Rotación de Imagen' : 'Image Rotation'}
                              </span>
                              <button
                                type="button"
                                onClick={handleStepRotation}
                                className="px-1.5 py-0.5 bg-[#1C1B20] text-[#E5C158] rounded-xs text-[9px] font-bold uppercase hover:bg-black transition-colors cursor-pointer"
                              >
                                {isEs ? 'Girar +90°' : 'Turn +90°'}
                              </button>
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              {[90, 180, 270, 360].map((deg) => {
                                const isActive =
                                  deg === 360
                                    ? activeRotation === 360 || activeRotation === 0
                                    : activeRotation === deg;
                                return (
                                  <button
                                    key={deg}
                                    type="button"
                                    onClick={() => handleSetRotation(deg)}
                                    className={`py-1.5 px-1 rounded-xs text-[10px] font-bold border transition-all cursor-pointer ${
                                      isActive
                                        ? 'bg-[#1C1B20] text-[#E5C158] border-[#1C1B20]'
                                        : 'bg-[#FAF8F5] text-[#55524B] border-[#D8D1C5] hover:border-[#1C1B20]'
                                    }`}
                                  >
                                    {deg}°
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="sm:col-span-5 bg-white border border-[#E2DCD3] rounded-sm p-2.5">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1B20] flex items-center gap-1">
                                <FlipHorizontal className="w-3 h-3 text-[#B88A58]" />
                                {isEs ? 'Opción Espejo' : 'Mirror Option'}
                              </span>
                              {(frameSettings.mirrorX || frameSettings.mirrorY) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFrameSettings(prev => ({ ...prev, mirrorX: false, mirrorY: false }))
                                  }
                                  className="text-[9px] text-[#8C867E] hover:text-[#1C1B20] underline cursor-pointer"
                                >
                                  {isEs ? 'Normal' : 'Normal'}
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <button
                                type="button"
                                onClick={handleToggleMirrorX}
                                className={`py-1.5 px-1.5 rounded-xs text-[10px] font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                  frameSettings.mirrorX
                                    ? 'bg-[#1C1B20] text-[#E5C158] border-[#1C1B20]'
                                    : 'bg-[#FAF8F5] text-[#55524B] border-[#D8D1C5] hover:border-[#1C1B20]'
                                }`}
                              >
                                <FlipHorizontal className="w-3 h-3" />
                                <span>{isEs ? 'Horizontal' : 'Horizontal'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleToggleMirrorY}
                                className={`py-1.5 px-1.5 rounded-xs text-[10px] font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                  frameSettings.mirrorY
                                    ? 'bg-[#1C1B20] text-[#E5C158] border-[#1C1B20]'
                                    : 'bg-[#FAF8F5] text-[#55524B] border-[#D8D1C5] hover:border-[#1C1B20]'
                                }`}
                              >
                                <FlipVertical className="w-3 h-3" />
                                <span>{isEs ? 'Vertical' : 'Vertical'}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Row 2: Cut Image to Adjust */}
                        <div className="bg-white border border-[#E2DCD3] rounded-sm p-2.5 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1B20] flex items-center gap-1">
                              <Scissors className="w-3 h-3 text-[#B88A58]" />
                              {isEs ? 'Cortar Imagen para Ajustar' : 'Cut Image to Adjust'}
                            </span>

                            <div className="flex flex-wrap items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setIsInteractiveCutMode(prev => !prev)}
                                className={`px-2 py-0.5 rounded-xs text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 border cursor-pointer ${
                                  isInteractiveCutMode
                                    ? 'bg-[#E5C158] text-[#1C1B20] border-[#B88A58]'
                                    : 'bg-[#FAF8F5] text-[#1C1B20] border-[#D8D1C5] hover:bg-[#1C1B20] hover:text-white'
                                }`}
                              >
                                <Crop className="w-2.5 h-2.5" />
                                {isInteractiveCutMode
                                  ? (isEs ? 'Cerrando Caja' : 'Hide Cut Box')
                                  : (isEs ? 'Caja de Corte' : 'Cut Box')}
                              </button>

                              <button
                                type="button"
                                disabled={!currentPreviewImg || isApplyingCut}
                                onClick={handleApplyCutToUploadedImage}
                                className="px-2 py-0.5 rounded-xs text-[9px] font-bold uppercase tracking-wider bg-[#B88A58] text-[#1C1B20] hover:bg-[#c99b68] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
                              >
                                <Scissors className="w-2.5 h-2.5" />
                                {isApplyingCut
                                  ? (isEs ? 'Cortando...' : 'Cutting...')
                                  : (isEs ? 'Aplicar Corte' : 'Apply Cut')}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEnableCustomFrame(true);
                                  setFrameSettings(prev => ({
                                    ...prev,
                                    cropTop: 8,
                                    cropRight: 8,
                                    cropBottom: 8,
                                    cropLeft: 8
                                  }));
                                }}
                                className="px-1.5 py-0.5 text-[9px] font-semibold bg-[#FAF8F5] border border-[#D8D1C5] rounded-xs hover:border-[#1C1B20] cursor-pointer"
                              >
                                {isEs ? 'Bordes 8%' : 'Trim 8%'}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEnableCustomFrame(true);
                                  setFrameSettings(prev => ({
                                    ...prev,
                                    cropTop: 15,
                                    cropRight: 0,
                                    cropBottom: 15,
                                    cropLeft: 0
                                  }));
                                }}
                                className="px-1.5 py-0.5 text-[9px] font-semibold bg-[#FAF8F5] border border-[#D8D1C5] rounded-xs hover:border-[#1C1B20] cursor-pointer"
                              >
                                {isEs ? 'Cuadrado 15%' : 'Square 15%'}
                              </button>

                              {hasActiveCrop && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFrameSettings(prev => ({
                                      ...prev,
                                      cropTop: 0,
                                      cropRight: 0,
                                      cropBottom: 0,
                                      cropLeft: 0
                                    }))
                                  }
                                  className="px-1.5 py-0.5 text-[9px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xs hover:bg-red-100 cursor-pointer"
                                >
                                  {isEs ? 'Limpiar' : 'Clear'}
                                </button>
                              )}

                              {originalImagesBackup[activeStudioImgIdx] && (
                                <button
                                  type="button"
                                  onClick={handleUndoImageCut}
                                  className="px-1.5 py-0.5 text-[9px] font-bold text-[#1C1B20] bg-[#E5C158]/30 border border-[#B88A58] rounded-xs hover:bg-[#E5C158]/50 cursor-pointer"
                                >
                                  {isEs ? 'Deshacer Corte' : 'Undo Cut'}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                            <div>
                              <div className="flex justify-between text-[9px] font-semibold text-[#55524B]">
                                <span>{isEs ? 'Arriba' : 'Cut Top'}</span>
                                <span className="font-mono text-[#B88A58]">{cropT}%</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={45}
                                value={cropT}
                                onChange={(e) => {
                                  setEnableCustomFrame(true);
                                  setFrameSettings(prev => ({ ...prev, cropTop: Number(e.target.value) }));
                                }}
                                className="w-full accent-[#1C1B20] cursor-pointer h-1"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[9px] font-semibold text-[#55524B]">
                                <span>{isEs ? 'Abajo' : 'Cut Bottom'}</span>
                                <span className="font-mono text-[#B88A58]">{cropB}%</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={45}
                                value={cropB}
                                onChange={(e) => {
                                  setEnableCustomFrame(true);
                                  setFrameSettings(prev => ({ ...prev, cropBottom: Number(e.target.value) }));
                                }}
                                className="w-full accent-[#1C1B20] cursor-pointer h-1"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[9px] font-semibold text-[#55524B]">
                                <span>{isEs ? 'Izquierda' : 'Cut Left'}</span>
                                <span className="font-mono text-[#B88A58]">{cropL}%</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={45}
                                value={cropL}
                                onChange={(e) => {
                                  setEnableCustomFrame(true);
                                  setFrameSettings(prev => ({ ...prev, cropLeft: Number(e.target.value) }));
                                }}
                                className="w-full accent-[#1C1B20] cursor-pointer h-1"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[9px] font-semibold text-[#55524B]">
                                <span>{isEs ? 'Derecha' : 'Cut Right'}</span>
                                <span className="font-mono text-[#B88A58]">{cropR}%</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={45}
                                value={cropR}
                                onChange={(e) => {
                                  setEnableCustomFrame(true);
                                  setFrameSettings(prev => ({ ...prev, cropRight: Number(e.target.value) }));
                                }}
                                className="w-full accent-[#1C1B20] cursor-pointer h-1"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Row 3: Adjust Frame Fit, Zoom, Position X/Y, Padding & Canvas Color */}
                        <div className="bg-white border border-[#E2DCD3] rounded-sm p-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                          {/* Fit Mode */}
                          <div className="sm:col-span-4 space-y-1">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-[#1C1B20]">
                              {isEs ? 'Modo de Ajuste (Fit)' : 'Frame Fit Mode'}
                            </span>
                            <div className="grid grid-cols-2 gap-1">
                              {(['cover', 'contain', 'scale-down', 'fill'] as const).map((fitMode) => (
                                <button
                                  key={fitMode}
                                  type="button"
                                  onClick={() => {
                                    setEnableCustomFrame(true);
                                    setFrameSettings(prev => ({ ...prev, fit: fitMode }));
                                  }}
                                  className={`py-1 px-1.5 rounded-xs text-[9px] font-bold uppercase border transition-all cursor-pointer ${
                                    frameSettings.fit === fitMode
                                      ? 'bg-[#1C1B20] text-white border-[#1C1B20]'
                                      : 'bg-[#FAF8F5] text-[#55524B] border-[#D8D1C5] hover:border-[#1C1B20]'
                                  }`}
                                >
                                  {fitMode === 'cover'
                                    ? 'Cover'
                                    : fitMode === 'contain'
                                    ? 'Contain'
                                    : fitMode === 'scale-down'
                                    ? 'Scale'
                                    : 'Stretch'}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Zoom & Position Sliders */}
                          <div className="sm:col-span-5 grid grid-cols-2 gap-2">
                            <div>
                              <div className="flex justify-between text-[9px] font-semibold text-[#55524B]">
                                <span>Zoom</span>
                                <span className="font-mono text-[#B88A58]">{frameSettings.zoom}%</span>
                              </div>
                              <input
                                type="range"
                                min={50}
                                max={200}
                                value={frameSettings.zoom}
                                onChange={(e) => {
                                  setEnableCustomFrame(true);
                                  setFrameSettings(prev => ({ ...prev, zoom: Number(e.target.value) }));
                                }}
                                className="w-full accent-[#B88A58] cursor-pointer h-1"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[9px] font-semibold text-[#55524B]">
                                <span>{isEs ? 'Margen' : 'Padding'}</span>
                                <span className="font-mono text-[#B88A58]">{frameSettings.padding}px</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={40}
                                value={frameSettings.padding}
                                onChange={(e) => {
                                  setEnableCustomFrame(true);
                                  setFrameSettings(prev => ({ ...prev, padding: Number(e.target.value) }));
                                }}
                                className="w-full accent-[#B88A58] cursor-pointer h-1"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[9px] font-semibold text-[#55524B]">
                                <span>Pos X</span>
                                <span className="font-mono text-[#B88A58]">{frameSettings.positionX}%</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={frameSettings.positionX}
                                onChange={(e) => {
                                  setEnableCustomFrame(true);
                                  setFrameSettings(prev => ({ ...prev, positionX: Number(e.target.value) }));
                                }}
                                className="w-full accent-[#B88A58] cursor-pointer h-1"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[9px] font-semibold text-[#55524B]">
                                <span>Pos Y</span>
                                <span className="font-mono text-[#B88A58]">{frameSettings.positionY}%</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={frameSettings.positionY}
                                onChange={(e) => {
                                  setEnableCustomFrame(true);
                                  setFrameSettings(prev => ({ ...prev, positionY: Number(e.target.value) }));
                                }}
                                className="w-full accent-[#B88A58] cursor-pointer h-1"
                              />
                            </div>
                          </div>

                          {/* Canvas Color */}
                          <div className="sm:col-span-3 space-y-1">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-[#1C1B20]">
                              {isEs ? 'Fondo del Marco' : 'Canvas Color'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {['#F4F0EA', '#FFFFFF', '#EFECE6', '#1C1B20', '#E5DFD3'].map((hex) => (
                                <button
                                  key={hex}
                                  type="button"
                                  onClick={() => {
                                    setEnableCustomFrame(true);
                                    setFrameSettings(prev => ({ ...prev, backgroundColor: hex }));
                                  }}
                                  className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                                    frameSettings.backgroundColor === hex
                                      ? 'border-[#B88A58] scale-110 ring-2 ring-[#B88A58]/40'
                                      : 'border-black/20'
                                  }`}
                                  style={{ backgroundColor: hex }}
                                  title={hex}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: BASIC DETAILS */}
              <div className="space-y-4 pt-2 border-t border-[#E8E2D9]">
                <label className="block text-xs font-bold tracking-wider uppercase text-[#1C1B20] flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#B88A58]" />
                  <span>
                    {isBatchMode
                      ? (isEs ? '2. DETALLES COMUNES (CATEGORÍA, PRECIO Y STOCK)' : '2. Shared Details (Category, Price & Stock)')
                      : (isEs ? '2. IDENTIFICACIÓN DEL PRODUCTO Y PRECIO' : '2. Product Identification & Price')}
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#55524B] mb-1">
                      {isBatchMode
                        ? (isEs ? 'Nombre Base / Prefijo *' : 'Base Product Name / Prefix *')
                        : (isEs ? 'Título del Producto *' : 'Product Title *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isBatchMode ? (isEs ? "ej. Camisa de Lino Clásica" : "e.g. Classic Linen Shirt") : (isEs ? "ej. Blazer de Cashmere Cruzado" : "e.g. Double-Breasted Cashmere Blazer")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-[#D1C9BD] bg-white rounded-sm focus:outline-none focus:border-[#B88A58]"
                    />
                    {isBatchMode && (
                      <p className="text-[10px] text-[#88847C] mt-0.5">
                        {isEs ? 'Si no asignas nombre a cada foto, se nombrarán: [Nombre] #1, [Nombre] #2...' : 'If not named individually, items will be named: [Name] #1, [Name] #2...'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#55524B] mb-1">
                      {isEs ? 'Subtítulo / Lema del Material' : 'Subtitle / Material Tagline'}
                    </label>
                    <input
                      type="text"
                      placeholder={isEs ? "ej. Mezcla de Lana Italiana y Seda" : "e.g. Italian Wool & Silk Blend"}
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-[#D1C9BD] bg-white rounded-sm focus:outline-none focus:border-[#B88A58]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#55524B] mb-1">
                      {isEs ? 'Categoría *' : 'Category *'}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full text-xs px-3 py-2 border border-[#D1C9BD] bg-white rounded-sm focus:outline-none focus:border-[#B88A58]"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {getCategoryDisplayName(cat, language)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#55524B] mb-1">
                      {isEs ? `Precio (${currency} $) *` : `Price (${currency} $) *`}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-[#88847C]">$</span>
                      <input
                        type="number"
                        required
                        min={0}
                        step={1}
                        value={price}
                        onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full text-xs pl-7 pr-3 py-2 border border-[#D1C9BD] bg-white rounded-sm focus:outline-none focus:border-[#B88A58]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#55524B] mb-1">
                      {isEs ? 'Artículos en Stock (Tienda) *' : 'Items in Stock (Store) *'}
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1}
                      value={stockUnits}
                      onChange={(e) => handleStockUnitsChange(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-xs px-3 py-2 border border-[#B88A58] bg-[#FAF8F5] rounded-sm focus:outline-none focus:border-[#1C1B20] font-bold text-[#1C1B20]"
                    />
                    <p className="text-[10px] text-[#8C9083] mt-0.5">
                      {isBatchMode
                        ? (isEs ? 'Stock asignado a cada prenda individual' : 'Stock assigned to each individual item')
                        : (isEs ? 'Unidades restantes en la tienda' : 'Items left in the store')}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: SIZES & COLORS */}
              <div className="space-y-4 pt-2 border-t border-[#E8E2D9]">
                <label className="block text-xs font-bold tracking-wider uppercase text-[#1C1B20] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#B88A58]" />
                  <span>{isEs ? '3. TALLES, STOCK Y OPCIONES DE COLOR' : '3. Sizes, Stock & Color Options'}</span>
                </label>

                {/* Sizes Selector */}
                <div>
                  <p className="text-[11px] font-semibold text-[#55524B] mb-1.5">
                    {isEs ? 'Talles Disponibles *' : 'Available Sizes *'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SIZES.map(sz => {
                      const isSelected = selectedSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleToggleSize(sz)}
                          className={`text-xs px-3 py-1.5 rounded-sm font-medium border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#1C1B20] text-white border-[#1C1B20]'
                              : 'bg-white text-[#55524B] border-[#D1C9BD] hover:border-[#1C1B20]'
                          }`}
                        >
                          {sz} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Per-size stock breakdown input */}
                {selectedSizes.length > 0 && (
                  <div className="bg-[#F4F0EA] p-3 rounded-sm border border-[#E8E2D9] space-y-2">
                    <p className="text-[11px] font-bold text-[#1C1B20] uppercase tracking-wider">
                      {isEs ? 'Desglose de Stock por Talle (Ajustar Unidades Restantes)' : 'Stock Breakdown per Size (Adjust Items Left in Store)'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {selectedSizes.map((sz) => (
                        <div key={sz} className="flex items-center gap-1.5 bg-white p-2 border border-[#D1C9BD] rounded-sm shadow-xs">
                          <span className="text-[11px] font-mono font-semibold text-[#1C1B20] shrink-0">{sz}:</span>
                          <input
                            type="number"
                            min={0}
                            value={stockPerSize[sz] !== undefined ? stockPerSize[sz] : Math.floor(stockUnits / selectedSizes.length)}
                            onChange={(e) => handleSizeStockChange(sz, Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full text-xs px-1.5 py-1 bg-[#FAF8F5] border border-[#D1C9BD] rounded-xs font-mono text-center focus:outline-none focus:border-[#B88A58] font-bold text-[#1C1B20]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Variants */}
                <div>
                  <p className="text-[11px] font-semibold text-[#55524B] mb-1.5">
                    {isEs ? 'Variantes de Color' : 'Color Variants'}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {colors.map((c, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-white px-2.5 py-1 border border-[#D1C9BD] rounded-sm text-xs">
                        <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} />
                        <span className="font-medium text-[#1C1B20]">{c.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(idx)}
                          className="text-[#88847C] hover:text-red-600 ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Color row */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={isEs ? "Nombre del color (ej. Camel)" : "Color name (e.g. Camel)"}
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      className="text-xs px-2.5 py-1.5 border border-[#D1C9BD] bg-white rounded-sm focus:outline-none focus:border-[#B88A58] w-40"
                    />
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer"
                      title={isEs ? "Elegir color hex" : "Choose hex color"}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomColor}
                      className="px-2.5 py-1.5 bg-[#E8E2D9] text-[#1C1B20] hover:bg-[#1C1B20] hover:text-white text-xs font-bold rounded-sm transition-colors"
                    >
                      {isEs ? '+ Agregar Color' : '+ Add Color'}
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 4: DESCRIPTION & SPECS */}
              <div className="space-y-4 pt-2 border-t border-[#E8E2D9]">
                <label className="block text-xs font-bold tracking-wider uppercase text-[#1C1B20]">
                  {isEs ? '4. DESCRIPCIÓN, MATERIAL Y CUIDADOS' : '4. Description, Fabric & Care'}
                </label>

                <div>
                  <label className="block text-[11px] font-semibold text-[#55524B] mb-1">
                    {isEs ? 'Descripción del Producto' : 'Product Description'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={isEs ? "Describa la silueta, caída, forro y confección..." : "Describe the silhouette, drape, lining, and craftsmanship..."}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs p-3 border border-[#D1C9BD] bg-white rounded-sm focus:outline-none focus:border-[#B88A58]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#55524B] mb-1">
                      {isEs ? 'Especificaciones de Material (1 por línea)' : 'Fabric & Material Specs (1 per line)'}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={isEs ? "Ingrese las especificaciones del material (1 por línea)..." : "Enter fabric & material specifications (1 per line)..."}
                      value={fabricDetails}
                      onChange={(e) => setFabricDetails(e.target.value)}
                      className="w-full text-xs p-2.5 border border-[#D1C9BD] bg-white rounded-sm focus:outline-none focus:border-[#B88A58]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#55524B] mb-1">
                      {isEs ? 'Instrucciones de Cuidado (1 por línea)' : 'Garment Care Instructions (1 per line)'}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={isEs ? "Ingrese las instrucciones de cuidado (1 por línea)..." : "Enter garment care instructions (1 per line)..."}
                      value={garmentCare}
                      onChange={(e) => setGarmentCare(e.target.value)}
                      className="w-full text-xs p-2.5 border border-[#D1C9BD] bg-white rounded-sm focus:outline-none focus:border-[#B88A58]"
                    />
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-[#1C1B20] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNewArrival}
                      onChange={(e) => setIsNewArrival(e.target.checked)}
                      className="rounded text-[#B88A58] focus:ring-[#B88A58]"
                    />
                    {isEs ? 'Marcar como Lo Nuevo' : 'Mark as New Arrival'}
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-[#1C1B20] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBestseller}
                      onChange={(e) => setIsBestseller(e.target.checked)}
                      className="rounded text-[#B88A58] focus:ring-[#B88A58]"
                    />
                    {isEs ? 'Marcar como Tendencia' : 'Mark as Bestseller'}
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-[#1C1B20] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-[#B88A58] focus:ring-[#B88A58]"
                    />
                    {isEs ? 'Destacar en Sección Principal' : 'Feature in Hero Section'}
                  </label>
                </div>
              </div>

              {/* Submit & Action Button Bar */}
              <div className="pt-4 border-t border-[#E8E2D9] flex flex-wrap items-center justify-between gap-3">
                {/* Left Side: Delete Option (Only when editing an existing piece) */}
                <div>
                  {isEditing && productToEdit && onDeleteProduct && (
                    !isConfirmingDelete ? (
                      <button
                        type="button"
                        onClick={() => setIsConfirmingDelete(true)}
                        className="px-4 py-2.5 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 hover:border-red-600 text-xs font-bold uppercase tracking-wider rounded-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs group"
                        title={isEs ? 'Eliminar prenda permanentemente' : 'Delete item permanently'}
                      >
                        <Trash2 className="w-4 h-4 text-red-600 group-hover:text-white transition-colors" />
                        <span>{isEs ? 'Eliminar Prenda' : 'Delete Piece'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-300 p-1.5 rounded-sm animate-fadeIn">
                        <span className="text-xs font-bold text-red-900 px-2">
                          {isEs ? '¿Eliminar permanentemente?' : 'Delete permanently?'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (productToEdit && onDeleteProduct) {
                              onDeleteProduct(productToEdit.id);
                              onClose();
                            }
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer shadow-xs"
                        >
                          {isEs ? 'Sí, Eliminar' : 'Yes, Delete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsConfirmingDelete(false)}
                          className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 text-xs font-semibold rounded-sm transition-colors cursor-pointer"
                        >
                          {isEs ? 'Cancelar' : 'Cancel'}
                        </button>
                      </div>
                    )
                  )}
                </div>

                {/* Right Side: Cancel & Save Changes / Publish Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 border border-[#D1C9BD] text-[#1C1B20] text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-[#E8E2D9] transition-colors"
                  >
                    {isEs ? 'Cancelar' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#1C1B20] text-[#FAF8F5] text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-[#3B3A40] transition-colors flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    {isEditing ? (
                      <Check className="w-4 h-4 text-[#B88A58]" />
                    ) : isBatchMode && uploadedImages.length > 1 ? (
                      <Layers className="w-4 h-4 text-[#B88A58]" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>
                      {isEditing
                        ? (isEs ? 'Guardar Cambios' : 'Save Changes')
                        : isBatchMode && uploadedImages.length > 1
                        ? (isEs ? `Publicar ${uploadedImages.length} Prendas Individuales` : `Publish ${uploadedImages.length} Individual Items`)
                        : (isEs ? 'Publicar Prenda' : 'Publish Garment')}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
