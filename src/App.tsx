import React, { useState, useEffect } from 'react';
import { PRODUCTS } from './data/products';
import { Product, CartItem, Size, ViewMode, User } from './types';
import { Language } from './data/translations';
import { fetchServerImageSettings } from './utils/imageFrame';
import { getLocalStoredProductsSync, loadAllPersistedProducts, saveProductsToStorage, deleteProductFromStorage } from './utils/productStorage';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { CatalogView } from './components/CatalogView';
import { ProductDetailView } from './components/ProductDetailView';
import { ShoppingBagDrawer } from './components/ShoppingBagDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { StylingConciergeModal } from './components/StylingConciergeModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { BrandSplashModal } from './components/BrandSplashModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AddProductModal } from './components/AddProductModal';
import { LoginModal } from './components/LoginModal';
import { InventoryView } from './components/InventoryView';
import { UsersView } from './components/UsersView';
import { ConciergeChatBot } from './components/ConciergeChatBot';

const INITIAL_REGISTERED_USERS: User[] = [
  {
    id: 'usr-dev-1',
    name: 'Luis de la Rosa',
    email: 'luis.delarosacosio@gmail.com',
    cellphone: '+52 55 1234 5678',
    profile: 'Developer',
    memberTier: 'Lead Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-01-15'
  },
  {
    id: 'usr-101',
    name: 'Elena Vance',
    email: 'elena.vance@atelier.com',
    cellphone: '+1 (555) 234-5678',
    profile: 'User',
    memberTier: 'Atelier Privé Member',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-02-10'
  },
  {
    id: 'usr-102',
    name: 'Mateo Silva',
    email: 'mateo.silva@luxury.co',
    cellphone: '+34 612 345 678',
    profile: 'User',
    memberTier: 'Atelier Gold Member',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-03-22'
  },
  {
    id: 'usr-103',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@paris.fr',
    cellphone: '+33 6 12 34 56 78',
    profile: 'User',
    memberTier: 'Atelier Member',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-04-05'
  },
  {
    id: 'usr-104',
    name: 'Alessandro Rossi',
    email: 'a.rossi@milano.it',
    cellphone: '+39 320 123 4567',
    profile: 'User',
    memberTier: 'Atelier Member',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-05-18'
  }
];

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const localData = getLocalStoredProductsSync();
      let baseProducts = [...PRODUCTS];

      if (localData.edited.length > 0) {
        baseProducts = baseProducts.map(p => {
          const edited = localData.edited.find(e => e.id === p.id);
          return edited ? edited : p;
        });
      }

      if (localData.custom.length > 0) {
        const customOnly = localData.custom.filter(p => !baseProducts.some(dp => dp.id === p.id));
        return [...customOnly, ...baseProducts];
      }

      return baseProducts;
    } catch (e) {
      console.error('Failed to load saved products', e);
    }
    return PRODUCTS;
  });

  // Sync persisted products & image frame settings from IndexedDB & server on mount
  useEffect(() => {
    async function syncServerData() {
      try {
        // Load all persisted products from IndexedDB, localStorage and server
        const { mergedProducts } = await loadAllPersistedProducts();
        if (Array.isArray(mergedProducts) && mergedProducts.length > 0) {
          setProducts(mergedProducts);
        }

        // Fetch image frame settings
        await fetchServerImageSettings();
      } catch (err) {
        console.warn('Server sync skipped (offline or initial boot):', err);
      }
    }

    syncServerData();
  }, []);

  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [previousView, setPreviousView] = useState<ViewMode>('home');
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('maris_language') || localStorage.getItem('ales_language');
      if (saved === 'es' || saved === 'en') return saved as Language;
    } catch (e) {}
    return 'en';
  });
  const [selectedProduct, setSelectedProduct] = useState<Product>(() => products[0] || PRODUCTS[0]);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: PRODUCTS[0],
      selectedColor: 'Oatmeal Melange',
      selectedSize: 'EU 48',
      quantity: 1
    }
  ]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['double-breasted-wool-blazer']);
  const [currency, setCurrency] = useState<string>(() => {
    try {
      const savedLang = localStorage.getItem('maris_language') || localStorage.getItem('ales_language');
      if (savedLang === 'es') return 'MXN';
      const saved = localStorage.getItem('maris_currency');
      if (saved) return saved;
    } catch (e) {}
    return 'USD';
  });

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    try {
      localStorage.setItem('maris_language', newLang);
      localStorage.setItem('ales_language', newLang);
    } catch (e) {}
    if (newLang === 'es') {
      setCurrency('MXN');
      try {
        localStorage.setItem('maris_currency', 'MXN');
      } catch (e) {}
    } else if (newLang === 'en') {
      setCurrency('USD');
      try {
        localStorage.setItem('maris_currency', 'USD');
      } catch (e) {}
    }
  };

  // Auth / User State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('maris_user_account') || localStorage.getItem('ales_user_account');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          const savedAvatar = localStorage.getItem(`maris_avatar_${parsed.email.toLowerCase().trim()}`) || localStorage.getItem(`ales_avatar_${parsed.email.toLowerCase().trim()}`);
          if (savedAvatar) {
            parsed.avatar = savedAvatar;
          }
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load user', e);
    }
    const defaultDev = INITIAL_REGISTERED_USERS[0];
    try {
      const savedDevAvatar = localStorage.getItem(`maris_avatar_${defaultDev.email.toLowerCase().trim()}`) || localStorage.getItem(`ales_avatar_${defaultDev.email.toLowerCase().trim()}`);
      if (savedDevAvatar) {
        return { ...defaultDev, avatar: savedDevAvatar };
      }
    } catch (e) {}
    return defaultDev;
  });

  // Modals / Drawers state
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isStylistOpen, setIsStylistOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isSplashOpen, setIsSplashOpen] = useState(false);
  const [isOrderConfirmationOpen, setIsOrderConfirmationOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginInitialMode, setLoginInitialMode] = useState<'login' | 'register'>('login');

  const handleOpenLogin = (mode: 'login' | 'register' = 'login') => {
    setLoginInitialMode(mode);
    setIsLoginOpen(true);
  };

  // Registered Users Directory State
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('maris_registered_users') || localStorage.getItem('ales_registered_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((u: User) => {
            const customAvatar = localStorage.getItem(`maris_avatar_${u.email.toLowerCase().trim()}`) || localStorage.getItem(`ales_avatar_${u.email.toLowerCase().trim()}`);
            return customAvatar ? { ...u, avatar: customAvatar } : u;
          });
        }
      }
    } catch (e) {
      console.error('Failed to load registered users', e);
    }
    return INITIAL_REGISTERED_USERS.map((u: User) => {
      try {
        const customAvatar = localStorage.getItem(`maris_avatar_${u.email.toLowerCase().trim()}`) || localStorage.getItem(`ales_avatar_${u.email.toLowerCase().trim()}`);
        return customAvatar ? { ...u, avatar: customAvatar } : u;
      } catch (e) {
        return u;
      }
    });
  });

  const handleUpdateRegisteredUsers = (users: User[]) => {
    setRegisteredUsers(users);
    try {
      localStorage.setItem('maris_registered_users', JSON.stringify(users));
      localStorage.setItem('ales_registered_users', JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save registered users', e);
    }
  };

  const handleLogin = (user: User) => {
    // Permanently store avatar for this user email
    if (user.avatar && user.email) {
      try {
        const clean = user.email.toLowerCase().trim();
        localStorage.setItem(`maris_avatar_${clean}`, user.avatar);
        localStorage.setItem(`ales_avatar_${clean}`, user.avatar);
      } catch (e) {
        console.error('Failed to persist avatar', e);
      }
    }

    setCurrentUser(user);
    try {
      localStorage.setItem('maris_user_account', JSON.stringify(user));
      localStorage.setItem('ales_user_account', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user', e);
    }

    // Automatically sync into registeredUsers if not existing
    setRegisteredUsers(prev => {
      const existingIndex = prev.findIndex(u => u.email.toLowerCase().trim() === user.email.toLowerCase().trim());
      let updated: User[];
      if (existingIndex > -1) {
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          name: user.name,
          cellphone: user.cellphone || updated[existingIndex].cellphone,
          profile: user.email.toLowerCase().trim() === 'luis.delarosacosio@gmail.com' ? 'Developer' : (user.profile || updated[existingIndex].profile || 'User'),
          avatar: user.avatar || updated[existingIndex].avatar
        };
      } else {
        const isDev = user.email.toLowerCase().trim() === 'luis.delarosacosio@gmail.com';
        const newUser: User = {
          ...user,
          profile: isDev ? 'Developer' : (user.profile || 'User'),
          cellphone: user.cellphone || '+52 55 1234 5678',
          createdAt: new Date().toISOString().split('T')[0]
        };
        updated = [newUser, ...prev];
      }
      try {
        localStorage.setItem('maris_registered_users', JSON.stringify(updated));
        localStorage.setItem('ales_registered_users', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save updated registered users', e);
      }
      return updated;
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('maris_user_account');
      localStorage.removeItem('ales_user_account');
    } catch (e) {
      console.error('Failed to remove user', e);
    }
  };

  const isAdminUser = currentUser?.email?.toLowerCase().trim() === 'luis.delarosacosio@gmail.com';
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const handleOpenAddProduct = isAdminUser ? () => {
    setProductToEdit(null);
    setIsAddProductOpen(true);
  } : undefined;

  const handleEditProduct = isAdminUser ? (product: Product) => {
    setProductToEdit(product);
    setIsAddProductOpen(true);
  } : undefined;

  // Search & Category passing state
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  // Checkout meta
  const [lastDiscount, setLastDiscount] = useState(0);
  const [lastGiftNote, setLastGiftNote] = useState('');

  const handleSaveProduct = (savedProduct: Product) => {
    setProducts(prev => {
      const existingIndex = prev.findIndex(p => p.id === savedProduct.id);
      let updated: Product[];
      if (existingIndex > -1) {
        updated = [...prev];
        updated[existingIndex] = savedProduct;
      } else {
        updated = [savedProduct, ...prev];
      }
      try {
        saveProductsToStorage(updated);

        const isEdit = PRODUCTS.some(dp => dp.id === savedProduct.id);
        // Async sync to server API for persistent storage across deploys/publishes
        fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product: savedProduct,
            isEdit
          })
        }).catch(err => console.warn('Could not sync product to server', err));
      } catch (e) {
        console.error('Failed to save products', e);
      }
      return updated;
    });

    if (selectedProduct?.id === savedProduct.id) {
      setSelectedProduct(savedProduct);
    } else {
      setSelectedProduct(savedProduct);
      setCurrentView('product-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveMultipleProducts = (newProductsList: Product[]) => {
    if (!newProductsList || newProductsList.length === 0) return;
    setProducts(prev => {
      const updated = [...newProductsList, ...prev];
      try {
        saveProductsToStorage(updated);
        // Async sync to server API for all products
        newProductsList.forEach(prod => {
          fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product: prod,
              isEdit: false
            })
          }).catch(err => console.warn('Could not sync product to server', err));
        });
      } catch (e) {
        console.error('Failed to save batch products', e);
      }
      return updated;
    });

    // View the catalog to see all newly created products
    if (newProductsList[0]) {
      setSelectedProduct(newProductsList[0]);
    }
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== productId);
      try {
        deleteProductFromStorage(productId);
      } catch (e) {
        console.error('Failed to delete product from storage', e);
      }
      return updated;
    });

    // Remove from cart
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    // Remove from wishlist
    setWishlistIds(prev => prev.filter(id => id !== productId));

    // Reset selected product if currently viewed
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
      if (currentView === 'product-detail') {
        setCurrentView('catalog');
      }
    }

    setIsAddProductOpen(false);
    setProductToEdit(null);
  };

  // Cart operations
  const handleAddToCart = (product: Product, size: Size, color: string) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { product, selectedSize: size, selectedColor: color, quantity: 1 }];
    });
    setIsBagOpen(true);
  };

  const handleUpdateQuantity = (productId: string, size: Size, color: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId && item.selectedSize === size && item.selectedColor === color) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveCartItem = (productId: string, size: Size, color: string) => {
    setCartItems(prev => prev.filter(item =>
      !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  // Wishlist operations
  const handleToggleWishlist = (productId: string) => {
    setWishlistIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

  // Navigation handlers
  const handleNavigate = (view: ViewMode) => {
    if (currentView !== view && currentView !== 'product-detail') {
      setPreviousView(currentView);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSelectProduct = (product: Product) => {
    if (currentView !== 'product-detail') {
      setPreviousView(currentView);
    }
    setSelectedProduct(product);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleReturnToPreviousSection = () => {
    const targetView = previousView && previousView !== 'product-detail' ? previousView : 'home';
    setCurrentView(targetView);

    const targetProductId = selectedProduct?.id;

    // Scroll instantly directly to the last item chosen without smooth transition delays
    if (!targetProductId) {
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'instant', block: 'start' });
      return;
    }

    let el = document.getElementById(`product-card-${targetProductId}`);

    if (!el) {
      setActiveCategoryFilter('All');
      setActiveSearchQuery('');
      setTimeout(() => {
        const reCheckedEl = document.getElementById(`product-card-${targetProductId}`);
        if (reCheckedEl) {
          reCheckedEl.scrollIntoView({ behavior: 'instant', block: 'center' });
          reCheckedEl.classList.add('ring-2', 'ring-[#B88A58]', 'ring-offset-2');
          setTimeout(() => {
            reCheckedEl.classList.remove('ring-2', 'ring-[#B88A58]', 'ring-offset-2');
          }, 1500);
        } else {
          document.getElementById('products-section')?.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      }, 0);
    } else {
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
      el.classList.add('ring-2', 'ring-[#B88A58]', 'ring-offset-2');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-[#B88A58]', 'ring-offset-2');
      }, 1500);
    }
  };

  const handleSearch = (query: string) => {
    setActiveSearchQuery(query);
    setActiveCategoryFilter('');
    setCurrentView('catalog');
  };

  const handleProceedToCheckout = (discount: number, giftNote: string) => {
    setLastDiscount(discount);
    setLastGiftNote(giftNote);
    setIsBagOpen(false);
    setIsOrderConfirmationOpen(true);
  };

  const handleCloseOrderConfirmation = () => {
    setIsOrderConfirmationOpen(false);
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1A1A1A] flex flex-col justify-between selection:bg-[#1A1A1A] selection:text-[#FBF9F5]">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlistIds.length}
        onOpenBag={() => setIsBagOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenStylist={() => setIsStylistOpen(true)}
        onOpenAddProduct={handleOpenAddProduct}
        onSearch={handleSearch}
        onCategorySelect={(cat) => {
          setActiveCategoryFilter(cat);
          setActiveSearchQuery('');
          setCurrentView('catalog');
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
        currency={currency}
        onChangeCurrency={setCurrency}
        language={language}
        onChangeLanguage={handleLanguageChange}
        currentUser={currentUser}
        onOpenLogin={handleOpenLogin}
        products={products}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            products={products}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
            onQuickAdd={(p, size) => handleAddToCart(p, size || p.sizes[0], p.colors[0]?.name || '')}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onOpenStylist={() => setIsStylistOpen(true)}
            onOpenAddProduct={handleOpenAddProduct}
            onEditProduct={handleEditProduct}
            currency={currency}
            language={language}
            onChangeLanguage={setLanguage}
            initialCategory={activeCategoryFilter}
            onCategoryChange={setActiveCategoryFilter}
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        )}

        {currentView === 'catalog' && (
          <CatalogView
            products={products}
            onSelectProduct={handleSelectProduct}
            onQuickAdd={(p, size) => handleAddToCart(p, size || p.sizes[0], p.colors[0]?.name || '')}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            currency={currency}
            initialCategory={activeCategoryFilter}
            initialSearchQuery={activeSearchQuery}
            onOpenAddProduct={handleOpenAddProduct}
            onEditProduct={handleEditProduct}
            onCategoryChange={setActiveCategoryFilter}
            currentUser={currentUser}
            language={language}
          />
        )}

        {currentView === 'editorial' && (
          <CatalogView
            products={products}
            onSelectProduct={handleSelectProduct}
            onQuickAdd={(p, size) => handleAddToCart(p, size || p.sizes[0], p.colors[0]?.name || '')}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            currency={currency}
            initialCategory=""
            initialSearchQuery=""
            onOpenAddProduct={handleOpenAddProduct}
            onEditProduct={handleEditProduct}
            currentUser={currentUser}
            language={language}
          />
        )}

        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailView
            key={selectedProduct.id}
            product={selectedProduct}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={wishlistIds.includes(selectedProduct.id)}
            onSelectProduct={handleSelectProduct}
            allProducts={products}
            onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
            onOpenStylist={() => setIsStylistOpen(true)}
            currency={currency}
            onBack={handleReturnToPreviousSection}
            currentUser={currentUser}
            onEditProduct={handleEditProduct}
            language={language}
          />
        )}

        {currentView === 'inventory' && (
          <InventoryView
            products={products}
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenAddProduct={handleOpenAddProduct}
            onEditProduct={handleEditProduct}
            onUpdateProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            currency={currency}
            language={language}
          />
        )}

        {currentView === 'users' && (
          <UsersView
            currentUser={currentUser}
            registeredUsers={registeredUsers}
            onUpdateRegisteredUsers={handleUpdateRegisteredUsers}
            onOpenLogin={() => setIsLoginOpen(true)}
            language={language}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenStylist={() => setIsStylistOpen(true)}
        language={language}
      />

      {/* Drawers and Modals */}
      <ShoppingBagDrawer
        isOpen={isBagOpen}
        onClose={() => setIsBagOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
        currency={currency}
        allProducts={products}
        onSelectProduct={handleSelectProduct}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onSelectProduct={handleSelectProduct}
        currency={currency}
      />

      <StylingConciergeModal
        isOpen={isStylistOpen}
        onClose={() => setIsStylistOpen(false)}
        cartItems={cartItems}
        wishlistProducts={wishlistProducts}
        onSelectProduct={handleSelectProduct}
        allProducts={products}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => {
          setIsAddProductOpen(false);
          setProductToEdit(null);
        }}
        onAddProduct={handleSaveProduct}
        onAddMultipleProducts={handleSaveMultipleProducts}
        onEditProduct={handleSaveProduct}
        onDeleteProduct={isAdminUser ? handleDeleteProduct : undefined}
        productToEdit={productToEdit}
        currency={currency}
        language={language}
      />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      <BrandSplashModal
        isOpen={isSplashOpen}
        onClose={() => setIsSplashOpen(false)}
        onExploreCollection={() => {
          setIsSplashOpen(false);
          handleNavigate('catalog');
        }}
      />

      <OrderConfirmationModal
        isOpen={isOrderConfirmationOpen}
        onClose={handleCloseOrderConfirmation}
        cartItems={cartItems}
        currency={currency}
        appliedDiscount={lastDiscount}
        giftNote={lastGiftNote}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        language={language}
        initialMode={loginInitialMode}
      />

      {/* Floating AI Client Concierge & Doubt Solver Chat Bot */}
      <ConciergeChatBot
        language={language}
        currency={currency}
        cartItems={cartItems}
        wishlistIds={wishlistIds}
        allProducts={products}
        onSelectProduct={handleSelectProduct}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenShoppingBag={() => setIsBagOpen(true)}
      />
    </div>
  );
}
