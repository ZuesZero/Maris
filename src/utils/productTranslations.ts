import { Product, Category } from '../types';
import { Language } from '../data/translations';

export const CATEGORY_TRANSLATIONS: Record<Category, Record<Language, string>> = {
  'Outerwear': { en: 'Outerwear', es: 'Abrigos' },
  'Suits & Blazers': { en: 'Suits & Blazers', es: 'Trajes y Blazers' },
  'Knitwear': { en: 'Knitwear', es: 'Punto y Cashmere' },
  'Trousers': { en: 'Trousers', es: 'Pantalones' },
  'Shirts & Silk': { en: 'Shirts & Silk', es: 'Camisas' },
  'Shoes': { en: 'Shoes', es: 'Calzado' },
  'Accessories': { en: 'Accessories', es: 'Accesorios' },
  'Miscellaneous': { en: 'Miscellaneous', es: 'Misceláneos' }
};

export const COLOR_TRANSLATIONS: Record<string, string> = {
  'Oatmeal Melange': 'Mezcla de Avena',
  'Midnight Obsidian': 'Obsidiana Nocturna',
  'Warm Camel': 'Camel Cálido',
  'Charcoal Tweed': 'Tweed Carbón',
  'Oatmeal Cream': 'Crema de Avena',
  'Sage Clay': 'Arcilla Salvia',
  'Espresso Earth': 'Tierra Café',
  'Pristine Cream': 'Crema Impoluto',
  'Natural Sand': 'Arena Natural',
  'Navy Cashmere': 'Azul Marino Cashmere',
  'Taupe Tweed': 'Tweed Topo',
  'Olive Clay': 'Arcilla Oliva',
  'Cognac Suede': 'Gamuza Coñac',
  'Bordeaux Wine': 'Vino Burdeos',
  'Ivory Silk': 'Seda Marfil',
  'Anthracite Grey': 'Gris Antracita',
  'Mocha Brown': 'Marrón Moca',
  'Honey Toffee': 'Miel Toffee',
  'Black': 'Negro',
  'White': 'Blanco',
  'Red': 'Rojo',
  'Blue': 'Azul',
  'Navy': 'Azul Marino',
  'Grey': 'Gris',
  'Gray': 'Gris',
  'Gold': 'Dorado',
  'Silver': 'Plateado',
  'Beige': 'Beige',
  'Brown': 'Marrón',
  'Green': 'Verde'
};

interface ProductSpanishData {
  name: string;
  subtitle: string;
  category?: Category;
  description: string;
  fabricDetails: string[];
  garmentCare: string[];
  shippingInfo: string;
}

