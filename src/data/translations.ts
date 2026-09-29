export type Language = 'en' | 'es';

export interface Translations {
  // Top ticker
  tickerShipping: string;
  tickerShowrooms: string;

  // Navbar
  navHome: string;
  navCollection: string;
  navEditorial: string;
  navStylist: string;
  navInventory: string;
  navUsers: string;
  searchPlaceholder: string;
  searchButton: string;
  aiSearchLabel: string;
  aiSearchPlaceholder: string;
  voiceSearchStart: string;
  voiceSearchListening: string;
  aiSearchingBtn: string;
  bagLabel: string;

  // Hero Section
  heroBadge: string;
  heroTitleLine1: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  heroDiscover: string;
  heroViewOvercoat: string;
  heroScroll: string;
  switchLanguageLabel: string;

  // Core Values
  valuesLabel: string;
  valuesTitle: string;
  valuesSubtitle: string;
  value1Title: string;
  value1Desc: string;
  value2Title: string;
  value2Desc: string;
  value3Title: string;
  value3Desc: string;

  // Masterpieces / Catalog Preview
  essentialsLabel: string;
  essentialsTitle: string;
  categoryAll: string;
  categoryOuterwear: string;
  categorySuits: string;
  categoryKnitwear: string;
  categoryTrousers: string;
  categoryAccessories: string;
  categoryMiscellaneous: string;
  badgeNewArrival: string;
  badgeBestseller: string;
  quickView: string;
  exploreCatalog: string;

  // Editorial Volume III
  editorialLabel: string;
  editorialTitle: string;
  editorialQuote: string;
  editorialDirector: string;
  editorialStylistBtn: string;

  // Testimonials
  testimonialsLabel: string;
  testimonialsTitle: string;
  testimonial1Comment: string;
  testimonial2Comment: string;
  testimonial3Comment: string;

  // Footer
  footerWorldwideTitle: string;
  footerWorldwideDesc: string;
  footerArtisanshipTitle: string;
  footerArtisanshipDesc: string;
  footerReturnsTitle: string;
  footerReturnsDesc: string;
  footerBrandDesc: string;
  footerConsultConcierge: string;
  footerCollectionsHeader: string;
  footerClientServicesHeader: string;
  footerJoinCircleHeader: string;
  footerJoinCircleDesc: string;
  footerEmailPlaceholder: string;
  footerWelcomeCircle: string;
  footerRights: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    tickerShipping: "COMPLIMENTARY WORLDWIDE EXPRESS SHIPPING OVER $500",
    tickerShowrooms: "MILAN & PARIS BESPOKE SHOWROOM APPOINTMENTS AVAILABLE",

    navHome: "Home",
    navCollection: "Collection",
    navEditorial: "Editorial",
    navStylist: "AI Bespoke Stylist",
    navInventory: "Inventory & Sales",
    navUsers: "Users Directory",
    searchPlaceholder: "Search cashmere, silk, outerwear, trousers...",
    searchButton: "Search",
    aiSearchLabel: "AI Product & Voice Search Assistant",
    aiSearchPlaceholder: "Ask AI or speak: e.g. 'Warm cashmere coat for cold Zurich evening'...",
    voiceSearchStart: "Click mic for Voice Search",
    voiceSearchListening: "Listening... Speak your style request now",
    aiSearchingBtn: "AI Search",
    bagLabel: "BAG",

    heroBadge: "Autumn 2026 Collection",
    heroTitleLine1: "The Art of",
    heroTitleHighlight: "Essentialism",
    heroSubtitle: "Architectural silhouettes crafted in Biella from double-faced Loro Piana virgin cashmere and unadorned Scottish yarns. Quiet luxury redefined.",
    heroDiscover: "Discover Collection",
    heroViewOvercoat: "View Hero Overcoat",
    heroScroll: "Scroll to explore",
    switchLanguageLabel: "Language",

    valuesLabel: "Mari's Core Values",
    valuesTitle: "Quiet Confidence & Provenance",
    valuesSubtitle: "Every garment in Mari's house is drafted with structural restraint. We reject fast trend cycles in favor of pure form, hand-tailored comfort, and immortal materials.",
    value1Title: "Sculptural Tailoring",
    value1Desc: "Unstructured shoulder draping, hidden mother-of-pearl plackets, and forward pleats created to align effortlessly with natural human posture.",
    value2Title: "Loro Piana & Scottish Yarns",
    value2Desc: "Exclusively sourcing double-faced virgin cashmere from Biella and 7-gauge Grade-A Mongolian cashmere spun in Hawick, Scotland.",
    value3Title: "Ethical Transparency",
    value3Desc: "Every piece is hand-finished by master artisans in small family-owned Italian ateliers under strict fair wage and zero-waste commitments.",

