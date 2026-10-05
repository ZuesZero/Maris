import React, { useState, useMemo, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import {
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  ShieldCheck,
  Layers,
  Calendar,
  BarChart3,
  Lock,
  Plus,
  Edit2,
  CheckCircle2,
  ShoppingBag,
  Receipt,
  CreditCard,
  Truck,
  Building2,
  Download,
  ArrowUpRight,
  PieChart as PieChartIcon,
  RefreshCw,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Boxes,
  Check,
  Tag,
  ArrowRight,
  Trash2
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList
} from 'recharts';
import { Product, User, SaleTransaction, Category } from '../types';
import { INITIAL_SALES_TRANSACTIONS } from '../data/salesData';
import { Language } from '../data/translations';
import { getExchangeRate } from '../utils/currency';
import { getTranslatedProduct, getCategoryDisplayName } from '../utils/productTranslations';

interface InventoryViewProps {
  products: Product[];
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenAddProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  onDeleteAllProducts?: () => void;
  currency: string;
  language?: Language;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  currentUser,
  onOpenLogin,
  onOpenAddProduct,
  onEditProduct,
  onUpdateProduct,
  onDeleteProduct,
  onDeleteAllProducts,
  currency,
  language = 'en'
}) => {
  const isAuthorized = currentUser?.email?.toLowerCase().trim() === 'luis.delarosacosio@gmail.com';
  const lang = language || 'en';
  const effectiveCurrency = (lang === 'es' || currency === 'MXN') ? 'MXN' : (currency || 'USD');
  const rate = getExchangeRate(effectiveCurrency);
  const isMxn = effectiveCurrency === 'MXN';
  const currencySymbol = effectiveCurrency === 'EUR' ? '€' : effectiveCurrency === 'GBP' ? '£' : '$';

  const t = {
    // Restricted View
    restrictedTitle: lang === 'es' ? 'Acceso Restringido a Inventario, Ventas y Analítica' : 'Inventory, Sales & Financial Analytics Restricted',
    restrictedBadge: lang === 'es' ? 'Vista Restringida de Desarrollador' : 'Developer Restricted View',
    restrictedDesc: lang === 'es'
      ? "El libro de ingresos de ventas, registros de transacciones y métricas de valoración de inventario están estrictamente reservados para la cuenta de administrador autorizada."
      : "The Atelier sales revenue ledger, transaction records, and inventory valuation metrics are strictly reserved for authorized administrator account access.",
    loggedInAs: lang === 'es' ? 'Sesión iniciada como:' : 'Currently logged in as:',
    notLoggedInDev: lang === 'es' ? 'No has iniciado sesión como administrador.' : 'You are currently not logged in as administrator.',
    signInDev: lang === 'es' ? 'Iniciar sesión como Administrador' : 'Sign In as Administrator',

    // Header Banner
    adminControl: lang === 'es' ? 'Control Administrativo de Desarrollador' : 'Developer Administrative Control',
    devMode: lang === 'es' ? 'MODO DESARROLLADOR' : 'DEVELOPER MODE',
    headerTitleSales: lang === 'es' ? 'Libro de Ventas y Transacciones' : 'Sales Made & Transactions Ledger',
    headerTitleInventory: lang === 'es' ? 'Proyección de Cantidad y Valoración de Inventario' : 'Inventory Quantity & Valuation Projection',
    headerDescSales: lang === 'es'
      ? 'Panel de ventas en tiempo real, transacciones detalladas de clientes, margen de ganancia bruta y desglose por canal de boutique.'
      : 'Real-time sales made dashboard, itemized customer transactions, gross profit margin calculations, and boutique channel sales breakdown.',
    headerDescInventory: lang === 'es'
      ? 'Unidades en stock actual, análisis de valoración de costos, proyecciones en series de tiempo y estado por código SKU.'
      : 'Current in-store stock units, cost valuation analysis, time-series projections starting today, and individual SKU stock status.',
    logNewSale: lang === 'es' ? 'Registrar Nueva Venta' : 'Log New Sale',
    addNewProduct: lang === 'es' ? 'Añadir Nuevo Producto' : 'Add New Product',
    deleteAllItems: lang === 'es' ? 'Eliminar Todos los Artículos' : 'Delete All Items',
    downloadZip: lang === 'es' ? 'Descargar Proyecto (.ZIP)' : 'Download Project (.ZIP)',

    // Tabs
    tabSales: lang === 'es' ? 'Libro de Ventas e Ingresos' : 'Sales & Revenue Ledger',
    tabInventory: lang === 'es' ? 'Inventario y Valoración' : 'Inventory & Valuation',

    // Sales Filters
    fiscalYear: lang === 'es' ? 'Año Fiscal:' : 'Fiscal Year:',
    allYears: lang === 'es' ? 'Todos los Años' : 'All Years',
    searchTransactions: lang === 'es' ? 'Buscar transacciones por cliente, ID o producto...' : 'Search transactions by client name, ID, product...',
    allCategories: lang === 'es' ? 'Todas las Categorías' : 'All Categories',
    allChannels: lang === 'es' ? 'Todos los Canales' : 'All Channels',
    allQuarters: lang === 'es' ? 'Todos los Trimestres' : 'All Quarters',
    exportCsv: lang === 'es' ? 'Exportar CSV' : 'Export CSV',

    // Sales Metrics
    grossRevenue: lang === 'es' ? 'Ingresos Brutos' : 'Gross Revenue',
    grossRevenueNote: lang === 'es' ? 'Ingresos acumulados de ventas' : 'Accumulated sales transactions revenue',
    totalSalesLogged: lang === 'es' ? 'Ventas Registradas' : 'Total Sales Logged',
    totalSalesNote: lang === 'es' ? 'Transacciones procesadas' : 'Individual completed order records',
    unitsSold: lang === 'es' ? 'Unidades Vendidas' : 'Units Sold',
    unitsSoldNote: lang === 'es' ? 'Piezas entregadas a clientes' : 'Total physical pieces delivered',
    avgOrderValue: lang === 'es' ? 'Valor Promedio por Pedido' : 'Average Order Value',
    avgOrderNote: lang === 'es' ? 'Gasto promedio por transacción' : 'Average spend per client checkout',
    netProfitMargin: lang === 'es' ? 'Margen de Ganancia Neta (Est.)' : 'Net Profit Margin (Est.)',
    netProfitNote: lang === 'es' ? 'Beneficio estimado tras costos' : 'Estimated profit above COGS',

    // Sales Charts & Tables
    quarterlyBreakdown: lang === 'es' ? 'Desglose Trimestral de Ingresos' : 'Quarterly Revenue Breakdown',
    revenueByChannel: lang === 'es' ? 'Ingresos por Canal de Venta' : 'Revenue by Sales Channel',
    topSellingProducts: lang === 'es' ? 'Productos Más Vendidos' : 'Top Selling Products',
    salesLedgerTitle: lang === 'es' ? 'Libro de Ventas y Registros de Transacciones' : 'Sales Ledger & Transaction Records',

    // Table Headers Sales
    colTxId: lang === 'es' ? 'ID Transacción' : 'Transaction ID',
    colDateTime: lang === 'es' ? 'Fecha y Hora' : 'Date & Time',
    colClient: lang === 'es' ? 'Cliente y Correo' : 'Client Name & Email',
    colProduct: lang === 'es' ? 'Producto y Talla' : 'Product & Size',
    colChannel: lang === 'es' ? 'Canal' : 'Channel',
    colPayment: lang === 'es' ? 'Método de Pago' : 'Payment Method',
    colQty: lang === 'es' ? 'Cant.' : 'Qty',
    colTotalAmount: lang === 'es' ? `Monto Total (${isMxn ? 'MXN' : effectiveCurrency})` : `Total Amount (${effectiveCurrency})`,
    colStatus: lang === 'es' ? 'Estado' : 'Status',
    noSalesFound: lang === 'es' ? 'No se encontraron transacciones con los filtros seleccionados.' : 'No sales transactions found matching your filter criteria.',

    // Modal Add Sale
    modalSaleTitle: lang === 'es' ? 'Registrar Venta Manual de Atelier' : 'Log Manual Atelier Sale',
    modalSaleBadge: lang === 'es' ? 'Entrada Ejecutiva de Venta' : 'Executive Sale Entry',
    modalSaleDesc: lang === 'es' ? 'Registra una venta en tiempo real para actualizar el panel de ventas.' : 'Log a real-time sale to instantly reflect in the sales dashboard.',
    selectPiece: lang === 'es' ? 'Seleccionar Pieza' : 'Select Garment Piece',
    sizeLabel: lang === 'es' ? 'Talla' : 'Size',
    clientNameLabel: lang === 'es' ? 'Nombre del Cliente' : 'Client Name',
    clientEmailLabel: lang === 'es' ? 'Correo del Cliente' : 'Client Email',
    quantityLabel: lang === 'es' ? 'Cantidad' : 'Quantity',
    channelLabel: lang === 'es' ? 'Canal de Venta de Boutique' : 'Boutique Sales Channel',
    paymentLabel: lang === 'es' ? 'Método de Pago' : 'Payment Method',
    btnCancel: lang === 'es' ? 'Cancelar' : 'Cancel',
    btnRecordSale: lang === 'es' ? 'Registrar Venta y Descontar Stock' : 'Record Sale & Deduct Stock',

    // Inventory View Summary & Table
    totalProducts: lang === 'es' ? 'Total de Productos' : 'Total Catalog Products',
    totalProductsNote: lang === 'es' ? 'Piezas únicas de diseño' : 'Unique design styles',
    totalStockUnits: lang === 'es' ? 'Unidades en Stock' : 'Total Units in Stock',
    totalStockNote: lang === 'es' ? 'Conteo físico de inventario en tienda' : 'Physical store inventory count',
    totalWholesaleCost: lang === 'es' ? `Costo Total al Mayor (${isMxn ? 'MXN' : effectiveCurrency})` : `Total Wholesale Cost (${effectiveCurrency})`,
    totalWholesaleNote: lang === 'es' ? 'Valoración combinada de costos de producción' : 'Combined production cost valuation',
    totalRetailValuation: lang === 'es' ? `Valoración Total al Detalle (${isMxn ? 'MXN' : effectiveCurrency})` : `Total Retail Valuation (${effectiveCurrency})`,
    totalRetailNote: lang === 'es' ? 'Ingreso bruto potencial de stock' : 'Potential gross revenue from stock',
    potentialProfit: lang === 'es' ? 'Ganancia Bruta Potencial' : 'Potential Gross Profit',
    potentialProfitNote: lang === 'es' ? 'Ganancias estimadas al vender el 100%' : 'Estimated earnings on 100% sell-through',

    // Inventory Table & Controls
    physicalInventoryTitle: lang === 'es' ? 'Inventario Físico de Catálogo' : 'Physical Catalog Inventory',
    physicalInventorySub: lang === 'es' ? 'Piezas Registradas y Costos Individuales de Stock' : 'Registered Pieces & Individual Stock Costs',
    searchInventoryPlaceholder: lang === 'es' ? 'Buscar nombre o categoría...' : 'Search piece name or category...',
    allStockLevels: lang === 'es' ? 'Todos los Niveles de Stock' : 'All Stock Levels',
    inStockOption: lang === 'es' ? 'En Stock (> 5)' : 'In Stock (> 5)',
    lowStockOption: lang === 'es' ? 'Stock Bajo (1-5)' : 'Low Stock (1-5)',
    outOfStockOption: lang === 'es' ? 'Agotado (0)' : 'Out of Stock (0)',

    colGarmentName: lang === 'es' ? 'Nombre de la Pieza' : 'Garment Name',
    colCategory: lang === 'es' ? 'Categoría' : 'Category',
    colUnitCost: lang === 'es' ? 'Costo Unitario' : 'Unit Cost',
    colRetailPrice: lang === 'es' ? 'Precio Venta' : 'Retail Price',
    colStockUnits: lang === 'es' ? 'Unidades' : 'Units',
    colTotalCostVal: lang === 'es' ? 'Valor Costo' : 'Total Cost',
    colTotalRetailVal: lang === 'es' ? 'Valor Venta' : 'Total Retail',
    colStockStatus: lang === 'es' ? 'Estado de Stock' : 'Stock Status',
    colActions: lang === 'es' ? 'Acciones' : 'Actions',
    noInventoryFound: lang === 'es' ? 'No se encontraron piezas registradas con los criterios seleccionados.' : 'No registered pieces found matching current criteria.',

    statusOutOfStock: lang === 'es' ? 'Agotado' : 'Out of Stock',
    statusLow: lang === 'es' ? 'Bajo' : 'Low',
    statusOptimal: lang === 'es' ? 'Óptimo' : 'Optimal',

    // Quick Sell / State Change Strings
    availableState: lang === 'es' ? 'Disponible' : 'Available',
    soldState: lang === 'es' ? 'Vendido' : 'Sold',
    markAsSold: lang === 'es' ? 'Marcar como Vendido' : 'Mark as Sold',
    sellPiece: lang === 'es' ? 'Vender' : 'Sell',
    moveToSalesBook: lang === 'es' ? 'Mover a Libro de Ventas' : 'Move to Sales Book',
    soldOutOfStock: lang === 'es' ? 'Vendido / Agotado' : 'Sold / Out of Stock',
    viewInSalesBook: lang === 'es' ? 'Ver en Libro de Ventas' : 'View in Book of Sales',
    quickSellModalTitle: lang === 'es' ? 'Vender Pieza y Mover al Libro de Ventas' : 'Sell Piece & Move to Sales Ledger',
    quickSellModalBadge: lang === 'es' ? 'Transacción de Salida de Stock' : 'Stock Outflow Transaction',
    quickSellModalDesc: lang === 'es'
      ? 'Esta acción registrará de inmediato la venta en el Libro de Ventas y descontará las unidades físicas del inventario disponible.'
      : 'This action will instantly record the sale in the Sales Ledger and deduct physical units from store inventory.',
    quickSell1Unit: lang === 'es' ? '1 Unidad' : '1 Unit',
    quickSellAllUnits: lang === 'es' ? 'Todo el Stock Restante' : 'All Remaining Stock',
    sellUnitsLabel: lang === 'es' ? 'Unidades a Vender:' : 'Units to Sell:',
    revenueSummary: lang === 'es' ? 'Resumen Financiero de la Venta' : 'Financial Sale Summary',
    grossProfitLabel: lang === 'es' ? 'Ganancia Bruta:' : 'Gross Profit:',
    remainingStockAfter: lang === 'es' ? 'Stock Restante tras la Venta:' : 'Remaining In-Store Stock:',
    confirmSellAndMoveBtn: lang === 'es' ? 'Confirmar Venta y Mover a Libro de Ventas' : 'Confirm Sale & Move to Sales Book',
  };

  // Active View Tab: 'sales' (Sales Made & Transactions) | 'inventory' (Inventory Quantity & Valuation Projections)
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory'>('sales');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<SaleTransaction | null>(null);

  // Shared Filters
  const [selectedYear, setSelectedYear] = useState<'2024' | '2025' | '2026' | 'All'>('2026');

  // Sales View Specific Filters
  const [salesSearch, setSalesSearch] = useState('');
  const [salesCategoryFilter, setSalesCategoryFilter] = useState<string>('All');
  const [salesChannelFilter, setSalesChannelFilter] = useState<string>('All');
  const [salesQuarterFilter, setSalesQuarterFilter] = useState<string>('All');
  const [salesTransactions, setSalesTransactions] = useState<SaleTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('maris_sales_transactions') || localStorage.getItem('ales_sales_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load sales transactions', e);
    }
    return INITIAL_SALES_TRANSACTIONS;
  });

  const saveSalesTransactions = (txs: SaleTransaction[]) => {
    setSalesTransactions(txs);
    try {
      localStorage.setItem('maris_sales_transactions', JSON.stringify(txs));
      localStorage.setItem('ales_sales_transactions', JSON.stringify(txs));
    } catch (e) {
      console.error('Failed to save sales transactions', e);
    }
  };

  const handleDeleteSaleTransaction = (transactionId: string) => {
    const updated = salesTransactions.filter(st => st.id !== transactionId);
    saveSalesTransactions(updated);
    setTransactionToDelete(null);
  };

  // Quick Sell Modal State (Change state from available to sold & move to book of sales)
  const [quickSellProduct, setQuickSellProduct] = useState<Product | null>(null);
  const [quickSellQty, setQuickSellQty] = useState<number>(1);
  const [quickSellSize, setQuickSellSize] = useState<string>('One Size');
  const [quickSellCustomer, setQuickSellCustomer] = useState<string>('Venta Directa en Tienda');
  const [quickSellEmail, setQuickSellEmail] = useState<string>('cliente.mostrador@ales.mx');
  const [quickSellChannel, setQuickSellChannel] = useState<'Boutique Milano' | 'Online Store' | 'Atelier Paris' | 'VIP Private Concierge'>('Boutique Milano');
  const [quickSellPayment, setQuickSellPayment] = useState<'Credit Card' | 'Apple Pay' | 'Wire Transfer' | 'Amex Centurion'>('Credit Card');

  // Notification Banner when item is marked as sold
  const [soldNotification, setSoldNotification] = useState<{
    message: string;
    txId: string;
    productName: string;
  } | null>(null);

  // New Manual Sale Form Modal State
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [newSaleProduct, setNewSaleProduct] = useState<string>(products[0]?.id || 'sculpted-cashmere-overcoat');
  const [newSaleSize, setNewSaleSize] = useState<string>('EU 50');
  const [newSaleCustomer, setNewSaleCustomer] = useState<string>('Baroness H. von Stauffenberg');
  const [newSaleEmail, setNewSaleEmail] = useState<string>('stauffenberg@vienna-estates.at');
  const [newSaleQty, setNewSaleQty] = useState<number>(1);
  const [newSaleChannel, setNewSaleChannel] = useState<'Boutique Milano' | 'Online Store' | 'Atelier Paris' | 'VIP Private Concierge'>('Boutique Milano');
  const [newSalePayment, setNewSalePayment] = useState<'Credit Card' | 'Apple Pay' | 'Wire Transfer' | 'Amex Centurion'>('Amex Centurion');

  // Inventory View Specific Filters
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState<string>('All');
  const [inventoryStockFilter, setInventoryStockFilter] = useState<'All' | 'Low' | 'InStock' | 'OutOfStock'>('All');

  // Editable session overrides and expanded breakdown for Inventory View
  const [customCosts, setCustomCosts] = useState<Record<string, number>>({});
  const [customStocks, setCustomStocks] = useState<Record<string, number>>({});
  const [expandedSizesProductId, setExpandedSizesProductId] = useState<string | null>(null);

  const handleUpdateProductStockUnits = (product: Product, newTotalUnits: number) => {
    const validQty = Math.max(0, newTotalUnits);
    setCustomStocks(prev => ({ ...prev, [product.id]: validQty }));

    const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['One Size'];
    let updatedStock: Record<string, number> = { ...(product.stock || {}) };

    if (sizes.length === 1) {
      updatedStock[sizes[0]] = validQty;
    } else {
      const currentTotal = Object.values(updatedStock).reduce((a: number, b: number) => a + b, 0);
      if (currentTotal === 0) {
        const perSize = Math.floor(validQty / sizes.length);
        const remainder = validQty % sizes.length;
        sizes.forEach((s, idx) => {
          updatedStock[s] = perSize + (idx < remainder ? 1 : 0);
        });
      } else {
        let allocated = 0;
        sizes.forEach((s, idx) => {
          if (idx === sizes.length - 1) {
            updatedStock[s] = Math.max(0, validQty - allocated);
          } else {
            const currentSizeStock = updatedStock[s] || 0;
            const portion = Math.round((currentSizeStock / currentTotal) * validQty);
            updatedStock[s] = portion;
            allocated += portion;
          }
        });
      }
    }

    const updatedProduct: Product = {
      ...product,
      stock: updatedStock,
      stockQuantity: validQty,
      inStock: validQty > 0
    };

    if (onUpdateProduct) {
      onUpdateProduct(updatedProduct);
    }
  };

  const handleUpdateSingleSizeStock = (product: Product, size: string, newSizeQty: number) => {
    const validSizeQty = Math.max(0, newSizeQty);
    const updatedStock: Record<string, number> = {
      ...(product.stock || {}),
      [size]: validSizeQty
    };
    const newTotal = Object.values(updatedStock).reduce((a: number, b: number) => a + b, 0);
    setCustomStocks(prev => ({ ...prev, [product.id]: newTotal }));

    const updatedProduct: Product = {
      ...product,
      stock: updatedStock,
      stockQuantity: newTotal,
      inStock: newTotal > 0
    };

    if (onUpdateProduct) {
      onUpdateProduct(updatedProduct);
    }
  };

  const handleUpdateProductCost = (product: Product, newCostInActiveCurrency: number) => {
    const validDisplayCost = Math.max(0, newCostInActiveCurrency);
    // Convert to USD base storage so switching currency back preserves the right value
    const validCostUSD = rate > 0 ? Number((validDisplayCost / rate).toFixed(2)) : validDisplayCost;
    setCustomCosts(prev => ({ ...prev, [product.id]: validCostUSD }));
    const updatedProduct: Product = {
      ...product,
      costPrice: validCostUSD
    };
    if (onUpdateProduct) {
      onUpdateProduct(updatedProduct);
    }
  };

  const barChartRef = useRef<HTMLDivElement>(null);
  const isBarChartInView = useInView(barChartRef, { amount: 0.2 });

  const lineChartRef = useRef<HTMLDivElement>(null);
  const isLineChartInView = useInView(lineChartRef, { amount: 0.2 });

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${Math.round(amount).toLocaleString(lang === 'es' ? 'es-MX' : 'en-US')}${isMxn ? ' MXN' : ''}`;
  };

  const formatNumber = (amount: number) => {
    return amount.toLocaleString(lang === 'es' ? 'es-MX' : 'en-US');
  };

  const formatCompactCurrency = (amount: number) => {
    const amt = Math.round(amount);
    if (amt >= 1000000) {
      return `${currencySymbol}${(amt / 1000000).toFixed(1)}M${isMxn ? ' MXN' : ''}`;
    }
    if (amt >= 1000) {
      return `${currencySymbol}${Math.round(amt / 1000)}k${isMxn ? ' MXN' : ''}`;
    }
    return `${currencySymbol}${amt}${isMxn ? ' MXN' : ''}`;
  };

  // ---------------------------------------------------------------------------
  // INVENTORY COMPUTATIONS
  // ---------------------------------------------------------------------------
  const processedProducts = useMemo(() => {
    return products.map(product => {
      const translated = getTranslatedProduct(product, lang);
      const totalUnits = customStocks[product.id] !== undefined
        ? customStocks[product.id]
        : Object.values(product.stock || {}).reduce((a: number, b: number) => a + b, 0);

      // Base unit cost in USD
      const baseUnitCostUSD = customCosts[product.id] !== undefined
        ? customCosts[product.id]
        : (product.costPrice ?? Math.round(product.price * 0.42));

      // Display unit cost and display retail price in active currency (MXN when in Spanish)
      const displayUnitCost = Math.round(baseUnitCostUSD * rate);
      const displayRetailPrice = Math.round(product.price * rate);

      const totalCostValue = totalUnits * displayUnitCost;
      const totalRetailValue = totalUnits * displayRetailPrice;
      const marginDollar = displayRetailPrice - displayUnitCost;
      const marginPercent = displayRetailPrice > 0 ? Math.round((marginDollar / displayRetailPrice) * 100) : 0;

      return {
        ...product,
        name: translated.name,
        totalUnits,
        baseUnitCostUSD,
        unitCost: displayUnitCost,
        retailPrice: displayRetailPrice,
        totalCostValue,
        totalRetailValue,
        marginDollar,
        marginPercent
      };
    });
  }, [products, customCosts, customStocks, rate, lang]);

  const inventoryMetrics = useMemo(() => {
    const totalItemsCount = processedProducts.length;
    const totalUnitsInStore = processedProducts.reduce((acc, p) => acc + p.totalUnits, 0);
    const totalInventoryCost = processedProducts.reduce((acc, p) => acc + p.totalCostValue, 0);
    const totalRetailValuation = processedProducts.reduce((acc, p) => acc + p.totalRetailValue, 0);
    const grossProfitPotential = totalRetailValuation - totalInventoryCost;
    const overallMarginPct = totalRetailValuation > 0
      ? Math.round((grossProfitPotential / totalRetailValuation) * 100)
      : 0;

    const lowStockCount = processedProducts.filter(p => p.totalUnits > 0 && p.totalUnits <= 5).length;
    const outOfStockCount = processedProducts.filter(p => p.totalUnits === 0).length;

    return {
      totalItemsCount,
      totalUnitsInStore,
      totalInventoryCost,
      totalRetailValuation,
      grossProfitPotential,
      overallMarginPct,
      lowStockCount,
      outOfStockCount
    };
  }, [processedProducts]);

  const filteredInventoryProducts = useMemo(() => {
    return processedProducts.filter(p => {
      const translatedCat = getCategoryDisplayName(p.category, lang);
      const matchesSearch = p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        p.category.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        translatedCat.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchesCategory = inventoryCategory === 'All' || p.category === inventoryCategory;

      let matchesStock = true;
      if (inventoryStockFilter === 'Low') matchesStock = p.totalUnits > 0 && p.totalUnits <= 5;
      if (inventoryStockFilter === 'InStock') matchesStock = p.totalUnits > 5;
      if (inventoryStockFilter === 'OutOfStock') matchesStock = p.totalUnits === 0;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [processedProducts, inventorySearch, inventoryCategory, inventoryStockFilter, lang]);

  const timeSeriesData = useMemo(() => {
    const baseUnits = inventoryMetrics.totalUnitsInStore;
    const baseCost = inventoryMetrics.totalInventoryCost;

    return [
      { date: lang === 'es' ? 'Hoy (Jul 2026)' : 'Today (Jul 2026)', unitsInStore: baseUnits, costValuation: baseCost, salesDepletion: 0, restockUnits: 0 },
      { date: 'Ago 2026', unitsInStore: Math.round(baseUnits * 0.88 + 15), costValuation: Math.round(baseCost * 0.89 + 12000 * rate), salesDepletion: 180, restockUnits: 40 },
      { date: 'Sep 2026', unitsInStore: Math.round(baseUnits * 0.95 + 35), costValuation: Math.round(baseCost * 0.96 + 28000 * rate), salesDepletion: 210, restockUnits: 65 },
      { date: 'Oct 2026', unitsInStore: Math.round(baseUnits * 1.10 + 60), costValuation: Math.round(baseCost * 1.12 + 45000 * rate), salesDepletion: 250, restockUnits: 120 },
      { date: 'Nov 2026', unitsInStore: Math.round(baseUnits * 1.25 + 80), costValuation: Math.round(baseCost * 1.28 + 62000 * rate), salesDepletion: 320, restockUnits: 150 },
      { date: 'Dic 2026', unitsInStore: Math.round(baseUnits * 1.05 + 40), costValuation: Math.round(baseCost * 1.08 + 32000 * rate), salesDepletion: 450, restockUnits: 90 },
      { date: 'Ene 2027', unitsInStore: Math.round(baseUnits * 0.92 + 20), costValuation: Math.round(baseCost * 0.94 + 18000 * rate), salesDepletion: 160, restockUnits: 30 }
    ];
  }, [inventoryMetrics.totalUnitsInStore, inventoryMetrics.totalInventoryCost, lang, rate]);

  // ---------------------------------------------------------------------------
  // SALES TRANSACTIONS COMPUTATIONS
  // ---------------------------------------------------------------------------
  const filteredSalesTransactions = useMemo(() => {
    return salesTransactions.map(st => ({
      ...st,
      unitPrice: Math.round(st.unitPrice * rate),
      unitCost: Math.round(st.unitCost * rate),
      totalSale: Math.round(st.totalSale * rate),
      grossProfit: Math.round(st.grossProfit * rate)
    })).filter(st => {
      const matchesSearch =
        st.id.toLowerCase().includes(salesSearch.toLowerCase()) ||
        st.productName.toLowerCase().includes(salesSearch.toLowerCase()) ||
        st.customerName.toLowerCase().includes(salesSearch.toLowerCase()) ||
        st.customerEmail.toLowerCase().includes(salesSearch.toLowerCase());

      const matchesYear = selectedYear === 'All' || st.year === selectedYear;
      const matchesQuarter = salesQuarterFilter === 'All' || st.quarter === salesQuarterFilter;
      const matchesCategory = salesCategoryFilter === 'All' || st.category === salesCategoryFilter;
      const matchesChannel = salesChannelFilter === 'All' || st.channel === salesChannelFilter;

      return matchesSearch && matchesYear && matchesQuarter && matchesCategory && matchesChannel;
    });
  }, [salesTransactions, salesSearch, selectedYear, salesQuarterFilter, salesCategoryFilter, salesChannelFilter, rate]);

  const salesMetrics = useMemo(() => {
    const totalRevenue = filteredSalesTransactions.reduce((acc, t) => acc + t.totalSale, 0);
    const totalCOGS = filteredSalesTransactions.reduce((acc, t) => acc + t.unitCost * t.quantity, 0);
    const totalProfit = filteredSalesTransactions.reduce((acc, t) => acc + t.grossProfit, 0);
    const totalUnitsSold = filteredSalesTransactions.reduce((acc, t) => acc + t.quantity, 0);
    const transactionCount = filteredSalesTransactions.length;
    const avgOrderValue = transactionCount > 0 ? Math.round(totalRevenue / transactionCount) : 0;
    const profitMarginPct = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

    return {
      totalRevenue,
      totalCOGS,
      totalProfit,
      totalUnitsSold,
      transactionCount,
      avgOrderValue,
      profitMarginPct
    };
  }, [filteredSalesTransactions]);

  // Quarterly Sales Data for Chart
  const quarterlySalesChartData = useMemo(() => {
    const years = selectedYear === 'All' ? ['2024', '2025', '2026'] : [selectedYear];
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

    const result: any[] = [];
    quarters.forEach(q => {
      const qTxs = salesTransactions.filter(st =>
        years.includes(st.year) && st.quarter === q
      );
      const sales = qTxs.reduce((acc, t) => acc + t.totalSale, 0);
      const cogs = qTxs.reduce((acc, t) => acc + t.unitCost * t.quantity, 0);
      const profit = qTxs.reduce((acc, t) => acc + t.grossProfit, 0);
      const units = qTxs.reduce((acc, t) => acc + t.quantity, 0);

      result.push({
        quarter: `${q} (${years.join('/')})`,
        sales,
        cogs,
        profit,
        units
      });
    });

    return result;
  }, [salesTransactions, selectedYear]);

  // Quick Sell Action - Triggered from Inventory Table "Estado de Stock" or "Acciones"
  const handleOpenQuickSell = (product: Product) => {
    const currentUnits = customStocks[product.id] !== undefined
      ? customStocks[product.id]
      : (product.stockQuantity !== undefined
          ? product.stockQuantity
          : Object.values(product.stock || {}).reduce((a: number, b: number) => a + b, 0));

    const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['One Size'];
    const firstAvailableSize = sizes.find(s => (product.stock?.[s] || 0) > 0) || sizes[0];

    setQuickSellProduct(product);
    setQuickSellQty(currentUnits > 0 ? 1 : 1);
    setQuickSellSize(firstAvailableSize);
    setQuickSellCustomer(lang === 'es' ? 'Venta Directa en Tienda' : 'In-Store Walk-in Client');
    setQuickSellEmail(lang === 'es' ? 'cliente.mostrador@ales.mx' : 'walkin.client@ales.luxury');
    setQuickSellChannel('Boutique Milano');
    setQuickSellPayment('Credit Card');
  };

  // Confirm Quick Sell Handler - Deducts Stock & Moves to Book of Sales
  const handleConfirmQuickSell = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickSellProduct) return;

    const product = quickSellProduct;
    const currentUnits = customStocks[product.id] !== undefined
      ? customStocks[product.id]
      : (product.stockQuantity !== undefined
          ? product.stockQuantity
          : Object.values(product.stock || {}).reduce((a: number, b: number) => a + b, 0));

    const validQty = Math.max(1, Math.min(quickSellQty, currentUnits > 0 ? currentUnits : quickSellQty));
    const remainingUnits = Math.max(0, currentUnits - validQty);

    // Update sizes stock breakdown
    const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['One Size'];
    let updatedStock: Record<string, number> = { ...(product.stock || {}) };
    const currentSizeQty = updatedStock[quickSellSize] || 0;

    if (currentSizeQty >= validQty) {
      updatedStock[quickSellSize] = currentSizeQty - validQty;
    } else {
      let remainingToDeduct = validQty;
      if (updatedStock[quickSellSize]) {
        remainingToDeduct -= updatedStock[quickSellSize];
        updatedStock[quickSellSize] = 0;
      }
      for (const s of sizes) {
        if (remainingToDeduct <= 0) break;
        if ((updatedStock[s] || 0) > 0) {
          const deduct = Math.min(updatedStock[s] || 0, remainingToDeduct);
          updatedStock[s] = (updatedStock[s] || 0) - deduct;
          remainingToDeduct -= deduct;
        }
      }
    }

    // Update product stock state & trigger persistence
    setCustomStocks(prev => ({ ...prev, [product.id]: remainingUnits }));
    const updatedProduct: Product = {
      ...product,
      stock: updatedStock,
      stockQuantity: remainingUnits,
      inStock: remainingUnits > 0
    };

    if (onUpdateProduct) {
      onUpdateProduct(updatedProduct);
    }

    // Determine manufacturing cost in USD base
    const baseUnitCostUSD = customCosts[product.id] !== undefined
      ? customCosts[product.id]
      : (product.costPrice ?? Math.round(product.price * 0.42));

    const unitPrice = product.price;
    const totalSale = unitPrice * validQty;
    const grossProfit = (unitPrice - baseUnitCostUSD) * validQty;
    const txId = `ALE-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTx: SaleTransaction = {
      id: txId,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      year: '2026',
      quarter: 'Q3',
      productName: product.name,
      productId: product.id,
      category: product.category,
      productImage: product.images[0] || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b',
      size: quickSellSize,
      color: product.colors[0]?.name || 'Classic',
      customerName: quickSellCustomer.trim() || (lang === 'es' ? 'Venta Directa en Tienda' : 'In-Store Client'),
      customerEmail: quickSellEmail.trim() || (lang === 'es' ? 'cliente.mostrador@ales.mx' : 'walkin.client@ales.luxury'),
      quantity: validQty,
      unitPrice,
      unitCost: baseUnitCostUSD,
      totalSale,
      grossProfit,
      paymentMethod: quickSellPayment,
      channel: quickSellChannel,
      status: 'Completed'
    };

    const updatedTransactions = [newTx, ...salesTransactions];
    saveSalesTransactions(updatedTransactions);
    setQuickSellProduct(null);

    // Show dynamic notification banner
    setSoldNotification({
      message: lang === 'es'
        ? `Pieza "${product.name}" (${validQty} ${validQty === 1 ? 'unidad' : 'unidades'}) marcada como VENDIDA y movida al Libro de Ventas.`
        : `Piece "${product.name}" (${validQty} pcs) marked as SOLD and moved to the Sales Ledger.`,
      txId: newTx.id,
      productName: product.name
    });
  };

  // Add Manual Sale Handler from Top Header
  const handleRegisterSale = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === newSaleProduct) || products[0];
    if (!prod) return;

    const currentUnits = customStocks[prod.id] !== undefined
      ? customStocks[prod.id]
      : (prod.stockQuantity !== undefined
          ? prod.stockQuantity
          : Object.values(prod.stock || {}).reduce((a: number, b: number) => a + b, 0));

    const validQty = Math.max(1, newSaleQty);
    const remainingUnits = Math.max(0, currentUnits - validQty);

    // Deduct size stock
    const sizes = prod.sizes && prod.sizes.length > 0 ? prod.sizes : ['One Size'];
    let updatedStock: Record<string, number> = { ...(prod.stock || {}) };
    const currentSizeQty = updatedStock[newSaleSize] || 0;

    if (currentSizeQty >= validQty) {
      updatedStock[newSaleSize] = currentSizeQty - validQty;
    } else {
      let remainingToDeduct = validQty;
      if (updatedStock[newSaleSize]) {
        remainingToDeduct -= updatedStock[newSaleSize];
        updatedStock[newSaleSize] = 0;
      }
      for (const s of sizes) {
        if (remainingToDeduct <= 0) break;
        if ((updatedStock[s] || 0) > 0) {
          const deduct = Math.min(updatedStock[s] || 0, remainingToDeduct);
          updatedStock[s] = (updatedStock[s] || 0) - deduct;
          remainingToDeduct -= deduct;
        }
      }
    }

    setCustomStocks(prev => ({ ...prev, [prod.id]: remainingUnits }));
    const updatedProduct: Product = {
      ...prod,
      stock: updatedStock,
      stockQuantity: remainingUnits,
      inStock: remainingUnits > 0
    };

    if (onUpdateProduct) {
      onUpdateProduct(updatedProduct);
    }

    const unitPrice = prod.price;
    const baseUnitCostUSD = customCosts[prod.id] !== undefined
      ? customCosts[prod.id]
      : (prod.costPrice ?? Math.round(unitPrice * 0.42));

    const totalSale = unitPrice * validQty;
    const grossProfit = (unitPrice - baseUnitCostUSD) * validQty;

    const newTx: SaleTransaction = {
      id: `ALE-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      year: '2026',
      quarter: 'Q3',
      productName: prod.name,
      productId: prod.id,
      category: prod.category,
      productImage: prod.images[0] || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b',
      size: newSaleSize,
      color: prod.colors[0]?.name || 'Classic',
      customerName: newSaleCustomer,
      customerEmail: newSaleEmail,
      quantity: validQty,
      unitPrice,
      unitCost: baseUnitCostUSD,
      totalSale,
      grossProfit,
      paymentMethod: newSalePayment,
      channel: newSaleChannel,
      status: 'Completed'
    };

    const updatedTransactions = [newTx, ...salesTransactions];
    saveSalesTransactions(updatedTransactions);
    setIsAddSaleOpen(false);

    setSoldNotification({
      message: lang === 'es'
        ? `Venta de "${prod.name}" (${validQty} ${validQty === 1 ? 'unidad' : 'unidades'}) registrada y guardada en el Libro de Ventas.`
        : `Sale of "${prod.name}" (${validQty} pcs) logged and recorded in the Sales Ledger.`,
      txId: newTx.id,
      productName: prod.name
    });
  };

  // ---------------------------------------------------------------------------
  // RESTRICTED ACCESS SCREEN
  // ---------------------------------------------------------------------------
  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white border border-[#1C1B20] p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-[#1C1B20] text-[#B88A58] flex items-center justify-center mx-auto border-2 border-[#B88A58]/40 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-[#B88A58] font-bold">
              {t.restrictedBadge}
            </p>
            <h2 className="font-serif text-2xl text-[#1C1B20]">
              {t.restrictedTitle}
            </h2>
            <p className="text-xs text-[#4A4947] leading-relaxed pt-2">
              {t.restrictedDesc}
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={onOpenLogin}
              className="w-full py-3.5 bg-[#1C1B20] text-white hover:bg-[#B88A58] transition-all text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ShieldCheck className="w-4 h-4 text-[#B88A58]" />
              <span>{t.signInDev}</span>
            </button>
            <p className="text-[11px] text-[#8C9083]">
              {t.loggedInAs} {currentUser ? currentUser.email : t.notLoggedInDev}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* EXECUTIVE HEADER WITH MODE SWITCHER */}
      <div className="bg-[#1C1B20] text-[#F4F0EA] p-6 sm:p-8 border-b-2 border-[#1C1B20] shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#B88A58] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#B88A58]" />
            <span>{t.adminControl} — Luis de la Rosa</span>
            <span className="bg-[#B88A58] text-white text-[9px] px-2 py-0.5 font-mono rounded-none">{t.devMode}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F4F0EA] font-light">
            {activeTab === 'sales'
              ? t.headerTitleSales
              : t.headerTitleInventory}
          </h1>
          <p className="text-xs text-[#A8A09B] max-w-2xl">
            {activeTab === 'sales'
              ? t.headerDescSales
              : t.headerDescInventory}
          </p>
        </div>

        {/* MODE SELECTOR TOGGLE BUTTONS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="inline-flex bg-[#2A2830] p-1.5 border border-[#3E3B46] rounded-sm shadow-inner">
            <button
              id="btn-tab-sales"
              onClick={() => setActiveTab('sales')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer rounded-xs ${
                activeTab === 'sales'
                  ? 'bg-[#B88A58] text-white shadow-sm'
                  : 'text-[#A8A09B] hover:text-white hover:bg-[#383540]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.tabSales}</span>
              <span className="bg-[#1C1B20] text-[#E8D0B5] text-[9px] px-1.5 py-0.5 font-mono">
                {salesTransactions.length}
              </span>
            </button>

            <button
              id="btn-tab-inventory"
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer rounded-xs ${
                activeTab === 'inventory'
                  ? 'bg-[#B88A58] text-white shadow-sm'
                  : 'text-[#A8A09B] hover:text-white hover:bg-[#383540]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{t.tabInventory}</span>
              <span className="bg-[#1C1B20] text-[#E8D0B5] text-[9px] px-1.5 py-0.5 font-mono">
                {products.length} SKUs
              </span>
            </button>
          </div>

          {activeTab === 'sales' ? (
            <button
              onClick={() => setIsAddSaleOpen(true)}
              className="px-4 py-2.5 bg-white text-[#1C1B20] hover:bg-[#B88A58] hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{t.logNewSale}</span>
            </button>
          ) : (
            onOpenAddProduct && (
              <button
                onClick={onOpenAddProduct}
                className="px-4 py-2.5 bg-[#B88A58] hover:bg-[#a17849] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addNewProduct}</span>
              </button>
            )
          )}

          <a
            href="/api/download-zip"
            download="maris-luxury-fashion-project.zip"
            title={lang === 'es' ? 'Descargar código fuente completo en archivo .ZIP' : 'Download complete source code as .ZIP'}
            className="px-4 py-2.5 bg-[#2A2830] hover:bg-[#3E3B46] text-[#E8D0B5] hover:text-white border border-[#4A4654] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
          >
            <Download className="w-4 h-4 text-[#B88A58]" />
            <span>{t.downloadZip}</span>
          </a>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: SALES MADE & TRANSACTIONS DASHBOARD
         ========================================================================= */}
      {activeTab === 'sales' && (
        <div className="space-y-8 animate-fadeIn">
          {/* SALES DASHBOARD KPI METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Sales Revenue */}
            <div className="p-6 bg-white border border-[#1C1B20] space-y-2 relative shadow-xs">
              <div className="flex items-center justify-between text-[#8C9083]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1B20]">{t.grossRevenue}</span>
                <DollarSign className="w-5 h-5 text-[#B88A58]" />
              </div>
              <div className="pt-1">
                <div className="text-3xl font-sans font-semibold tracking-tight text-[#1C1B20] tabular-nums">
                  {formatCurrency(salesMetrics.totalRevenue)}
                </div>
                <div className="text-xs text-[#4A4947] mt-1 flex items-center justify-between">
                  <span>{t.grossRevenueNote}</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +24.8% YoY
                  </span>
                </div>
              </div>
            </div>

            {/* Total Units Sold & Orders */}
            <div className="p-6 bg-white border border-[#1C1B20] space-y-2 relative shadow-xs">
              <div className="flex items-center justify-between text-[#8C9083]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1B20]">{t.unitsSold} &amp; {t.totalSalesLogged}</span>
                <ShoppingBag className="w-5 h-5 text-[#B88A58]" />
              </div>
              <div className="pt-1">
                <div className="text-3xl font-sans font-semibold tracking-tight text-[#1C1B20] tabular-nums">
                  {formatNumber(salesMetrics.totalUnitsSold)} <span className="text-sm font-normal text-[#8C9083]">pcs</span>
                </div>
                <div className="text-xs text-[#4A4947] mt-1 flex justify-between">
                  <span>{salesMetrics.transactionCount} {lang === 'es' ? 'pedidos completados' : 'completed orders'}</span>
                  <span className="font-semibold text-[#1C1B20]">Avg {Math.round(salesMetrics.totalUnitsSold / (salesMetrics.transactionCount || 1))} pcs/order</span>
                </div>
              </div>
            </div>

            {/* Total Net Gross Profit */}
            <div className="p-6 bg-white border border-[#1C1B20] space-y-2 relative shadow-xs">
              <div className="flex items-center justify-between text-[#8C9083]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1B20]">{t.netProfitMargin}</span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="pt-1">
                <div className="text-3xl font-sans font-semibold tracking-tight text-emerald-800 tabular-nums">
                  {formatCurrency(salesMetrics.totalProfit)}
                </div>
                <div className="text-xs text-[#4A4947] mt-1 flex items-center justify-between">
                  <span>{t.netProfitNote}:</span>
                  <span className="font-bold text-emerald-800 tabular-nums bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                    {salesMetrics.profitMarginPct}% Margin
                  </span>
                </div>
              </div>
            </div>

            {/* Average Order Value (AOV) */}
            <div className="p-6 bg-white border border-[#1C1B20] space-y-2 relative shadow-xs">
              <div className="flex items-center justify-between text-[#8C9083]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1B20]">{t.avgOrderValue}</span>
                <Receipt className="w-5 h-5 text-[#B88A58]" />
              </div>
              <div className="pt-1">
                <div className="text-3xl font-sans font-semibold tracking-tight text-[#1C1B20] tabular-nums">
                  {formatCurrency(salesMetrics.avgOrderValue)}
                </div>
                <div className="text-xs text-[#4A4947] mt-1 flex justify-between">
                  <span>{lang === 'es' ? 'Canal Principal:' : 'Top Channel:'}</span>
                  <span className="font-bold text-[#1C1B20]">Boutique Milano</span>
                </div>
              </div>
            </div>
          </div>

          {/* QUARTERLY SALES PERFORMANCE GRAPH */}
          <section className="bg-white border border-[#1C1B20] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1B20] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B88A58] font-bold">
                  <BarChart3 className="w-4 h-4" />
                  <span>{t.quarterlyBreakdown}</span>
                </div>
                <h2 className="font-serif text-2xl text-[#1C1B20] font-light mt-1">
                  {lang === 'es' ? `Rendimiento Trimestral de Ventas (${selectedYear})` : `Quarterly Sales Made Performance (${selectedYear})`}
                </h2>
              </div>

              {/* Year Filter Controls */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#1C1B20]">{t.fiscalYear}</span>
                <div className="inline-flex bg-white border border-[#1C1B20] p-1">
                  {(['2024', '2025', '2026', 'All'] as const).map(yr => (
                    <button
                      key={yr}
                      onClick={() => setSelectedYear(yr)}
                      className={`px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                        selectedYear === yr
                          ? 'bg-[#1C1B20] text-white'
                          : 'text-[#4A4947] hover:text-[#1C1B20]'
                      }`}
                    >
                      {yr === 'All' ? t.allYears : yr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quarterly Bar Chart */}
            <motion.div
              ref={barChartRef}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-80 w-full pt-2"
            >
              <ResponsiveContainer key={`sales-barchart-${selectedYear}`} width="100%" height="100%">
                <BarChart
                  data={quarterlySalesChartData}
                  margin={{ top: 25, right: 30, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#1C1B20', fontWeight: 600 }} stroke="#1C1B20" />
                  <YAxis tick={{ fontSize: 11, fill: '#1C1B20', fontWeight: 600 }} stroke="#1C1B20" tickFormatter={(val: number) => formatCompactCurrency(val)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1C1B20', color: '#F4F0EA', border: 'none', borderRadius: '0px', fontSize: '12px' }}
                    formatter={(val: any) => formatCurrency(val)}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="sales" name="Sales Made Revenue" fill="#1C1B20" isAnimationActive={true}>
                    <LabelList dataKey="sales" position="top" formatter={(val: number) => formatCompactCurrency(val)} style={{ fontSize: '10px', fontWeight: 700, fill: '#1C1B20' }} />
                  </Bar>
                  <Bar dataKey="cogs" name="COGS Cost" fill="#B88A58" isAnimationActive={true}>
                    <LabelList dataKey="cogs" position="top" formatter={(val: number) => formatCompactCurrency(val)} style={{ fontSize: '10px', fontWeight: 700, fill: '#B88A58' }} />
                  </Bar>
                  <Bar dataKey="profit" name="Net Profit" fill="#10B981" isAnimationActive={true}>
                    <LabelList dataKey="profit" position="top" formatter={(val: number) => formatCompactCurrency(val)} style={{ fontSize: '10px', fontWeight: 700, fill: '#047857' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </section>

          {/* SALES MADE PRODUCTS TABLE & SEARCH FILTERS */}
          <section className="bg-white border border-[#1C1B20] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C1B20] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B88A58] font-bold">
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.salesLedgerTitle}</span>
                </div>
                <h2 className="font-serif text-2xl text-[#1C1B20] font-light mt-1">
                  {lang === 'es' ? 'Productos Vendidos y Registro de Pedidos' : 'Sales Made Products & Client Orders Table'}
                </h2>
              </div>

              {/* Table Filters & Search */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9083]" />
                  <input
                    type="text"
                    value={salesSearch}
                    onChange={(e) => setSalesSearch(e.target.value)}
                    placeholder={t.searchTransactions}
                    className="pl-8 pr-3 py-1.5 bg-white border border-[#1C1B20] text-xs text-[#1C1B20] focus:outline-none focus:ring-1 focus:ring-[#1C1B20] w-56"
                  />
                </div>

                <select
                  value={salesQuarterFilter}
                  onChange={(e) => setSalesQuarterFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-[#1C1B20] text-xs text-[#1C1B20] focus:outline-none"
                >
                  <option value="All">{t.allQuarters}</option>
                  <option value="Q1">Q1 (Jan-Mar)</option>
                  <option value="Q2">Q2 (Apr-Jun)</option>
                  <option value="Q3">Q3 (Jul-Sep)</option>
                  <option value="Q4">Q4 (Oct-Dec)</option>
                </select>

                <select
                  value={salesCategoryFilter}
                  onChange={(e) => setSalesCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-[#1C1B20] text-xs text-[#1C1B20] focus:outline-none"
                >
                  <option value="All">{t.allCategories}</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Suits & Blazers">Suits &amp; Blazers</option>
                  <option value="Knitwear">Knitwear</option>
                  <option value="Trousers">Trousers</option>
                  <option value="Shirts & Silk">Shirts &amp; Silk</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>

                <select
                  value={salesChannelFilter}
                  onChange={(e) => setSalesChannelFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-[#1C1B20] text-xs text-[#1C1B20] focus:outline-none"
                >
                  <option value="All">{t.allChannels}</option>
                  <option value="Boutique Milano">Boutique Milano</option>
                  <option value="Online Store">Online Store</option>
                  <option value="Atelier Paris">Atelier Paris</option>
                  <option value="VIP Private Concierge">VIP Private Concierge</option>
                </select>
              </div>
            </div>

            {/* Sales Products Table */}
            <div className="overflow-x-auto border border-[#1C1B20] bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1C1B20] text-[#F4F0EA] uppercase text-[9px] tracking-wider border-b border-[#1C1B20] whitespace-nowrap font-bold">
                  <tr>
                    <th className="py-2.5 px-2 text-left">{t.colTxId} &amp; {t.colDateTime}</th>
                    <th className="py-2.5 px-2 text-left">{t.colProduct}</th>
                    <th className="py-2.5 px-2 text-left">{t.colCategory}</th>
                    <th className="py-2.5 px-2 text-left">{t.colClient}</th>
                    <th className="py-2.5 px-1 text-center">{t.colQty}</th>
                    <th className="py-2.5 px-2 text-right">{t.colUnitCost}</th>
                    <th className="py-2.5 px-2 text-right">{t.colTotalAmount}</th>
                    <th className="py-2.5 px-2 text-right">{lang === 'es' ? 'Ganancia Neta' : 'Net Profit'}</th>
                    <th className="py-2.5 px-2 text-left">{t.colChannel} &amp; {t.colPayment}</th>
                    <th className="py-2.5 px-1 text-center">{t.colStatus}</th>
                    <th className="py-2.5 px-1 text-center">{t.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1B20] text-[#1C1B20]">
                  {filteredSalesTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-6 text-center text-[#8C9083]">
                        {t.noSalesFound}
                      </td>
                    </tr>
                  ) : (
                    filteredSalesTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-[#F9F9F9] transition-colors">
                        <td className="py-2 px-2 whitespace-nowrap">
                          <span className="font-mono font-bold text-[#1C1B20] text-[11px] block">{tx.id}</span>
                          <span className="text-[9px] text-[#8C9083]">{tx.date}</span>
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={tx.productImage}
                              alt={tx.productName}
                              className="w-8 h-10 object-cover border border-[#1C1B20] shrink-0"
                            />
                            <div className="min-w-0 max-w-[150px]">
                              <span className="font-bold text-[#1C1B20] block text-[11px] truncate">{tx.productName}</span>
                              <div className="flex items-center gap-1.5 text-[9px] text-[#8C9083] truncate">
                                <span>{tx.size}</span>
                                <span>•</span>
                                <span className="truncate">{tx.color}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 bg-[#F9F9F9] border border-[#1C1B20] text-[9px] font-semibold text-[#1C1B20]">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <div className="min-w-0 max-w-[130px]">
                            <span className="font-semibold text-[#1C1B20] block text-[11px] truncate">{tx.customerName}</span>
                            <span className="text-[9px] text-[#8C9083] font-mono block truncate">{tx.customerEmail}</span>
                          </div>
                        </td>
                        <td className="py-2 px-1 text-center font-bold font-sans tabular-nums text-xs whitespace-nowrap">
                          {tx.quantity} pc
                        </td>
                        <td className="py-2 px-2 text-right font-sans font-semibold tabular-nums text-xs whitespace-nowrap">
                          {formatCurrency(tx.unitPrice)}
                        </td>
                        <td className="py-2 px-2 text-right font-sans font-bold text-[#1C1B20] tabular-nums text-xs whitespace-nowrap">
                          {formatCurrency(tx.totalSale)}
                        </td>
                        <td className="py-2 px-2 text-right font-sans font-bold text-emerald-800 tabular-nums text-xs whitespace-nowrap">
                          +{formatCurrency(tx.grossProfit)}
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap">
                          <span className="font-semibold text-[#1C1B20] block text-[10px] leading-tight">{tx.channel}</span>
                          <span className="text-[9px] text-[#8C9083] flex items-center gap-1">
                            <CreditCard className="w-2.5 h-2.5 text-[#B88A58]" />
                            <span className="truncate max-w-[100px]">{tx.paymentMethod}</span>
                          </span>
                        </td>
                        <td className="py-2 px-1 text-center whitespace-nowrap">
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold border ${
                            tx.status === 'Completed' || tx.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : tx.status === 'In Transit'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}>
                            {lang === 'es' && tx.status === 'Completed' ? 'Completado' : tx.status}
                          </span>
                        </td>
                        <td className="py-2 px-1 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setTransactionToDelete(tx)}
                            className="p-1 text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-xs transition-colors cursor-pointer inline-flex items-center justify-center shadow-2xs group"
                            title={lang === 'es' ? 'Eliminar transacción del libro de ventas' : 'Delete transaction from sales book'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary Bar */}
            <div className="bg-[#1C1B20] text-[#F4F0EA] p-4 flex flex-wrap items-center justify-between text-xs gap-4 font-mono">
              <div>
                <span>{lang === 'es' ? 'Pedidos Coincidentes: ' : 'Matching Orders: '}</span>
                <span className="font-bold text-[#E8D0B5]">{filteredSalesTransactions.length}</span>
              </div>
              <div>
                <span>{lang === 'es' ? 'Total Unidades Vendidas: ' : 'Total Units Sold: '}</span>
                <span className="font-bold text-[#E8D0B5]">{formatNumber(salesMetrics.totalUnitsSold)} pcs</span>
              </div>
              <div>
                <span>{lang === 'es' ? 'Ingresos Filtrados: ' : 'Filtered Sales Revenue: '}</span>
                <span className="font-bold text-white text-sm">{formatCurrency(salesMetrics.totalRevenue)}</span>
              </div>
              <div>
                <span>{lang === 'es' ? 'Ganancia Bruta Filtrada: ' : 'Filtered Gross Profit: '}</span>
                <span className="font-bold text-emerald-400 text-sm">{formatCurrency(salesMetrics.totalProfit)}</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =========================================================================
          TAB 2: INVENTORY QUANTITY & VALUATION PROJECTION INFORMATION
         ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-8 animate-fadeIn">
          {/* INVENTORY METRICS DASHBOARD CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total SKUs & Units */}
            <div className="p-6 bg-white border border-[#1C1B20] space-y-2 relative shadow-xs">
              <div className="flex items-center justify-between text-[#8C9083]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1B20]">{t.totalStockUnits}</span>
                <Package className="w-5 h-5 text-[#B88A58]" />
              </div>
              <div className="pt-1">
                <div className="text-3xl font-sans font-semibold tracking-tight text-[#1C1B20] tabular-nums">
                  {formatNumber(inventoryMetrics.totalUnitsInStore)} <span className="text-sm font-normal text-[#8C9083]">{lang === 'es' ? 'unidades' : 'units'}</span>
                </div>
                <div className="text-xs text-[#4A4947] mt-1 flex items-center justify-between">
                  <span>{inventoryMetrics.totalItemsCount} {lang === 'es' ? 'modelos registrados' : 'registered models'}</span>
                  <span className="text-emerald-700 font-semibold">{inventoryMetrics.totalUnitsInStore - inventoryMetrics.outOfStockCount} {lang === 'es' ? 'activos' : 'active'}</span>
                </div>
              </div>
            </div>

            {/* Total Inventory Cost */}
            <div className="p-6 bg-white border border-[#1C1B20] space-y-2 relative shadow-xs">
              <div className="flex items-center justify-between text-[#8C9083]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1B20]">{t.totalWholesaleCost}</span>
                <DollarSign className="w-5 h-5 text-[#B88A58]" />
              </div>
              <div className="pt-1">
                <div className="text-3xl font-sans font-semibold tracking-tight text-[#1C1B20] tabular-nums">
                  {formatCurrency(inventoryMetrics.totalInventoryCost)}
                </div>
                <div className="text-xs text-[#4A4947] mt-1">
                  {t.totalWholesaleNote}
                </div>
              </div>
            </div>

            {/* Retail Market Valuation */}
            <div className="p-6 bg-white border border-[#1C1B20] space-y-2 relative shadow-xs">
              <div className="flex items-center justify-between text-[#8C9083]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1B20]">{t.totalRetailValuation}</span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="pt-1">
                <div className="text-3xl font-sans font-semibold tracking-tight text-[#1C1B20] tabular-nums">
                  {formatCurrency(inventoryMetrics.totalRetailValuation)}
                </div>
                <div className="text-xs text-[#4A4947] mt-1 flex items-center justify-between">
                  <span>{t.potentialProfit}:</span>
                  <span className="font-bold text-emerald-800 tabular-nums">
                    +{inventoryMetrics.overallMarginPct}% ({formatCurrency(inventoryMetrics.grossProfitPotential)})
                  </span>
                </div>
              </div>
            </div>

            {/* Stock Health */}
            <div className="p-6 bg-white border border-[#1C1B20] space-y-2 relative shadow-xs">
              <div className="flex items-center justify-between text-[#8C9083]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C1B20]">{lang === 'es' ? 'Salud de Stock' : 'Stock Health'}</span>
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="pt-1">
                <div className="text-3xl font-sans font-semibold tracking-tight text-[#1C1B20] tabular-nums flex items-center gap-2">
                  <span>{formatNumber(inventoryMetrics.lowStockCount + inventoryMetrics.outOfStockCount)}</span>
                  <span className="text-xs font-sans text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-400 font-semibold">
                    {lang === 'es' ? 'Requiere Reabastecer' : 'Needs Restock'}
                  </span>
                </div>
                <div className="text-xs text-[#4A4947] mt-1 flex justify-between">
                  <span>{inventoryMetrics.lowStockCount} {lang === 'es' ? 'stock bajo' : 'low stock'}</span>
                  <span className="text-rose-700 font-semibold">{inventoryMetrics.outOfStockCount} {lang === 'es' ? 'agotados' : 'out of stock'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TIME-SERIES PROJECTION CHART STARTING TODAY */}
          <section className="bg-white border border-[#1C1B20] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1B20] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B88A58] font-bold">
                  <Calendar className="w-4 h-4" />
                  <span>{lang === 'es' ? 'Trayectoria de Inventario en Serie de Tiempo' : 'Time-Series Inventory Trajectory'}</span>
                </div>
                <h2 className="font-serif text-2xl text-[#1C1B20] font-light mt-1">
                  {lang === 'es' ? 'Proyección de Cantidad y Valoración de Inventario' : 'Inventory Quantity & Valuation Projection (Jul 2026 - Jan 2027)'}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#4A4947] bg-white px-3 py-1.5 border border-[#1C1B20]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1C1B20] inline-block"></span>
                <span className="font-semibold text-[#1C1B20]">{lang === 'es' ? 'Unidades en Stock' : 'Stock Units'}</span>
                <span className="w-2.5 h-2.5 border border-red-600 bg-red-100 inline-block ml-2"></span>
                <span className="font-semibold text-red-600">{lang === 'es' ? 'Valoración de Costo' : 'Cost Valuation'} ({currencySymbol})</span>
              </div>
            </div>

            <motion.div
              ref={lineChartRef}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-84 w-full pt-2"
            >
              <ResponsiveContainer key={`time-series-chart-${isLineChartInView}`} width="100%" height="100%">
                <ComposedChart
                  data={timeSeriesData}
                  margin={{ top: 30, right: 40, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#1C1B20', fontWeight: 600 }} stroke="#1C1B20" />
                  <YAxis yAxisId="left" orientation="left" stroke="#1C1B20" tick={{ fontSize: 11, fill: '#1C1B20', fontWeight: 600 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#DC2626" tick={{ fontSize: 11, fill: '#DC2626', fontWeight: 600 }} tickFormatter={(val: number) => formatCompactCurrency(val)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1C1B20', color: '#F4F0EA', border: 'none', borderRadius: '0px', fontSize: '12px' }}
                    formatter={(value: any, name: any) => [
                      name === 'costValuation' ? formatCurrency(value) : formatNumber(value),
                      name === 'costValuation' ? (lang === 'es' ? 'Valor de Costo' : 'Inventory Cost Value') : (lang === 'es' ? 'Unidades en Tienda' : 'Stock Units in Store')
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#1C1B20' }} />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="costValuation"
                    name={lang === 'es' ? 'Valoración de Costo ($)' : 'Cost Valuation ($)'}
                    fill="#DC2626"
                    stroke="#DC2626"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={0.12}
                    dot={{ r: 4, fill: '#DC2626' }}
                    isAnimationActive={true}
                  >
                    <LabelList
                      dataKey="costValuation"
                      position="top"
                      formatter={(val: number) => formatCompactCurrency(val)}
                      style={{ fontSize: '11px', fontWeight: 800, fill: '#DC2626' }}
                      dy={-8}
                    />
                  </Area>
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="unitsInStore"
                    name={lang === 'es' ? 'Unidades en Stock' : 'Stock Units'}
                    stroke="#1C1B20"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#1C1B20' }}
                    isAnimationActive={true}
                  >
                    <LabelList
                      dataKey="unitsInStore"
                      position="bottom"
                      formatter={(val: number) => `${formatNumber(val)} u`}
                      style={{ fontSize: '11px', fontWeight: 800, fill: '#1C1B20' }}
                      dy={14}
                    />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>
          </section>

          {/* IN-STORE CATALOG SKUs TABLE */}
          <section className="bg-white border border-[#1C1B20] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C1B20] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B88A58] font-bold">
                  <Layers className="w-4 h-4" />
                  <span>{t.physicalInventoryTitle}</span>
                </div>
                <h2 className="font-serif text-2xl text-[#1C1B20] font-light mt-1">
                  {t.physicalInventorySub}
                </h2>
              </div>

              {/* Table Search & Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9083]" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder={t.searchInventoryPlaceholder}
                    className="pl-8 pr-3 py-1.5 bg-white border border-[#1C1B20] text-xs text-[#1C1B20] focus:outline-none focus:ring-1 focus:ring-[#1C1B20] w-60"
                  />
                </div>

                <select
                  value={inventoryCategory}
                  onChange={(e) => setInventoryCategory(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-[#1C1B20] text-xs text-[#1C1B20] focus:outline-none"
                >
                  <option value="All">{t.allCategories}</option>
                  <option value="Outerwear">{getCategoryDisplayName('Outerwear', lang)}</option>
                  <option value="Suits & Blazers">{getCategoryDisplayName('Suits & Blazers', lang)}</option>
                  <option value="Knitwear">{getCategoryDisplayName('Knitwear', lang)}</option>
                  <option value="Trousers">{getCategoryDisplayName('Trousers', lang)}</option>
                  <option value="Shirts & Silk">{getCategoryDisplayName('Shirts & Silk', lang)}</option>
                  <option value="Shoes">{getCategoryDisplayName('Shoes', lang)}</option>
                  <option value="Accessories">{getCategoryDisplayName('Accessories', lang)}</option>
                  <option value="Miscellaneous">{getCategoryDisplayName('Miscellaneous', lang)}</option>
                </select>

                <select
                  value={inventoryStockFilter}
                  onChange={(e: any) => setInventoryStockFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-[#1C1B20] text-xs text-[#1C1B20] focus:outline-none"
                >
                  <option value="All">{t.allStockLevels}</option>
                  <option value="InStock">{t.inStockOption}</option>
                  <option value="Low">{t.lowStockOption}</option>
                  <option value="OutOfStock">{t.outOfStockOption}</option>
                </select>

                {isAuthorized && onDeleteAllProducts && products.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsDeleteAllModalOpen(true)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white border border-red-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.deleteAllItems}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Real-time Sync Status Notification Banner */}
            <div className="bg-[#FAF8F5] border border-[#1C1B20] p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#1C1B20] font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span className="font-bold">
                  {lang === 'es' ? 'Sincronización en Tiempo Real Activa:' : 'Real-Time Inventory Sync Active:'}
                </span>
                <span className="text-[#666562]">
                  {lang === 'es'
                    ? 'Las cantidades y costos de esta tabla se reflejan instantáneamente en el catálogo y detalle de prendas.'
                    : 'Quantities and costs in this ledger are instantly reflected across catalog and product pages.'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#8C9083]">
                <Boxes className="w-3.5 h-3.5 text-[#B88A58]" />
                <span>{inventoryMetrics.totalUnitsInStore} {lang === 'es' ? 'unidades totales en tienda' : 'total in-store units'}</span>
              </div>
            </div>

            {/* Notification Toast when a piece is sold and moved to Book of Sales */}
            {soldNotification && (
              <div className="bg-[#1C1B20] text-[#F4F0EA] p-4 border-2 border-[#B88A58] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#B88A58] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold text-[#B88A58] uppercase tracking-wider">
                      {lang === 'es' ? 'Venta Registrada con Éxito' : 'Sale Transaction Recorded'} — {soldNotification.txId}
                    </p>
                    <p className="text-xs text-[#F4F0EA] font-medium">
                      {soldNotification.message}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('sales');
                      setSalesSearch(soldNotification.productName);
                      setSoldNotification(null);
                    }}
                    className="px-3.5 py-1.5 bg-[#B88A58] hover:bg-[#a17849] text-white text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <span>{t.viewInSalesBook}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSoldNotification(null)}
                    className="p-1.5 text-[#A8A09B] hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Detailed Table */}
            <div className="overflow-x-auto border border-[#1C1B20] bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1C1B20] text-[#F4F0EA] uppercase text-[10px] tracking-wider border-b border-[#1C1B20] whitespace-nowrap font-bold">
                  <tr>
                    <th className="py-2.5 px-2 text-left">{t.colGarmentName}</th>
                    <th className="py-2.5 px-2 text-left">{t.colStockStatus}</th>
                    <th className="py-2.5 px-2 text-left">{t.colCategory}</th>
                    <th className="py-2.5 px-2 text-left">{t.colStockUnits}</th>
                    <th className="py-2.5 px-2 text-left">{t.colUnitCost}</th>
                    <th className="py-2.5 px-2 text-left">{t.colRetailPrice}</th>
                    <th className="py-2.5 px-2 text-left">{t.colTotalCostVal}</th>
                    <th className="py-2.5 px-2 text-left">{t.colTotalRetailVal}</th>
                    <th className="py-2.5 px-2 text-center">{t.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1B20] text-[#1C1B20]">
                  {filteredInventoryProducts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-[#8C9083]">
                        {t.noInventoryFound}
                      </td>
                    </tr>
                  ) : (
                    filteredInventoryProducts.map(p => {
                      const isExpanded = expandedSizesProductId === p.id;
                      const sizes = p.sizes && p.sizes.length > 0 ? p.sizes : ['One Size'];

                      return (
                        <React.Fragment key={p.id}>
                          <tr className="hover:bg-[#F9F9F9] transition-colors">
                            {/* 1. Garment Name */}
                            <td className="py-2 px-2 text-left">
                              <div className="flex items-center gap-2">
                                <img
                                  src={p.images[0] || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b'}
                                  alt={p.name}
                                  className="w-9 h-11 object-cover border border-[#1C1B20] shrink-0"
                                />
                                <div className="min-w-0 max-w-[150px]">
                                  <span className="font-bold text-[#1C1B20] block truncate text-xs">{p.name}</span>
                                  <span className="text-[10px] text-[#8C9083] font-mono block truncate">{p.id}</span>
                                </div>
                              </div>
                            </td>

                            {/* 2. Stock Status (Moved to left side) */}
                            <td className="py-2 px-2 text-left whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                {p.totalUnits > 0 ? (
                                  <>
                                    <select
                                      value="available"
                                      onChange={(e) => {
                                        if (e.target.value === 'sold') {
                                          handleOpenQuickSell(p);
                                        }
                                      }}
                                      className={`px-1.5 py-1 text-[11px] font-bold border rounded-xs cursor-pointer focus:outline-none transition-colors ${
                                        p.totalUnits <= 5
                                          ? 'bg-amber-50 text-amber-900 border-amber-300 hover:border-amber-500'
                                          : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:border-emerald-500'
                                      }`}
                                      title={lang === 'es' ? 'Cambiar estado de pieza (Disponible / Vendido)' : 'Change piece status (Available / Sold)'}
                                    >
                                      <option value="available">
                                        ● {t.availableState} ({p.totalUnits})
                                      </option>
                                      <option value="sold">
                                        ✓ {t.markAsSold} → {t.moveToSalesBook}
                                      </option>
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenQuickSell(p)}
                                      className="px-2 py-1 bg-[#1C1B20] hover:bg-[#B88A58] text-white text-[10px] font-bold uppercase tracking-wider rounded-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-2xs"
                                      title={lang === 'es' ? 'Marcar como vendido y mover a Libro de Ventas' : 'Mark as sold & move to Sales Book'}
                                    >
                                      <ShoppingBag className="w-3 h-3 text-[#E8D0B5]" />
                                      <span>{t.sellPiece}</span>
                                    </button>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 border border-zinc-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-zinc-500" />
                                      {t.soldOutOfStock}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveTab('sales');
                                        setSalesSearch(p.name);
                                      }}
                                      className="px-1.5 py-0.5 text-[10px] text-[#B88A58] hover:text-[#1C1B20] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                                      title={lang === 'es' ? 'Ver ventas de esta pieza en Libro de Ventas' : 'View sales in Book of Sales'}
                                    >
                                      {lang === 'es' ? 'Ver ventas' : 'View sales'} →
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* 3. Category */}
                            <td className="py-2 px-2 text-left whitespace-nowrap">
                              <span className="px-1.5 py-0.5 bg-[#F9F9F9] border border-[#1C1B20] text-[10px] font-semibold text-[#1C1B20] inline-block">
                                {getCategoryDisplayName(p.category, lang)}
                              </span>
                            </td>

                            {/* 4. Units in Store */}
                            <td className="py-2 px-2 text-left whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={p.totalUnits}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                    handleUpdateProductStockUnits(p, val);
                                  }}
                                  className="w-12 text-center py-0.5 px-0.5 bg-white border border-[#1C1B20] focus:outline-none font-sans font-bold tabular-nums focus:bg-amber-50 rounded-none text-xs"
                                  title="Edit total available stock units (Syncs in real-time)"
                                />
                                <span className="text-[10px] text-[#8C9083]">pcs</span>
                                <button
                                  type="button"
                                  onClick={() => setExpandedSizesProductId(isExpanded ? null : p.id)}
                                  className={`p-1 border transition-colors cursor-pointer rounded-xs text-[10px] flex items-center gap-0.5 ${
                                    isExpanded
                                      ? 'bg-[#1C1B20] text-white border-[#1C1B20]'
                                      : 'bg-[#FAF8F5] text-[#1C1B20] border-[#D5CECE] hover:border-[#1C1B20]'
                                  }`}
                                  title="Inspect / Edit Per-Size Stock Breakdown"
                                >
                                  <Boxes className="w-3 h-3 text-[#B88A58]" />
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              </div>
                            </td>

                            {/* 5. Unit Cost */}
                            <td className="py-2 px-2 text-left whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <span className="text-[#8C9083] font-sans font-medium text-xs">{currencySymbol}</span>
                                <input
                                  type="number"
                                  value={p.unitCost}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                    handleUpdateProductCost(p, val);
                                  }}
                                  className="w-14 text-right py-0.5 px-1 bg-white border border-[#1C1B20] focus:outline-none font-sans font-semibold tabular-nums focus:bg-amber-50 rounded-none text-xs"
                                  title="Edit unit manufacturing cost (Syncs in real-time)"
                                />
                              </div>
                            </td>

                            {/* 6. Retail Price */}
                            <td className="py-2 px-2 text-left font-sans font-semibold tabular-nums whitespace-nowrap text-xs">
                              {formatCurrency(p.retailPrice)}
                            </td>

                            {/* 7. Total Cost Value */}
                            <td className="py-2 px-2 text-left font-sans font-bold text-[#1C1B20] tabular-nums whitespace-nowrap text-xs">
                              {formatCurrency(p.totalCostValue)}
                            </td>

                            {/* 8. Total Retail Value */}
                            <td className="py-2 px-2 text-left font-sans font-semibold text-emerald-800 tabular-nums whitespace-nowrap text-xs">
                              {formatCurrency(p.totalRetailValue)}
                            </td>

                            {/* 9. Actions */}
                            <td className="py-2 px-2 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setExpandedSizesProductId(isExpanded ? null : p.id)}
                                  className="p-1 text-[#1C1B20] hover:bg-[#FAF8F5] border border-[#D5CECE] hover:border-[#1C1B20] rounded-xs transition-colors cursor-pointer"
                                  title="View size quantities"
                                >
                                  <Boxes className="w-3.5 h-3.5 text-[#B88A58]" />
                                </button>
                                {onEditProduct && (
                                  <button
                                    onClick={() => onEditProduct(p)}
                                    className="p-1 text-[#8C9083] hover:text-[#1C1B20] hover:bg-[#FAF8F5] border border-[#D5CECE] hover:border-[#1C1B20] rounded-xs transition-colors cursor-pointer"
                                    title="Edit full piece details"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {isAuthorized ? (
                                  <button
                                    type="button"
                                    onClick={() => setProductToDelete(p)}
                                    className="p-1 text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-xs transition-colors cursor-pointer"
                                    title={lang === 'es' ? 'Eliminar prenda permanentemente' : 'Delete piece permanently'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    className="p-1 text-zinc-300 border border-zinc-200 rounded-xs cursor-not-allowed opacity-40"
                                    title={lang === 'es' ? 'Acción restringida: solo luis.delarosacosio@gmail.com puede eliminar piezas' : 'Restricted action: only luis.delarosacosio@gmail.com can delete pieces'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Per-Size Slices Drawer Row */}
                          {isExpanded && (
                            <tr className="bg-[#FAF8F5] border-b border-[#1C1B20]">
                              <td colSpan={9} className="py-3 px-6">
                                <div className="p-3 bg-white border border-[#1C1B20] rounded-xs space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Boxes className="w-4 h-4 text-[#B88A58]" />
                                      <span className="text-xs font-bold text-[#1C1B20] uppercase font-mono tracking-wider">
                                        {lang === 'es' ? 'Desglose de Stock por Talla:' : 'Per-Size Stock Breakdown:'}
                                      </span>
                                      <span className="text-[11px] text-[#666562]">
                                        ({p.name} — {p.totalUnits} {lang === 'es' ? 'unidades totales' : 'total units'})
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                                      {lang === 'es' ? 'Sincronizado con Detalle de Prenda' : 'Live Sync with Product Detail Page'}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5 pt-1">
                                    {sizes.map((s) => {
                                      const sizeQty = (p.stock && p.stock[s] !== undefined)
                                        ? p.stock[s]
                                        : (p.stockQuantity !== undefined ? p.stockQuantity : 0);

                                      return (
                                        <div
                                          key={s}
                                          className="p-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xs flex flex-col justify-between gap-1.5"
                                        >
                                          <div className="flex justify-between items-center text-[11px] font-mono">
                                            <span className="font-bold text-[#1C1B20]">{s}</span>
                                            <span className={sizeQty > 0 ? 'text-[#B88A58]' : 'text-rose-600 font-bold'}>
                                              {sizeQty > 0 ? `${sizeQty} ${lang === 'es' ? 'disp.' : 'left'}` : (lang === 'es' ? 'Agotado' : 'Out')}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <button
                                              type="button"
                                              onClick={() => handleUpdateSingleSizeStock(p, s, Math.max(0, sizeQty - 1))}
                                              className="w-6 h-6 bg-white border border-[#1C1B20] hover:bg-[#1C1B20] hover:text-white text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                                              title="Decrease 1 unit"
                                            >
                                              -
                                            </button>
                                            <input
                                              type="number"
                                              value={sizeQty}
                                              onChange={(e) => {
                                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                                handleUpdateSingleSizeStock(p, s, val);
                                              }}
                                              className="flex-1 text-center py-0.5 px-1 bg-white border border-[#1C1B20] focus:outline-none font-mono text-xs font-bold tabular-nums"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => handleUpdateSingleSizeStock(p, s, sizeQty + 1)}
                                              className="w-6 h-6 bg-white border border-[#1C1B20] hover:bg-[#1C1B20] hover:text-white text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                                              title="Add 1 unit"
                                            >
                                              +
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* =========================================================================
          MODAL: QUICK SELL PIECE & MOVE TO BOOK OF SALES
         ========================================================================= */}
      {quickSellProduct && (() => {
        const p = quickSellProduct;
        const currentUnits = customStocks[p.id] !== undefined
          ? customStocks[p.id]
          : (p.stockQuantity !== undefined
              ? p.stockQuantity
              : Object.values(p.stock || {}).reduce((a: number, b: number) => a + b, 0));

        const baseUnitCost = customCosts[p.id] !== undefined
          ? customCosts[p.id]
          : (p.costPrice ?? Math.round(p.price * 0.42));

        const unitRetailDisplay = Math.round(p.price * rate);
        const unitCostDisplay = Math.round(baseUnitCost * rate);
        const unitProfitDisplay = unitRetailDisplay - unitCostDisplay;
        const totalSaleDisplay = unitRetailDisplay * quickSellQty;
        const totalProfitDisplay = unitProfitDisplay * quickSellQty;
        const sizes = p.sizes && p.sizes.length > 0 ? p.sizes : ['One Size'];
        const remainingAfter = Math.max(0, currentUnits - quickSellQty);

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white border-2 border-[#1C1B20] max-w-lg w-full p-6 sm:p-7 space-y-5 relative shadow-2xl">
              <button
                onClick={() => setQuickSellProduct(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#1C1B20] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#B88A58] uppercase">
                  <ShoppingBag className="w-4 h-4 text-[#B88A58]" />
                  <span>{t.quickSellModalBadge}</span>
                </div>
                <h3 className="font-serif text-2xl text-[#1C1B20]">{t.quickSellModalTitle}</h3>
                <p className="text-xs text-[#8C9083]">{t.quickSellModalDesc}</p>
              </div>

              {/* Garment Details Card */}
              <div className="p-3.5 bg-[#FAF8F5] border border-[#1C1B20] flex items-center gap-4">
                <img
                  src={p.images[0] || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b'}
                  alt={p.name}
                  className="w-14 h-16 object-cover border border-[#1C1B20] shrink-0"
                />
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-[#1C1B20] truncate">{p.name}</h4>
                    <span className="px-2 py-0.5 bg-white border border-[#1C1B20] text-[9px] font-bold text-[#1C1B20] shrink-0">
                      {getCategoryDisplayName(p.category, lang)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8C9083] font-mono">{p.id}</p>
                  <div className="flex items-center gap-3 text-xs pt-0.5">
                    <div>
                      <span className="text-[10px] text-[#8C9083] block">{lang === 'es' ? 'Precio Venta' : 'Retail Price'}</span>
                      <span className="font-bold text-[#1C1B20]">{formatCurrency(p.price)}</span>
                    </div>
                    <div className="border-l border-zinc-300 pl-3">
                      <span className="text-[10px] text-[#8C9083] block">{lang === 'es' ? 'Costo Unit.' : 'Unit Cost'}</span>
                      <span className="font-semibold text-zinc-700">{formatCurrency(baseUnitCost)}</span>
                    </div>
                    <div className="border-l border-zinc-300 pl-3">
                      <span className="text-[10px] text-[#8C9083] block">{lang === 'es' ? 'Margen Ganancia' : 'Profit'}</span>
                      <span className="font-bold text-emerald-800">+{formatCurrency(p.price - baseUnitCost)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form to confirm sale */}
              <form onSubmit={handleConfirmQuickSell} className="space-y-4 text-xs">
                {/* Quantity & Preset selector */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-[#1C1B20] uppercase text-[10px]">
                      {t.sellUnitsLabel}
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setQuickSellQty(1)}
                        className={`px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                          quickSellQty === 1
                            ? 'bg-[#1C1B20] text-white border-[#1C1B20]'
                            : 'bg-white text-[#1C1B20] border-[#D5CECE] hover:border-[#1C1B20]'
                        }`}
                      >
                        {t.quickSell1Unit}
                      </button>
                      {currentUnits > 1 && (
                        <button
                          type="button"
                          onClick={() => setQuickSellQty(currentUnits)}
                          className={`px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                            quickSellQty === currentUnits
                              ? 'bg-[#1C1B20] text-white border-[#1C1B20]'
                              : 'bg-white text-[#1C1B20] border-[#D5CECE] hover:border-[#1C1B20]'
                          }`}
                        >
                          {t.quickSellAllUnits} ({currentUnits})
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuickSellQty(Math.max(1, quickSellQty - 1))}
                      className="w-9 h-9 bg-[#FAF8F5] border border-[#1C1B20] hover:bg-[#1C1B20] hover:text-white font-bold text-base flex items-center justify-center cursor-pointer transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={currentUnits > 0 ? currentUnits : 999}
                      value={quickSellQty}
                      onChange={(e) => setQuickSellQty(Math.max(1, Math.min(currentUnits || 1, parseInt(e.target.value) || 1)))}
                      className="flex-1 h-9 text-center bg-white border border-[#1C1B20] font-sans font-bold text-sm text-[#1C1B20] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuickSellQty(Math.min(currentUnits || 1, quickSellQty + 1))}
                      className="w-9 h-9 bg-[#FAF8F5] border border-[#1C1B20] hover:bg-[#1C1B20] hover:text-white font-bold text-base flex items-center justify-center cursor-pointer transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1C1B20] uppercase text-[10px] mb-1">{t.sizeLabel}</label>
                    <select
                      value={quickSellSize}
                      onChange={(e) => setQuickSellSize(e.target.value)}
                      className="w-full p-2 bg-white border border-[#1C1B20] text-xs font-medium text-[#1C1B20]"
                    >
                      {sizes.map(sz => {
                        const szCount = p.stock?.[sz] ?? (p.stockQuantity ?? 0);
                        return (
                          <option key={sz} value={sz}>
                            {sz} ({szCount} {lang === 'es' ? 'disp.' : 'avail.'})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#1C1B20] uppercase text-[10px] mb-1">{t.channelLabel}</label>
                    <select
                      value={quickSellChannel}
                      onChange={(e: any) => setQuickSellChannel(e.target.value)}
                      className="w-full p-2 bg-white border border-[#1C1B20] text-xs text-[#1C1B20]"
                    >
                      <option value="Boutique Milano">Boutique Milano</option>
                      <option value="Online Store">Online Store</option>
                      <option value="Atelier Paris">Atelier Paris</option>
                      <option value="VIP Private Concierge">VIP Private Concierge</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1C1B20] uppercase text-[10px] mb-1">{t.clientNameLabel}</label>
                    <input
                      type="text"
                      required
                      value={quickSellCustomer}
                      onChange={(e) => setQuickSellCustomer(e.target.value)}
                      className="w-full p-2 bg-white border border-[#1C1B20] text-xs text-[#1C1B20]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1C1B20] uppercase text-[10px] mb-1">{t.paymentLabel}</label>
                    <select
                      value={quickSellPayment}
                      onChange={(e: any) => setQuickSellPayment(e.target.value)}
                      className="w-full p-2 bg-white border border-[#1C1B20] text-xs text-[#1C1B20]"
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="Apple Pay">Apple Pay</option>
                      <option value="Wire Transfer">Wire Transfer</option>
                      <option value="Amex Centurion">Amex Centurion</option>
                    </select>
                  </div>
                </div>

                {/* Financial calculations preview */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-300 space-y-1.5 rounded-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-950 uppercase text-[10px] tracking-wider">
                      {t.revenueSummary}
                    </span>
                    <span className="font-mono text-emerald-800 text-[11px] font-bold">
                      {quickSellQty} x {formatCurrency(p.price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-emerald-200/80 pt-1">
                    <span className="text-[#1C1B20] font-semibold">{lang === 'es' ? 'Total Venta a Registrar:' : 'Total Sale Logged:'}</span>
                    <span className="text-base font-sans font-bold text-emerald-900 tabular-nums">
                      {formatCurrency(p.price * quickSellQty)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-emerald-800">
                    <span>{t.grossProfitLabel}</span>
                    <span className="font-bold tabular-nums">+{formatCurrency((p.price - baseUnitCost) * quickSellQty)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-zinc-600 border-t border-emerald-200/60 pt-1">
                    <span>{t.remainingStockAfter}</span>
                    <span className={`font-bold ${remainingAfter === 0 ? 'text-rose-600' : 'text-[#1C1B20]'}`}>
                      {remainingAfter} {lang === 'es' ? 'unidades' : 'units'} {remainingAfter === 0 ? `(${t.soldOutOfStock})` : ''}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#1C1B20]">
                  <button
                    type="button"
                    onClick={() => setQuickSellProduct(null)}
                    className="px-4 py-2.5 border border-[#1C1B20] text-[#1C1B20] hover:bg-[#FAF8F5] font-bold text-xs uppercase cursor-pointer"
                  >
                    {t.btnCancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#1C1B20] hover:bg-[#B88A58] text-white font-bold text-xs uppercase transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4 text-[#E8D0B5]" />
                    <span>{t.confirmSellAndMoveBtn}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          MODAL: REGISTER NEW MANUAL SALE TRANSACTION
         ========================================================================= */}
      {isAddSaleOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border-2 border-[#1C1B20] max-w-lg w-full p-6 space-y-5 relative shadow-2xl">
            <button
              onClick={() => setIsAddSaleOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#1C1B20]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#B88A58] uppercase">
                <ShoppingBag className="w-4 h-4 text-[#B88A58]" />
                <span>{t.modalSaleBadge}</span>
              </div>
              <h3 className="font-serif text-2xl text-[#1C1B20]">{t.modalSaleTitle}</h3>
              <p className="text-xs text-[#8C9083]">{t.modalSaleDesc}</p>
            </div>

            <form onSubmit={handleRegisterSale} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1C1B20] uppercase text-[10px] mb-1">{t.selectPiece}</label>
                <select
                  value={newSaleProduct}
                  onChange={(e) => setNewSaleProduct(e.target.value)}
                  className="w-full p-2 bg-white border border-[#1C1B20] text-xs font-medium text-[#1C1B20]"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatCurrency(p.price)}) — {getCategoryDisplayName(p.category, lang)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1C1B20] uppercase text-[10px] mb-1">{t.sizeLabel}</label>
                  <select
                    value={newSaleSize}
                    onChange={(e) => setNewSaleSize(e.target.value)}
                    className="w-full p-2 bg-white border border-[#1C1B20] text-xs font-medium text-[#1C1B20]"
                  >
                    {['EU 46', 'EU 48', 'EU 50', 'EU 52', 'EU 54', 'One Size'].map(sz => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#1C1B20] uppercase text-[10px] mb-1">{t.quantityLabel}</label>
                  <input
                    type="number"
                    min={1}
                    value={newSaleQty}
                    onChange={(e) => setNewSaleQty(parseInt(e.target.value) || 1)}
                    className="w-full p-2 bg-white border border-[#1C1B20] text-xs font-bold text-[#1C1B20]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1C1B20] uppercase text-[10px] mb-1">{t.clientNameLabel}</label>
                  <input
                    type="text"
                    required
                    value={newSaleCustomer}
                    onChange={(e) => setNewSaleCustomer(e.target.value)}
                    className="w-full p-2 bg-white border border-[#1C1B20] text-xs text-[#1C1B20]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1C1B20] uppercase text-[10px] mb-1">{t.clientEmailLabel}</label>
                  <input
                    type="email"
                    required
                    value={newSaleEmail}
                    onChange={(e) => setNewSaleEmail(e.target.value)}
                    className="w-full p-2 bg-white border border-[#1C1B20] text-xs font-mono text-[#1C1B20]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1C1B20] uppercase text-[10px] mb-1">{t.channelLabel}</label>
                  <select
                    value={newSaleChannel}
                    onChange={(e: any) => setNewSaleChannel(e.target.value)}
                    className="w-full p-2 bg-white border border-[#1C1B20] text-xs text-[#1C1B20]"
                  >
                    <option value="Boutique Milano">Boutique Milano</option>
                    <option value="Online Store">Online Store</option>
                    <option value="Atelier Paris">Atelier Paris</option>
                    <option value="VIP Private Concierge">VIP Private Concierge</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#1C1B20] uppercase text-[10px] mb-1">{t.paymentLabel}</label>
                  <select
                    value={newSalePayment}
                    onChange={(e: any) => setNewSalePayment(e.target.value)}
                    className="w-full p-2 bg-white border border-[#1C1B20] text-xs text-[#1C1B20]"
                  >
                    <option value="Amex Centurion">Amex Centurion</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Wire Transfer">Wire Transfer</option>
                    <option value="Apple Pay">Apple Pay</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#1C1B20]">
                <button
                  type="button"
                  onClick={() => setIsAddSaleOpen(false)}
                  className="px-4 py-2 border border-[#1C1B20] text-[#1C1B20] font-bold text-xs uppercase"
                >
                  {t.btnCancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1C1B20] hover:bg-[#B88A58] text-white font-bold text-xs uppercase transition-colors"
                >
                  {t.btnRecordSale}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete All Items Confirmation Modal */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border-2 border-red-600 max-w-md w-full p-6 shadow-2xl space-y-4 rounded-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9]">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-serif text-lg font-bold text-[#1C1B20]">
                  {lang === 'es' ? 'Eliminar Todos los Artículos' : 'Delete All Inventory Items'}
                </h3>
              </div>
              <button
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="p-1 text-[#8C9083] hover:text-[#1C1B20] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-xs space-y-1">
              <p className="font-bold text-red-900 text-xs uppercase tracking-wider">
                {lang === 'es'
                  ? `${products.length} SKUs (${inventoryMetrics.totalUnitsInStore} unidades en tienda)`
                  : `${products.length} SKUs (${inventoryMetrics.totalUnitsInStore} total units in store)`}
              </p>
              <p className="text-xs text-red-800 leading-relaxed">
                {lang === 'es'
                  ? '¿Estás seguro de que deseas eliminar permanentemente todos los artículos del inventario y del catálogo? Esta acción vaciará toda la lista de productos.'
                  : 'Are you sure you want to permanently delete all items from the inventory and catalog? This action will clear all products.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E2D9]">
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="px-4 py-2 border border-[#D5CECE] hover:border-[#1C1B20] text-[#1C1B20] text-xs font-semibold uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
              >
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteAllProducts && isAuthorized) {
                    onDeleteAllProducts();
                  }
                  setIsDeleteAllModalOpen(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'es' ? 'Sí, Eliminar Todo' : 'Yes, Delete All'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Authorized Admin luis.delarosacosio@gmail.com */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border border-[#1C1B20] max-w-md w-full p-6 shadow-2xl space-y-4 rounded-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9]">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-serif text-lg font-bold text-[#1C1B20]">
                  {lang === 'es' ? 'Confirmar Eliminación' : 'Confirm Deletion'}
                </h3>
              </div>
              <button
                onClick={() => setProductToDelete(null)}
                className="p-1 text-[#8C9083] hover:text-[#1C1B20] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xs">
              <img
                src={productToDelete.images[0] || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b'}
                alt={productToDelete.name}
                className="w-12 h-14 object-cover border border-[#1C1B20] shrink-0"
              />
              <div className="min-w-0">
                <p className="font-bold text-[#1C1B20] text-sm truncate">{productToDelete.name}</p>
                <p className="text-xs text-[#8C9083] font-mono">{productToDelete.id}</p>
                <p className="text-xs text-[#B88A58] font-semibold">{formatCurrency(productToDelete.price)}</p>
              </div>
            </div>

            <p className="text-xs text-[#666562] leading-relaxed">
              {lang === 'es'
                ? '¿Estás seguro de que deseas eliminar permanentemente esta prenda del catálogo y del inventario? Esta acción no se puede deshacer.'
                : 'Are you sure you want to permanently delete this piece from the catalog and inventory? This action cannot be undone.'}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E2D9]">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 border border-[#D5CECE] hover:border-[#1C1B20] text-[#1C1B20] text-xs font-semibold uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
              >
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteProduct && isAuthorized) {
                    onDeleteProduct(productToDelete.id);
                  }
                  setProductToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'es' ? 'Sí, Eliminar' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Sale Transaction */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border-2 border-red-600 max-w-md w-full p-6 shadow-2xl space-y-4 rounded-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9]">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-serif text-lg font-bold text-[#1C1B20]">
                  {lang === 'es' ? 'Eliminar Registro de Venta' : 'Delete Sales Record'}
                </h3>
              </div>
              <button
                onClick={() => setTransactionToDelete(null)}
                className="p-1 text-[#8C9083] hover:text-[#1C1B20] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xs">
              <img
                src={transactionToDelete.productImage || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b'}
                alt={transactionToDelete.productName}
                className="w-12 h-14 object-cover border border-[#1C1B20] shrink-0"
              />
              <div className="min-w-0">
                <p className="font-bold text-[#1C1B20] text-sm truncate">{transactionToDelete.productName}</p>
                <p className="text-xs text-[#8C9083] font-mono">{transactionToDelete.id} • {transactionToDelete.date}</p>
                <p className="text-xs text-[#B88A58] font-semibold">
                  {formatCurrency(transactionToDelete.totalSale)} ({transactionToDelete.quantity} {transactionToDelete.quantity === 1 ? 'pc' : 'pcs'})
                </p>
                <p className="text-[11px] text-[#4A4947] truncate">{transactionToDelete.customerName}</p>
              </div>
            </div>

            <p className="text-xs text-[#666562] leading-relaxed">
              {lang === 'es'
                ? '¿Estás seguro de que deseas eliminar permanentemente este registro del Libro de Ventas y Transacciones? Esta acción recalculará los ingresos y métricas financieras.'
                : 'Are you sure you want to permanently delete this record from the Sales and Transactions Book? This action will recalculate revenue and financial metrics.'}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E2D9]">
              <button
                type="button"
                onClick={() => setTransactionToDelete(null)}
                className="px-4 py-2 border border-[#D5CECE] hover:border-[#1C1B20] text-[#1C1B20] text-xs font-semibold uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
              >
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSaleTransaction(transactionToDelete.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'es' ? 'Sí, Eliminar' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