export const PRODUCT_SPANISH_DATA: Record<string, ProductSpanishData> = {
  'sculpted-cashmere-overcoat': {
    name: 'El Abrigo Esculpido de Cashmere',
    subtitle: 'Cashmere virgen Loro Piana de doble faz con solapas acabadas a mano',
    description: 'Corte arquitectónico diseñado para caer sin esfuerzo sobre los hombros. El Abrigo Esculpido de Cashmere ejemplifica el compromiso de Mari con el esencialismo puro. Confeccionado en Biella, Italia, en cashmere virgen 100% de doble faz, esta silueta sin forro ofrece una calidez excepcional con sorprendente ligereza.',
    fabricDetails: [
      '100% Cashmere Virgen de Doble Faz de Biella, Italia',
      'Puntadas artesanalmente elaboradas en las solapas de pico',
      'Botones de cuerno de búfalo genuino con monograma AL grabado',
      'Bolsillo interior oculto para pasaporte con forro de seda'
    ],
    garmentCare: [
      'Lave exclusivamente en tintorería especializada',
      'No lavar a mano ni usar secadora',
      'Planchado a vapor suave por el reverso',
      'Guardar en percha de cedro acolchada en su funda incluida'
    ],
    shippingInfo: 'Envío Exprés Gratuito Internacional (2-4 días hábiles). Incluye funda protectora y percha de madera.'
  },
  'double-breasted-wool-blazer': {
    name: 'Saco Cruzado de Lana Super 130s',
    subtitle: 'Hombros estructurados con caída en lana italiana Super 130s',
    description: 'Confeccionado en lana peinada transpirable italiana Super 130s, este saco cruzado fusiona la sastrería tradicional con proporciones relajadas y modernas. Incluye entretela suave de lienzo y solapas de pico.',
    fabricDetails: [
      '100% Lana Peinada Super 130s',
      'Construcción interior completa en lienzo artesanal',
      'Forro jacquard de cupro con monograma grabado de Mari',
      'Puños con cuatro botones no funcionales estilo kissing buttons'
    ],
    garmentCare: [
      'Solo limpieza en seco',
      'Vaporizar suavemente para eliminar arrugas',
      'Guardar colgado en funda textil'
    ],
    shippingInfo: 'Envío Exprés Gratuito en 2-3 días hábiles.'
  },
  'chunky-ribbed-turtleneck': {
    name: 'Cuello Alto Acanalado Arquitectónico',
    subtitle: 'Tejido grueso en cashmere mongol de calibre 7',
    description: 'Hilandera de fibra larga Grado A de cashmere mongol. Este cuello alto de calibre 7 cuenta con una estructura firme que mantiene su forma impecable sin doblarse ni ceder.',
    fabricDetails: [
      '100% Cashmere Mongol Grado A',
      'Puntada acanalada de alto gramaje calibre 7',
      'Cuerpo sin costuras tubulares',
      'Puños dobles acanalados y dobladillo holgado'
    ],
    garmentCare: [
      'Lavar a mano en agua fría con champú suave para cashmere',
      'Secar extendido sobre una toalla blanca limpia',
      'No escurrir ni colgar húmedo'
    ],
    shippingInfo: 'Envío Exprés Gratuito en 2-3 días hábiles.'
  },
  'tailored-flannel-trousers': {
    name: 'Pantalón de Franela con Pinzas',
    subtitle: 'Talle alto estructurado en lana Vitale Barberis de Italia',
    description: 'Diseñado con dos pinzas profundas orientadas hacia adelante y pretina extendida. Estos pantalones de franela de lana caen con fluidez mientras mantienen un quiebre impecable.',
    fabricDetails: [
      '100% Franela de Lana Merino Fina',
      'Doble pinza frontal profunda',
      'Ajustadores laterales con hebillas de cuerno plateadas',
      'Dobladillo sin terminar listo para sastrería a medida'
    ],
    garmentCare: [
      'Solo limpieza en seco',
      'Planchar la raya usando paño de protección'
    ],
    shippingInfo: 'Envío Exprés Gratuito en 2-3 días hábiles.'
  },
  'silk-poplin-shirt': {
    name: 'Camisa Minimalista de Popelina de Seda',
    subtitle: 'Seda Mulberry pura con tapeta oculta de madreperla',
    description: 'Piedra angular del guardarropa esencial de Mari. Tejida en popelina de seda Mulberry de 19 momme para un brillo sutil, con tapeta oculta y cuello italiano impecable.',
    fabricDetails: [
      '100% Seda Pura Mulberry (19 Momme)',
      'Abotonadura frontal oculta con botones de Madreperla Australiana',
      'Costuras francesas en toda la prenda',
      'Dobladillo curvo para usar fajada o desfajada'
    ],
    garmentCare: [
      'Lavar a mano en frío o tintorería',
      'Plancha a baja temperatura en ajuste de seda'
    ],
    shippingInfo: 'Envío Exprés Gratuito en 2-3 días hábiles.'
  },
  'minimalist-leather-tote': {
    name: 'Bolso de Viaje Arquitectónico en Cuero',
    subtitle: 'Piel de ternero toscano de flor entera con interior de gamuza',
    description: 'Hecho a mano en Florencia utilizando cuero de ternero toscano curtido vegetal. Diseñado con paneles exteriores limpios y herrajes de latón cepillado, hechos para envejecer hermosamente.',
    fabricDetails: [
      '100% Piel de Ternero Florentino Flor Entera',
      'Interior de gamuza natural sin forro',
      'Acabado de cantos pintado a mano',
      'Correa acolchada para hombro y llavero desmontables'
    ],
    garmentCare: [
      'Tratar periódicamente con bálsamo acondicionador para cuero',
      'Mantener alejado del calor directo y la humedad'
    ],
    shippingInfo: 'Envío Exprés Gratuito en caja de regalo forrada en terciopelo.'
  },
  'cashmere-fringed-scarf': {
    name: 'Estola Gruesa de Cashmere',
    subtitle: 'Envolvente oversize con flecos en cashmere escocés puro',
    description: 'Tejida en telares tradicionales de Hawick, Escocia. Esta generosa estola de cashmere cuenta con flecos retorcidos a mano y un sutil acabado de gotas de agua.',
    fabricDetails: [
      '100% Cashmere Puro Escocés',
      'Dimensiones: 200cm x 70cm',
      'Bordes con flecos retorcidos a mano'
    ],
    garmentCare: [
      'Limpieza en seco o lavado a mano en frío',
      'Secar extendido horizontalmente'
    ],
    shippingInfo: 'Envío Exprés Gratuito.'
  },
  'silk-slip-dress': {
    name: 'Vestido Midi de Seda al Sesgo',
    subtitle: 'Corte al sesgo en seda Mulberry de 22 momme con tirantes finos',
    description: 'Cortado al sesgo para rozar fluidamente el cuerpo sin ceñir excesivamente. Incluye tirantes tubulares ultra finos de seda y un escote drapeado.',
    fabricDetails: [
      '100% Seda Mulberry Pesada (22 Momme)',
      'Trazado de precisión al sesgo',
      'Reguladores de tirantes ocultos'
    ],
    garmentCare: [
      'Lavar a mano en frío con jabón para seda',
      'Planchar a vapor por el reverso'
    ],
    shippingInfo: 'Envío Exprés Gratuito.'
  },
  'structured-alpaca-coat': {
    name: 'Abrigo de Alpaca Baby Unibotón',
    subtitle: 'Alpaca baby peruana no teñida con botones de cuerno y solapa de muesca',
    description: 'Confeccionado en corte clásico de abotonadura sencilla con fibras naturales de alpaca baby. De tacto sedoso con drapeado y calidez excepcionales.',
    fabricDetails: [
      '100% Alpaca Baby Peruana No Teñida',
      'Cierre frontal con botones de cuerno natural',
      'Forro interior de cupro satinado'
    ],
    garmentCare: [
      'Limpieza en seco especializada',
      'Guardar en percha de cedro estructurada'
    ],
    shippingInfo: 'Envío Exprés Internacional Gratuito.'
  },
  'cashmere-relaxed-cardigan': {
    name: 'Cárdigan Arquitectónico de Cashmere',
    subtitle: 'Tejido holgado calibre 5 de cashmere escocés con botones de cuerno',
    description: 'Básico atemporal para superponer capas, tejido en grueso cashmere escocés calibre 5. Diseñado con hombros caídos y bolsillos vivos.',
    fabricDetails: [
      '100% Cashmere Escocés Puro',
      'Botones de cuerno genuino de búfalo',
      'Cuello, puños y dobladillo acanalados'
    ],
    garmentCare: [
      'Lavar a mano en frío o tintorería',
      'Secar extendido'
    ],
    shippingInfo: 'Envío Exprés Gratuito.'
  },
  'tailored-linen-trouser': {
    name: 'Pantalón Recto de Crepe Seda y Lana',
    subtitle: 'Pantalón de talle alto en crepe italiano de seda y lana',
    description: 'Fluido y refinado, este pantalón de crepe de seda y lana ofrece una caída elevada ideal para ocasiones de gala y noche.',
    fabricDetails: [
      '60% Seda Mulberry, 40% Lana Peinada Virgen',
      'Detalle de pinza frontal única',
      'Cierre lateral oculto y pretina de cuerno'
    ],
    garmentCare: [
      'Solo limpieza en seco',
      'Vaporizar suavemente'
    ],
    shippingInfo: 'Envío Exprés Gratuito.'
  },
  'handcrafted-leather-loafers': {
    name: 'Mocasines Venecianos de Cuero Minimalistas',
    subtitle: 'Piel de ternero florentino cosida a mano con suela de cuero',
    description: 'Elaborados artesanalmente en Toscana por maestros zapateros, con plantilla de piel suave sin forro y suela de cuero con costura Blake para una elegancia impecable.',
    fabricDetails: [
      '100% Piel de Ternero Florentino Flor Entera',
      'Construcción artesanal tipo Blake-welt',
      'Tacón de cuero superpuesto con tapa de goma'
    ],
    garmentCare: [
      'Limpiar con paño suave y húmedo',
      'Aplicar acondicionador neutro para piel'
    ],
    shippingInfo: 'Envío Exprés Gratuito en bolsa protectora.'
  },
  'artisan-suede-chelsea-boots': {
    name: 'Botas Chelsea Artesanales de Gamuza Aterciopelada',
    subtitle: 'Gamuza toscana hidrófuga con construcción flexible tipo Blake',
    description: 'Silueta elegante esculpida sobre una horma italiana tradicional. Confeccionado en gamuza toscana aterciopelada con tratamiento repelente al agua y elásticos tonales para un ajuste impecable.',
    fabricDetails: [
      '100% Gamuza de Becerro Toscana Hidrorrepelente',
      'Forro interior de piel de ternera ultra suave',
      'Suela de cuero natural cosida artesanalmente'
    ],
    garmentCare: [
      'Cepillar con cerdas suaves para gamuza',
      'Aplicar spray protector contra lluvia'
    ],
    shippingInfo: 'Envío Exprés Gratuito con funda y hormas de cedro.'
  },
  'bespoke-calfskin-oxfords': {
    name: 'Zapatos Oxford Cap-Toe de Piel de Becerro Florentina',
    subtitle: 'Piel de becerro francesa con pátina a mano y suelas cosidas Goodyear',
    description: 'El pináculo del refinamiento formal. Pátina artesanal elaborada en Florencia sobre piel de becerro francesa con suela Goodyear para una durabilidad distinguida de por vida.',
    fabricDetails: [
      '100% Box Calf Francés de Primera Selección',
      'Construcción artesanal Goodyear Welted',
      'Puntera pulida a mano con brillo espejo'
    ],
    garmentCare: [
      'Nutrir con crema de cera de abeja natural',
      'Guardar siempre con hormas de madera de cedro'
    ],
    shippingInfo: 'Envío Exprés Gratuito con hormas de cedro incluidas.'
  },
  'handcrafted-toquilla-straw-fedora': {
    name: 'Sombrero Fedora de Paja Toquilla Artesanal',
    subtitle: 'Paja Toquilla ecuatoriana tejida a mano con cinta de seda grosgrain',
    description: 'Meticulosamente tejido a mano por maestros artesanos ecuatorianos con fibras seleccionadas de palma Toquilla Grado 8. Presenta copa clásica gota de lágrima, ala estructurada y cinta grosgrain italiana azul marino.',
    fabricDetails: [
      '100% Paja de Palma Toquilla Ecuatoriana Fina (Grado 8)',
      'Tejido natural transpirable con protección solar UPF 50+',
      'Cinta de grosgrain italiana teñida a mano con monograma sutil',
      'Banda interior de algodón acolchada absorbente'
    ],
    garmentCare: [
      'Evitar sumergir en agua o exponer a lluvia torrencial',
      'Limpiar con un paño ligeramente húmedo',
      'Guardar en lugar fresco y seco dentro de su sombrerera rígida'
    ],
    shippingInfo: 'Envío Exprés Gratuito en sombrerera rígida redonda insignia de Mari.'
  },
  'atelier-sculptural-ceramic-vessel': {
    name: 'Vaso Escultórico Artesanal de Cerámica del Atelier',
    subtitle: 'Cerámica de arcilla volcánica torneada a mano con esmalte mate texturizado',
    description: 'Moldeado y torneado individualmente en nuestro taller artesanal asociado en Umbría, Italia. Esta pieza escultórica de gres volcánico está diseñada para aportar serenidad arquitectónica y una presencia orgánica al hogar o estudio moderno.',
    fabricDetails: [
      '100% Gres Volcánico Italiano de Alta Temperatura',
      'Esmalte feldespático mate seguro para alimentos aplicado a mano',
      'Sello de origen del atelier grabado en la base sin esmaltar',
      'Capacidad: 420ml / Dimensiones: 12cm x 9.5cm'
    ],
    garmentCare: [
      'Apto para lavavajillas, se recomienda lavado a mano con jabón suave',
      'Manipular con delicadeza sobre superficies de piedra o cristal',
      'Apto para microondas en temperaturas moderadas'
    ],
    shippingInfo: 'Empacado en estuche de pulpa moldeada de archivo con amortiguación y certificado de autenticidad.'
  }
};

export function getTranslatedProduct(product: Product, language: Language | string = 'en'): Product {
  if (language !== 'es') {
    return product;
  }

  const spanishData = PRODUCT_SPANISH_DATA[product.id];

  const translatedColors = product.colors.map(c => ({
    ...c,
    name: COLOR_TRANSLATIONS[c.name] || c.name
  }));

  if (spanishData) {
    return {
      ...product,
      name: spanishData.name,
      subtitle: spanishData.subtitle,
      description: spanishData.description,
      fabricDetails: spanishData.fabricDetails,
      garmentCare: spanishData.garmentCare,
      shippingInfo: spanishData.shippingInfo,
      colors: translatedColors
    };
  }

  // Fallback for custom added products if spanishData is not present
  return {
    ...product,
    colors: translatedColors
  };
}

export function getCategoryDisplayName(category: Category | string, language: Language | string = 'en'): string {
  const langKey = language === 'es' ? 'es' : 'en';
  return CATEGORY_TRANSLATIONS[category as Category]?.[langKey] || category;
}