    essentialsLabel: "Seasonal Essentials",
    essentialsTitle: "Curated Masterpieces",
    categoryAll: "All",
    categoryOuterwear: "Outerwear",
    categorySuits: "Suits & Blazers",
    categoryKnitwear: "Knitwear",
    categoryTrousers: "Trousers",
    categoryAccessories: "Accessories",
    categoryMiscellaneous: "Miscellaneous",
    badgeNewArrival: "NEW ARRIVAL",
    badgeBestseller: "BESTSELLER",
    quickView: "View Details",
    exploreCatalog: "Explore Entire Catalog",

    editorialLabel: "Editorial Volume III",
    editorialTitle: "Movement & Structure",
    editorialQuote: '"We believe true luxury is quiet. It is found in the weight of raw unbleached cashmere resting on the neck, in the seamless French stitching of Mulberry silk, and in silhouettes that move with unstudied grace."',
    editorialDirector: "Creative Director, Milan",
    editorialStylistBtn: "Ask AI Stylist For Look Suggestions",

    testimonialsLabel: "Client Reflections",
    testimonialsTitle: "Words From Our Global Patrons",
    testimonial1Comment: '"Mari\'s cashmere overcoat is standard-setting. The unlined double-faced construction makes it feel weightless, yet it withstands Swiss winters easily."',
    testimonial2Comment: '"The bespoke packaging and personal handwritten card made unboxing feel like receiving a couture gift from an old friend in Milan."',
    testimonial3Comment: '"Subtle, flawless pleating on the flannel trousers. Mari\'s has redefined how I build my permanent wardrobe."',

