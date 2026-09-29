import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 'sculpted-cashmere-overcoat',
    name: "The Sculpted Cashmere Overcoat",
    subtitle: "Double-faced Loro Piana virgin cashmere with hand-finished lapels",
    price: 2450,
    category: 'Outerwear',
    colors: [
      { name: 'Oatmeal Melange', hex: '#D8CFB9' },
      { name: 'Midnight Obsidian', hex: '#1C1B20' },
      { name: 'Warm Camel', hex: '#B88A58' },
      { name: 'Sage Clay', hex: '#8C9083' },
      { name: 'Navy Cashmere', hex: '#1A2433' }
    ],
    sizes: ['EU 46', 'EU 48', 'EU 50', 'EU 52', 'EU 54'],
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1200&auto=format&fit=crop'
    ],
    description: "Architecturally cut to drape effortlessly across the shoulders, The Sculpted Cashmere Overcoat exemplifies Mari's commitment to pure essentialism. Tailored in Biella, Italy using 100% double-faced virgin cashmere, this unlined silhouette offers uncompromised warmth with surprising weightlessness.",
    fabricDetails: [
      "100% Double-Faced Virgin Cashmere from Biella, Italy",
      "Hand-stitched pick detailing along peak lapels",
      "Genuine Buffalo Horn Buttons with engraved AL logo",
      "Concealed inner passport pocket with silk lining"
    ],
    garmentCare: [
      "Specialist dry clean only",
      "Do not wash or tumble dry",
      "Gentle steam press on reverse side",
      "Store on contoured wooden cedar hanger in supplied garment bag"
    ],
    shippingInfo: "Complimentary Worldwide Express Courier delivery (2-4 business days). Includes bespoke dust cover and wooden garment hanger.",
    isNewArrival: true,
    isBestseller: true,
    isFeatured: true,
    stock: {
      'EU 46': 4,
      'EU 48': 2,
      'EU 50': 5,
      'EU 52': 3,
      'EU 54': 1
    },
    reviews: [
      {
        id: 'r1',
        author: "Julian V.",
        location: "Zurich, Switzerland",
        rating: 5,
        date: "October 14, 2024",
        title: "Sublime craftsmanship and silhouette",
        comment: "The weight and hand-feel of this cashmere coat exceed even Savoy Row standards. The shoulder line drapes like bespoke architecture. Truly a lifetime piece.",
        verified: true
      },
      {
        id: 'r2',
        author: "Elena M.",
        location: "Milan, Italy",
        rating: 5,
        date: "November 02, 2024",
        title: "Understated perfection",
        comment: "Bought EU 48 for an oversized structured look. The hand-finished edges and unlined comfort make this my most cherished winter mantle.",
        verified: true
      }
    ],
    completeTheLookIds: ['chunky-ribbed-turtleneck', 'tailored-flannel-trousers', 'minimalist-leather-tote']
  },
  {
    id: 'double-breasted-wool-blazer',
    name: "Double-Breasted Wool Blazer",
    subtitle: "Structured shoulders with Italian Super 130s wool drape",
    price: 1650,
    category: 'Suits & Blazers',
    colors: [
      { name: 'Midnight Obsidian', hex: '#1C1B20' },
      { name: 'Charcoal Tweed', hex: '#3E3D40' },
      { name: 'Navy Cashmere', hex: '#1A2433' },
      { name: 'Warm Camel', hex: '#B88A58' },
      { name: 'Taupe Tweed', hex: '#8A7D70' }
    ],
    sizes: ['EU 46', 'EU 48', 'EU 50', 'EU 52', 'EU 54'],
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop'
    ],
    description: "Crafted from breathable Italian Super 130s worsted wool, this double-breasted blazer merges sharp traditional tailoring with relaxed modern proportions. Features sculpted soft canvas interlining and peak lapels.",
    fabricDetails: [
      "100% Super 130s Worsted Wool",
      "Full canvas interior construction",
      "Cupro jacquard lining with tonal Mari's monogram",
      "Four non-functional kissing button cuffs"
    ],
    garmentCare: [
      "Dry clean only",
      "Steam gently to smooth creases",
      "Store hung in garment bag"
    ],
    shippingInfo: "Complimentary Express Delivery within 2-3 business days.",
    isNewArrival: false,
    isBestseller: true,
    isFeatured: true,
    stock: {
      'EU 46': 2,
      'EU 48': 6,
      'EU 50': 4,
      'EU 52': 1,
      'EU 54': 3
    },
    reviews: [
      {
        id: 'r3',
        author: "Marcus T.",
        location: "London, UK",
        rating: 5,
        date: "September 28, 2024",
        title: "Impeccable cut",
        comment: "The button placement creates an elongated waist silhouette. Perfect for evening galas or formal meetings.",
        verified: true
      }
    ],
    completeTheLookIds: ['tailored-flannel-trousers', 'silk-poplin-shirt']
  },
  {
    id: 'chunky-ribbed-turtleneck',
    name: "Architectural Ribbed Turtleneck",
    subtitle: "Heavyweight 7-gauge Mongolian cashmere knit",
    price: 820,
    category: 'Knitwear',
    colors: [
      { name: 'Oatmeal Cream', hex: '#ECE3D4' },
      { name: 'Sage Clay', hex: '#8C9083' },
      { name: 'Espresso Earth', hex: '#3B2F2F' },
      { name: 'Midnight Obsidian', hex: '#1C1B20' },
      { name: 'Warm Camel', hex: '#B88A58' }
    ],
    sizes: ['EU 46', 'EU 48', 'EU 50', 'EU 52', 'EU 54'],
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608234807905-4466023792f5?q=80&w=1200&auto=format&fit=crop'
    ],
    description: "Spun from long-staple Grade-A Mongolian cashmere yarns, this 7-gauge turtleneck features a structured high neck that maintains its clean shape without folding or sagging.",
    fabricDetails: [
      "100% Grade-A Mongolian Cashmere",
      "7-gauge heavyweight ribbed stitch",
      "Seamless tubular body construction",
      "Ribbed turn-up cuffs and relaxed hem"
    ],
    garmentCare: [
      "Hand wash cold with delicate cashmere wool shampoo",
      "Dry flat on clean white towel",
      "Do not wring or hang dry"
    ],
    shippingInfo: "Complimentary Express Delivery within 2-3 business days.",
    isNewArrival: true,
    isBestseller: false,
    isFeatured: true,
    stock: {
      'EU 46': 5,
      'EU 48': 4,
      'EU 50': 2,
      'EU 52': 3,
      'EU 54': 2
    },
    reviews: [
      {
        id: 'r4',
        author: "Sophie K.",
        location: "Stockholm, Sweden",
        rating: 5,
        date: "November 10, 2024",
        title: "Warmth without bulk",
        comment: "The softest cashmere knit in my collection. Fits effortlessly under Mari's sculpted overcoat.",
        verified: true
      }
    ],
    completeTheLookIds: ['sculpted-cashmere-overcoat', 'tailored-flannel-trousers']
  },
  {
    id: 'tailored-flannel-trousers',
    name: "Pleated Flannel Trousers",
    subtitle: "High-waisted silhouette in Italian Vitale Barberis wool",
    price: 680,
    category: 'Trousers',
    colors: [
      { name: 'Oatmeal Melange', hex: '#D8CFB9' },
      { name: 'Charcoal Tweed', hex: '#3E3D40' },
      { name: 'Midnight Obsidian', hex: '#1C1B20' },
      { name: 'Warm Camel', hex: '#B88A58' },
      { name: 'Sage Clay', hex: '#8C9083' }
    ],
    sizes: ['EU 46', 'EU 48', 'EU 50', 'EU 52', 'EU 54'],
    images: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200&auto=format&fit=crop'
    ],
    description: "Designed with deep double forward pleats and an extended tab waistband, these wool flannel trousers drape with fluidity while holding a crisp leg crease.",
    fabricDetails: [
      "100% Fine Merino Wool Flannel",
      "Deep forward double pleats",
      "Side waist adjusters with silver horn buckles",
      "Unfinished hems ready for custom tailoring"
    ],
    garmentCare: [
      "Dry clean only",
      "Press crease using press cloth"
    ],
    shippingInfo: "Complimentary Express Delivery within 2-3 business days.",
    isNewArrival: false,
    isBestseller: true,
    isFeatured: false,
    stock: {
      'EU 46': 3,
      'EU 48': 5,
      'EU 50': 4,
      'EU 52': 2,
      'EU 54': 1
    },
    reviews: [],
    completeTheLookIds: ['double-breasted-wool-blazer', 'silk-poplin-shirt']
  },
  {
    id: 'silk-poplin-shirt',
    name: "Minimalist Silk Poplin Shirt",
    subtitle: "Pure Mulberry silk with hidden mother-of-pearl placket",
    price: 520,
    category: 'Shirts & Silk',
    colors: [
      { name: 'Pristine Cream', hex: '#F7F5EE' },
      { name: 'Midnight Obsidian', hex: '#1C1B20' },
      { name: 'Sage Clay', hex: '#8C9083' },
      { name: 'Oatmeal Melange', hex: '#D8CFB9' },
      { name: 'Navy Cashmere', hex: '#1A2433' }
    ],
    sizes: ['EU 46', 'EU 48', 'EU 50', 'EU 52', 'EU 54'],
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1200&auto=format&fit=crop'
    ],
    description: "An essential cornerstone of the Mari's wardrobe. Woven from 19 momme Mulberry silk poplin for a subtle lustrous finish, featuring a hidden placket and tailored point collar.",
    fabricDetails: [
      "100% Pure Mulberry Silk (19 Momme)",
      "Concealed button front with Australian Mother-of-Pearl buttons",
      "French seams throughout",
      "Curved hem for tucked or untucked styling"
    ],
    garmentCare: [
      "Hand wash cold or dry clean",
      "Cool iron on silk setting"
    ],
    shippingInfo: "Complimentary Express Delivery within 2-3 business days.",
    isNewArrival: true,
    isBestseller: false,
    isFeatured: false,
    stock: {
      'EU 46': 6,
      'EU 48': 3,
      'EU 50': 5,
      'EU 52': 4,
      'EU 54': 2
    },
    reviews: [],
    completeTheLookIds: ['double-breasted-wool-blazer', 'tailored-flannel-trousers']
  },
  {
    id: 'minimalist-leather-tote',
    name: "Architectural Leather Weekender",
    subtitle: "Full-grain Tuscan calfskin with raw suede interior",
    price: 1450,
    category: 'Accessories',
    colors: [
      { name: 'Midnight Obsidian', hex: '#1C1B20' },
      { name: 'Warm Camel', hex: '#B88A58' },
      { name: 'Espresso Earth', hex: '#3B2F2F' },
      { name: 'Cognac Suede', hex: '#9E5B32' },
      { name: 'Oatmeal Melange', hex: '#D8CFB9' }
    ],
    sizes: ['One Size'],
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1200&auto=format&fit=crop'
    ],
    description: "Hand-crafted in Florence using vegetable-tanned Tuscan calf leather. Designed with clean unadorned exterior panels and brushed brass hardware, engineered to age beautifully over time.",
    fabricDetails: [
      "100% Full-Grain Florentine Calfskin Leather",
      "Unlined raw suede interior finish",
      "Hand-painted edge finishing",
      "Detachable padded shoulder strap and key lanyard"
    ],
    garmentCare: [
      "Treat periodically with leather balm",
      "Keep away from direct heat and water"
    ],
    shippingInfo: "Complimentary Express Delivery in signature velvet lined gift box.",
    isNewArrival: true,
    isBestseller: true,
    isFeatured: true,
    stock: {
      'One Size': 4
    },
    reviews: [
      {
        id: 'r5',
        author: "Henri D.",
        location: "Paris, France",
        rating: 5,
        date: "October 05, 2024",
        title: "Sensational leather scent and structure",
        comment: "Holds shape even when empty. Fits a laptop, wash bag, and cashmere throw easily.",
        verified: true
      }
    ],
    completeTheLookIds: ['sculpted-cashmere-overcoat', 'cashmere-fringed-scarf']
  },
  {
    id: 'cashmere-fringed-scarf',
    name: "Heavy Cashmere Stole",
    subtitle: "Over-sized fringed wrap in pure Scottish cashmere",
    price: 490,
    category: 'Accessories',
    colors: [
      { name: 'Oatmeal Melange', hex: '#D8CFB9' },
      { name: 'Sage Clay', hex: '#8C9083' },
      { name: 'Midnight Obsidian', hex: '#1C1B20' },
      { name: 'Warm Camel', hex: '#B88A58' },
      { name: 'Charcoal Tweed', hex: '#3E3D40' }
    ],
    sizes: ['One Size'],
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=1200&auto=format&fit=crop'
    ],
    description: "Woven on traditional looms in Hawick, Scotland, this generous cashmere stole features hand-twisted fringe details and a ripples-and-water teardrop finish.",
    fabricDetails: [
      "100% Pure Scottish Cashmere",
      "Dimensions: 200cm x 70cm",
      "Hand-twisted fringed edges"
    ],
    garmentCare: [
      "Dry clean or hand wash cold",
      "Lay flat to dry"
    ],
    shippingInfo: "Complimentary Express Shipping.",
    isNewArrival: false,
    isBestseller: false,
    isFeatured: false,
    stock: {
      'One Size': 8
    },
    reviews: [],
    completeTheLookIds: ['sculpted-cashmere-overcoat', 'minimalist-leather-tote']
  },
  {
    id: 'silk-slip-dress',
    name: "Architectural Silk Midi Slip",
    subtitle: "Bias-cut 22 momme Mulberry silk with minimal straps",
    price: 780,
    category: 'Shirts & Silk',
    colors: [
      { name: 'Midnight Obsidian', hex: '#1C1B20' },
      { name: 'Pristine Cream', hex: '#F7F5EE' },
      { name: 'Sage Clay', hex: '#8C9083' },
      { name: 'Espresso Earth', hex: '#3B2F2F' },
      { name: 'Bordeaux Wine', hex: '#4A1521' }
    ],
    sizes: ['EU 46', 'EU 48', 'EU 50', 'EU 52'],
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1200&auto=format&fit=crop'
    ],
    description: "Cut on the bias to fluidly skim the body without cling. Features ultra-fine tubular silk shoulder straps and a gentle cowl neckline.",
    fabricDetails: [
      "100% Heavyweight Mulberry Silk (22 Momme)",
      "Bias-cut precision drafting",
      "Adjustable hidden shoulder sliders"
    ],
    garmentCare: [
      "Hand wash cold using silk wash",
      "Steam gently on reverse side"
    ],
    shippingInfo: "Complimentary Express Shipping.",
    isNewArrival: true,
    isBestseller: true,
    isFeatured: false,
    stock: {
      'EU 46': 3,
      'EU 48': 2,
      'EU 50': 4,
      'EU 52': 1
    },
    reviews: [],
    completeTheLookIds: ['sculpted-cashmere-overcoat', 'minimalist-leather-tote']
  },
  {
    id: 'structured-alpaca-coat',
    name: "Single-Breasted Baby Alpaca Coat",
    subtitle: "Undyed Peruvian baby alpaca with horn buttons and notched lapel",
    price: 2180,
    category: 'Outerwear',
    colors: [
      { name: 'Oatmeal Melange', hex: '#D8CFB9' },
      { name: 'Espresso Earth', hex: '#3B2F2F' },
      { name: 'Warm Camel', hex: '#B88A58' },
      { name: 'Midnight Obsidian', hex: '#1C1B20' },
      { name: 'Charcoal Tweed', hex: '#3E3D40' }
    ],
    sizes: ['EU 46', 'EU 48', 'EU 50', 'EU 52', 'EU 54'],
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop'
    ],
    description: "Tailored in a single-breasted classic silhouette from naturally thermal baby alpaca fibers. Silky to touch with exceptional drape and warmth.",
    fabricDetails: [
      "100% Undyed Peruvian Baby Alpaca",
      "Natural horn button closure",
      "Satin cupro interior lining"
    ],
    garmentCare: [
      "Specialist dry clean only",
      "Store on structured cedar hanger"
    ],
    shippingInfo: "Complimentary Worldwide Express Courier delivery.",
    isNewArrival: true,
    isBestseller: false,
    isFeatured: true,
    stock: {
      'EU 46': 2,
      'EU 48': 4,
      'EU 50': 3,
      'EU 52': 2
    },
    reviews: [],
    completeTheLookIds: ['chunky-ribbed-turtleneck', 'tailored-flannel-trousers']
  },
  {
    id: 'cashmere-relaxed-cardigan',
    name: "Architectural Cashmere Cardigan",
    subtitle: "Loose 5-gauge Scottish cashmere knit with horn buttons",
    price: 950,
    category: 'Knitwear',
    colors: [
      { name: 'Sage Clay', hex: '#8C9083' },
      { name: 'Pristine Cream', hex: '#F7F5EE' },
      { name: 'Midnight Obsidian', hex: '#1C1B20' },
      { name: 'Oatmeal Melange', hex: '#D8CFB9' },
      { name: 'Warm Camel', hex: '#B88A58' }
    ],
    sizes: ['EU 46', 'EU 48', 'EU 50', 'EU 52'],
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1200&auto=format&fit=crop'
    ],
    description: "An unhurried layering staple knitted from thick 5-gauge Scottish cashmere. Features drop shoulder proportions and deep welt pockets.",
    fabricDetails: [
      "100% Pure Scottish Cashmere",
      "Real buffalo horn buttons",
      "Ribbed collar, cuffs, and hem"
    ],
    garmentCare: [
      "Hand wash cold or dry clean",
      "Dry flat"
    ],
    shippingInfo: "Complimentary Express Delivery.",
    isNewArrival: false,
    isBestseller: true,
    isFeatured: false,
    stock: {
      'EU 46': 3,
      'EU 48': 5,
      'EU 50': 2,
      'EU 52': 4
    },
    reviews: [],
    completeTheLookIds: ['silk-poplin-shirt', 'tailored-flannel-trousers']
  },
  {
    id: 'tailored-linen-trouser',
    name: "Straight-Leg Silk-Wool Trouser",
    subtitle: "High-waisted tailored trouser in Italian silk-wool crepe",
    price: 720,
    category: 'Trousers',
    colors: [
      { name: 'Pristine Cream', hex: '#F7F5EE' },
      { name: 'Midnight Obsidian', hex: '#1C1B20' },
      { name: 'Oatmeal Melange', hex: '#D8CFB9' },
      { name: 'Sage Clay', hex: '#8C9083' },
      { name: 'Natural Sand', hex: '#EBE2D3' }
    ],
    sizes: ['EU 46', 'EU 48', 'EU 50', 'EU 52', 'EU 54'],
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1200&auto=format&fit=crop'
    ],
    description: "Fluid and refined, these silk-wool crepe trousers offer an elevated drape for formal and evening wear.",
    fabricDetails: [
      "60% Mulberry Silk, 40% Worsted Virgin Wool",
      "Single pleat front detail",
      "Hidden side zip and horn waist tab"
    ],
    garmentCare: [
      "Dry clean only",
      "Steam gently"
    ],
    shippingInfo: "Complimentary Express Shipping.",
    isNewArrival: true,
    isBestseller: false,
    isFeatured: false,
    stock: {
      'EU 46': 4,
      'EU 48': 3,
      'EU 50': 5,
      'EU 52': 2
    },
    reviews: [],
    completeTheLookIds: ['double-breasted-wool-blazer', 'silk-poplin-shirt']
  },
  {
    id: 'handcrafted-leather-loafers',
    name: "Minimalist Leather Venetian Loafers",
    subtitle: "Hand-stitched Florentine calfskin with stacked leather sole",
    price: 890,
    category: 'Shoes',
    colors: [
      { name: 'Midnight Obsidian', hex: '#1C1B20' },
      { name: 'Warm Camel', hex: '#B88A58' },
      { name: 'Espresso Earth', hex: '#3B2F2F' },
      { name: 'Cognac Suede', hex: '#9E5B32' }
    ],
    sizes: ['EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44'],
    images: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop'
    ],
    description: "Handcrafted in Tuscany by master cobblers, featuring unlined glove-leather insoles and Blake-stitched leather soles for effortless elegance.",
    fabricDetails: [
      "100% Full-Grain Florentine Calfskin",
      "Blake-welted construction",
      "Stacked leather heel with rubber tap"
    ],
    garmentCare: [
      "Wipe clean with soft damp cloth",
      "Apply neutral leather conditioner"
    ],
    shippingInfo: "Complimentary Express Delivery in signature dust bag.",
    isNewArrival: true,
    isBestseller: true,
    isFeatured: true,
    stock: {
      'EU 40': 2,
      'EU 41': 4,
      'EU 42': 5,
      'EU 43': 3,
      'EU 44': 1
    },
    reviews: [],
    completeTheLookIds: ['tailored-flannel-trousers', 'double-breasted-wool-blazer']
  },
  {
    id: 'artisan-suede-chelsea-boots',
    name: "Artisanal Velvet Suede Chelsea Boots",
    subtitle: "Water-resistant Tuscan split suede with flexible Blake construction",
    price: 980,
    category: 'Shoes',
    colors: [
      { name: 'Oatmeal Melange', hex: '#D8CFB9' },
      { name: 'Charcoal Tweed', hex: '#3E3D40' },
      { name: 'Midnight Obsidian', hex: '#1C1B20' },
      { name: 'Warm Camel', hex: '#B88A58' },
      { name: 'Espresso Earth', hex: '#3B2F2F' }
    ],
    sizes: ['EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44'],
    images: [
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=1200&auto=format&fit=crop'
    ],
    description: "An elegant silhouette shaped on a traditional Italian last. Confeccionado en aterciopelada gamuza toscana con tratamiento repelente al agua y paneles elásticos tonales para un ajuste perfecto.",
    fabricDetails: [
      "100% Gamuza de Becerro Toscana",
      "Forro interior en piel de ternera suave",
      "Suela de cuero natural cosida a mano"
    ],
    garmentCare: [
      "Cepillar suavemente con cepillo para gamuza",
      "Usar protector de gamuza en aerosol"
    ],
    shippingInfo: "Envío Exprés Gratuito con funda y hormas de cedro.",
    isNewArrival: true,
    isBestseller: false,
    isFeatured: true,
    stock: {
      'EU 40': 3,
      'EU 41': 3,
      'EU 42': 4,
      'EU 43': 2,
      'EU 44': 2
    },
    reviews: [],
    completeTheLookIds: ['tailored-flannel-trousers', 'sculpted-cashmere-overcoat']
  },
  {
    id: 'bespoke-calfskin-oxfords',
    name: "Florentine Cap-Toe Calfskin Oxfords",
    subtitle: "Hand-patinated French calfskin with Goodyear welted leather soles",
    price: 1120,
    category: 'Shoes',
    colors: [
      { name: 'Midnight Obsidian', hex: '#1C1B20' },
      { name: 'Warm Camel', hex: '#B88A58' },
      { name: 'Espresso Earth', hex: '#3B2F2F' },
      { name: 'Bordeaux Wine', hex: '#4A1521' }
    ],
    sizes: ['EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44'],
    images: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1200&auto=format&fit=crop'
    ],
    description: "The epitome of formal refinement. Hand-patinated by artisans in Florence using French box calfskin with a Goodyear welted sole for a lifetime of distinguished wear.",
    fabricDetails: [
      "100% French Box Calfskin",
      "Goodyear Welted construction",
      "Hand-burnished toe cap"
    ],
    garmentCare: [
      "Polishing with natural beeswax cream",
      "Store with cedar shoe trees"
    ],
    shippingInfo: "Complimentary Express Delivery with cedar shoe trees.",
    isNewArrival: false,
    isBestseller: true,
    isFeatured: false,
    stock: {
      'EU 40': 2,
      'EU 41': 5,
      'EU 42': 3,
      'EU 43': 4,
      'EU 44': 1
    },
    reviews: [],
    completeTheLookIds: ['double-breasted-wool-blazer', 'silk-poplin-shirt']
  },
  {
    id: 'handcrafted-toquilla-straw-fedora',
    name: "Artisan Toquilla Straw Fedora",
    subtitle: "Hand-woven Ecuadorian Toquilla straw with grosgrain silk ribbon",
    price: 390,
    category: 'Accessories',
    colors: [
      { name: 'Natural Sand', hex: '#EBE2D3' },
      { name: 'Oatmeal Melange', hex: '#D8CFB9' },
      { name: 'Pristine Cream', hex: '#F7F5EE' },
      { name: 'Midnight Obsidian', hex: '#1C1B20' }
    ],
    sizes: ['One Size'],
    images: [
      'https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=1200&auto=format&fit=crop'
    ],
    description: "Meticulously hand-woven by master Ecuadorian artisans from fine Grade-8 Toquilla palm fibers. Features a classic tear-drop crown, structured brim, and a hand-finished Italian navy grosgrain band.",
    fabricDetails: [
      "100% Fine Ecuadorian Toquilla Palm Straw (Grade 8)",
      "Breathable natural weave with UPF 50+ sun protection",
      "Hand-dyed Italian grosgrain ribbon trim with subtle monogram",
      "Padded moisture-wicking interior cotton sweatband"
    ],
    garmentCare: [
      "Avoid submerging in water or direct heavy rain",
      "Wipe clean with a slightly damp cloth",
      "Store in a cool, dry place inside protective hat box"
    ],
    shippingInfo: "Complimentary Express Courier delivery in Mari's bespoke signature round hat box.",
    isNewArrival: true,
    isBestseller: true,
    isFeatured: true,
    imageFrameSettings: {
      fit: 'contain',
      positionY: 50,
      positionX: 50,
      zoom: 95,
      padding: 10,
      backgroundColor: '#F4F0EA'
    },
    stock: {
      'One Size': 6
    },
    reviews: [
      {
        id: 'r-hat-1',
        author: "Camila R.",
        location: "Mallorca, Spain",
        rating: 5,
        date: "July 20, 2024",
        title: "Masterful weave and balance",
        comment: "The tight Toquilla weave gives this hat a sculptural quality while staying delightfully featherweight.",
        verified: true
      }
    ],
    completeTheLookIds: ['silk-poplin-shirt', 'tailored-linen-trouser', 'minimalist-leather-tote']
  },
  {
    id: 'atelier-sculptural-ceramic-vessel',
    name: "Atelier Handcrafted Ceramic Vessel",
    subtitle: "Wheel-thrown volcanic clay vessel with textured matte stoneware glaze",
    price: 320,
    category: 'Miscellaneous',
    colors: [
      { name: 'Oatmeal Melange', hex: '#D8CFB9' },
      { name: 'Sage Clay', hex: '#8C9083' },
      { name: 'Midnight Obsidian', hex: '#1C1B20' },
      { name: 'Pristine Cream', hex: '#F7F5EE' }
    ],
    sizes: ['One Size'],
    images: [
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514517220017-8ce97a34a7b6?q=80&w=1200&auto=format&fit=crop'
    ],
    description: "Individually thrown and carved in our partner atelier in Umbria, Italy. This sculptural stoneware vessel is designed to bring architectural serenity and organic presence to the modern home or studio.",
    fabricDetails: [
      "100% High-fire Italian Volcanic Stoneware",
      "Hand-applied food-safe matte feldspathic glaze",
      "Stamped atelier mark on unglazed base",
      "Capacity: 420ml / Dimensions: 12cm x 9.5cm"
    ],
    garmentCare: [
      "Dishwasher safe, hand washing recommended with gentle soap",
      "Handle with care on stone and glass surfaces",
      "Microwave safe up to moderate temperatures"
    ],
    shippingInfo: "Packaged in shock-absorbent archival molded pulp gift box with certificate of authenticity.",
    isNewArrival: true,
    isBestseller: true,
    isFeatured: true,
    stock: {
      'One Size': 12
    },
    reviews: [
      {
        id: 'r-vessel-1',
        author: "Matteo G.",
        location: "Milan, Italy",
        rating: 5,
        date: "August 10, 2024",
        title: "Pure tactile perfection",
        comment: "The earthy texture and weighted feel in hand is truly exceptional. An everyday object elevated to art.",
        verified: true
      }
    ],
    completeTheLookIds: ['minimalist-leather-tote', 'silk-poplin-shirt']
  }
];