    footerWorldwideTitle: "Express Worldwide Delivery",
    footerWorldwideDesc: "Complimentary air courier on orders over $500. Fully insured transit with bespoke tracking.",
    footerArtisanshipTitle: "Ethical Italian Artisanship",
    footerArtisanshipDesc: "100% traceable virgin cashmere, organic mulberry silk, and florentine vegetable-tanned leather.",
    footerReturnsTitle: "Complimentary Returns",
    footerReturnsDesc: "14-day door-to-door courier pick up for easy size adjustments and returns.",
    footerBrandDesc: "Quiet elegance. Architectural precision. Hand-cut and sewn in historic Italian ateliers for those who value essential perfection over transient noise.",
    footerConsultConcierge: "Consult AI Concierge",
    footerCollectionsHeader: "Collections",
    footerClientServicesHeader: "Client Concierge",
    footerJoinCircleHeader: "Join The Inner Circle",
    footerJoinCircleDesc: "Receive private invitations to seasonal trunk shows, limited fabric runs, and capsule releases.",
    footerEmailPlaceholder: "Enter your email address",
    footerWelcomeCircle: "Welcome to Mari's Inner Circle. You will receive private previews directly in your inbox.",
    footerRights: "MARI'S CLOTHING BRAND. ALL RIGHTS RESERVED."
  },
  es: {
    tickerShipping: "ENVÍO EXPRÉS GRATUITO A TODO EL MUNDO EN PEDIDOS SUPERIORES A $500",
    tickerShowrooms: "CITAS DISPONIBLES EN NUESTROS SHOWROOMS DE MILÁN Y PARÍS",

    navHome: "Inicio",
    navCollection: "Colección",
    navEditorial: "Editorial",
    navStylist: "Estilista IA Personalizado",
    navInventory: "Inventario y Ventas",
    navUsers: "Directorio de Usuarios",
    searchPlaceholder: "Buscar cashmere, seda, abrigos, pantalones...",
    searchButton: "Buscar",
    aiSearchLabel: "Asistente de Búsqueda IA y Voz para Productos",
    aiSearchPlaceholder: "Consulta a la IA o habla: p. ej. 'Abrigo de cashmere para noche fría'...",
    voiceSearchStart: "Haz clic en el micrófono para Búsqueda por Voz",
    voiceSearchListening: "Escuchando... Di tu solicitud de prenda ahora",
    aiSearchingBtn: "Búsqueda IA",
    bagLabel: "BOLSA",

    heroBadge: "Colección Otoño 2026",
    heroTitleLine1: "El Arte del",
    heroTitleHighlight: "Esencialismo",
    heroSubtitle: "Siluetas arquitectónicas confeccionadas en Biella con cashmere virgen de doble faz Loro Piana e hilados escoceses puros. Lujo silencioso redefinido.",
    heroDiscover: "Descubrir Colección",
    heroViewOvercoat: "Ver Abrigo Principal",
    heroScroll: "Desliza para explorar",
    switchLanguageLabel: "Idioma",

    valuesLabel: "Valores Fundamentales de Mari",
    valuesTitle: "Confianza Discreta y Procedencia",
    valuesSubtitle: "Cada prenda en la casa de Mari se diseña con sobriedad estructural. Rechazamos las modas efímeras a favor de formas puras, comodidad hecha a mano y materiales inmortales.",
    value1Title: "Sastrería Escultural",
    value1Desc: "Caídas de hombros desestructuradas, tapetas ocultas de madreperla y pliegues diseñados para alinearse naturalmente con la postura corporal.",
    value2Title: "Hilados Loro Piana y Escoceses",
    value2Desc: "Suministro exclusivo de cashmere virgen de doble faz de Biella y cashmere mongol Grado A tejido en Hawick, Escocia.",
    value3Title: "Transparencia Ética",
    value3Desc: "Cada pieza es acabada a mano por maestros artesanos en pequeños talleres italianos familiares bajo salarios justos y compromiso de cero desperdicios.",

    essentialsLabel: "Esenciales de Temporada",
    essentialsTitle: "Obras Maestras Curadas",
    categoryAll: "Todos",
    categoryOuterwear: "Abrigos",
    categorySuits: "Trajes y Blazers",
    categoryKnitwear: "Punto y Cashmere",
    categoryTrousers: "Pantalones",
    categoryAccessories: "Accesorios",
    categoryMiscellaneous: "Misceláneos",
    badgeNewArrival: "NUEVO",
    badgeBestseller: "MÁS VENDIDO",
    quickView: "Ver Detalles",
    exploreCatalog: "Explorar Catálogo Completo",

    editorialLabel: "Editorial Volumen III",
    editorialTitle: "Movimiento y Estructura",
    editorialQuote: '"Creemos que el verdadero lujo es silencioso. Se encuentra en el peso del cashmere virgen descansando sobre el cuello, en las costuras francesas de la seda Mulberry y en siluetas que se mueven con gracia natural."',
    editorialDirector: "Director Creativo, Milán",
    editorialStylistBtn: "Pedir Sugerencias de Look a la IA",

    testimonialsLabel: "Reflexiones de Clientes",
    testimonialsTitle: "Palabras de Nuestros Clientes Internacionales",
    testimonial1Comment: '"El abrigo de cashmere de Mari marca un estándar único. La construcción de doble faz sin forro lo hace liviano y extremadamente cálido para los inviernos suizos."',
    testimonial2Comment: '"El empaque personalizado y la carta escrita a mano hicieron que desempaquetar fuera como recibir un regalo de alta costura de un viejo amigo en Milán."',
    testimonial3Comment: '"Los pliegues en los pantalones de franela son sutiles e impecables. Mari ha redefinido la forma en que construyo mi guardarropa permanente."',

    footerWorldwideTitle: "Envío Exprés Internacional",
    footerWorldwideDesc: "Envío aéreo gratuito en pedidos superiores a $500. Tránsito asegurado con seguimiento personalizado.",
    footerArtisanshipTitle: "Artesanía Italiana Ética",
    footerArtisanshipDesc: "Cashmere virgen 100% trazable, seda orgánica Mulberry y cuero florentino curtido vegetal.",
    footerReturnsTitle: "Devoluciones Gratuitas",
    footerReturnsDesc: "Recogida a domicilio en 14 días para ajustes de talla y devoluciones sin complicaciones.",
    footerBrandDesc: "Elegancia discreta. Precisión arquitectónica. Cortado y cosido a mano en talleres históricos italianos para quienes valoran la perfección esencial.",
    footerConsultConcierge: "Consultar Concierge IA",
    footerCollectionsHeader: "Colecciones",
    footerClientServicesHeader: "Atención al Cliente",
    footerJoinCircleHeader: "Únete al Círculo Exclusivo",
    footerJoinCircleDesc: "Recibe invitaciones privadas a desfiles de temporada, tiradas de telas limitadas y cápsulas exclusivas.",
    footerEmailPlaceholder: "Ingresa tu correo electrónico",
    footerWelcomeCircle: "Bienvenido al Círculo Exclusivo de Mari. Recibirás avances privados directamente en tu bandeja de entrada.",
    footerRights: "MARI'S CLOTHING BRAND. TODOS LOS DERECHOS RESERVADOS."
  }
};
