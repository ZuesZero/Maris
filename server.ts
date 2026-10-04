import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { ZipArchive } from "archiver";
import * as dbQueries from "./src/db/queries.ts";

const DATA_DIR = path.join(process.cwd(), "server_data");
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error("Failed to create data directory", e);
  }
}

const PRODUCTS_FILE = path.join(DATA_DIR, "custom_products.json");
const EDITED_PRODUCTS_FILE = path.join(DATA_DIR, "edited_products.json");
const FRAME_SETTINGS_FILE = path.join(DATA_DIR, "image_frame_settings.json");

function readJsonFile(filePath: string, fallback: any) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
  }
  return fallback;
}

function writeJsonFile(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error(`Error writing ${filePath}:`, e);
    return false;
  }
}

async function startServer() {
  const app = express();
  // Use DEFAULT_APP_PORT (3000) or fallback to 3000, avoiding collision with NGINX on 8080
  const PORT = process.env.DEFAULT_APP_PORT
    ? Number(process.env.DEFAULT_APP_PORT)
    : (process.env.PORT && process.env.PORT !== process.env.NGINX_PORT && process.env.NODE_ENV === "production"
      ? Number(process.env.PORT)
      : 3000);

  app.use(express.json({ limit: "50mb" }));

  // API Route: Download complete project as ZIP
  app.get("/api/download-zip", (req, res) => {
    try {
      const archive = new ZipArchive({
        zlib: { level: 9 },
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `maris-luxury-fashion-${timestamp}.zip`;

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      archive.on("error", (err: any) => {
        console.error("Archive error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to generate ZIP archive" });
        }
      });

      archive.pipe(res);

      // Package project files while excluding bulky and transient folders
      archive.glob("**/*", {
        cwd: process.cwd(),
        ignore: [
          "node_modules/**",
          ".git/**",
          "dist/**",
          ".cache/**",
          ".npm/**",
          "*.log",
          "*.tmp"
        ],
        dot: true,
      });

      archive.finalize();
    } catch (err) {
      console.error("Download ZIP route error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Could not create ZIP archive" });
      }
    }
  });

  // API Route: Get and Save Image Frame Settings
  app.get("/api/image-frame-settings", async (req, res) => {
    try {
      const dbSettings = await dbQueries.getAllFrameSettings();
      if (Object.keys(dbSettings).length > 0) {
        return res.json(dbSettings);
      }
    } catch (e) {
      console.warn("Falling back to local frame settings:", e);
    }
    const settings = readJsonFile(FRAME_SETTINGS_FILE, {});
    res.json(settings);
  });

  app.post("/api/image-frame-settings", async (req, res) => {
    const { productId, settings, isGlobal, allSettings } = req.body;
    const current = readJsonFile(FRAME_SETTINGS_FILE, {});
    
    if (allSettings && typeof allSettings === 'object') {
      const merged = { ...current, ...allSettings };
      writeJsonFile(FRAME_SETTINGS_FILE, merged);
      try {
        for (const [key, val] of Object.entries(allSettings)) {
          await dbQueries.saveFrameSettings(key, val);
        }
      } catch (e) {
        console.warn("DB save frame settings warning:", e);
      }
      return res.json({ success: true, settings: merged });
    }

    const targetKey = isGlobal ? "__global__" : productId;
    if (targetKey && settings) {
      current[targetKey] = settings;
      writeJsonFile(FRAME_SETTINGS_FILE, current);
      try {
        await dbQueries.saveFrameSettings(targetKey, settings);
      } catch (e) {
        console.warn("DB save single frame setting warning:", e);
      }
    }
    res.json({ success: true, settings: current });
  });

  // API Route: Get all custom and edited products
  app.get("/api/products/persisted", async (req, res) => {
    try {
      const dbProducts = await dbQueries.getAllProducts();
      if (dbProducts && dbProducts.length > 0) {
        return res.json({ custom: dbProducts, edited: [] });
      }
    } catch (e) {
      console.warn("Falling back to local file products:", e);
    }
    const custom = readJsonFile(PRODUCTS_FILE, []);
    const edited = readJsonFile(EDITED_PRODUCTS_FILE, []);
    res.json({ custom, edited });
  });

  // API Route: Save or update product
  app.post("/api/products", async (req, res) => {
    const { product, isEdit } = req.body;
    if (!product || !product.id) {
      return res.status(400).json({ error: "Invalid product data" });
    }

    try {
      await dbQueries.upsertProduct(product);
    } catch (e) {
      console.warn("Cloud SQL upsert product error, maintaining local backup:", e);
    }

    if (isEdit) {
      const edited = readJsonFile(EDITED_PRODUCTS_FILE, []);
      const idx = edited.findIndex((p: any) => p.id === product.id);
      if (idx >= 0) {
        edited[idx] = product;
      } else {
        edited.push(product);
      }
      writeJsonFile(EDITED_PRODUCTS_FILE, edited);

      // Also update in custom products if it exists there
      const custom = readJsonFile(PRODUCTS_FILE, []);
      const cIdx = custom.findIndex((p: any) => p.id === product.id);
      if (cIdx >= 0) {
        custom[cIdx] = product;
        writeJsonFile(PRODUCTS_FILE, custom);
      }

      return res.json({ success: true, product });
    } else {
      const custom = readJsonFile(PRODUCTS_FILE, []);
      const idx = custom.findIndex((p: any) => p.id === product.id);
      if (idx >= 0) {
        custom[idx] = product;
      } else {
        custom.unshift(product);
      }
      writeJsonFile(PRODUCTS_FILE, custom);
      return res.json({ success: true, product });
    }
  });

  // API Route: Delete product
  app.delete("/api/products/:id", async (req, res) => {
    const id = req.params.id;
    try {
      await dbQueries.deleteProductById(id);
    } catch (e) {
      console.warn("Cloud SQL delete product error:", e);
    }

    let custom = readJsonFile(PRODUCTS_FILE, []);
    custom = custom.filter((p: any) => p.id !== id);
    writeJsonFile(PRODUCTS_FILE, custom);

    let edited = readJsonFile(EDITED_PRODUCTS_FILE, []);
    edited = edited.filter((p: any) => p.id !== id);
    writeJsonFile(EDITED_PRODUCTS_FILE, edited);

    res.json({ success: true });
  });

  // API Route: Sales Transactions (Cloud SQL)
  app.get("/api/sales-transactions", async (req, res) => {
    try {
      const txs = await dbQueries.getAllSalesTransactions();
      res.json(txs);
    } catch (e) {
      console.error("Failed to fetch sales transactions from Cloud SQL:", e);
      res.status(500).json({ error: "Failed to fetch sales transactions" });
    }
  });

  app.post("/api/sales-transactions", async (req, res) => {
    try {
      const { transaction } = req.body;
      if (!transaction || !transaction.id) {
        return res.status(400).json({ error: "Invalid transaction data" });
      }
      const saved = await dbQueries.upsertSaleTransaction(transaction);
      res.json({ success: true, transaction: saved[0] });
    } catch (e) {
      console.error("Failed to save sales transaction to Cloud SQL:", e);
      res.status(500).json({ error: "Failed to save sales transaction" });
    }
  });

  app.delete("/api/sales-transactions/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await dbQueries.deleteSaleTransactionById(id);
      res.json({ success: true });
    } catch (e) {
      console.error("Failed to delete sales transaction from Cloud SQL:", e);
      res.status(500).json({ error: "Failed to delete sales transaction" });
    }
  });

  // API Route: Users (Cloud SQL)
  app.get("/api/users", async (req, res) => {
    try {
      const dbUsers = await dbQueries.getAllUsers();
      res.json(dbUsers);
    } catch (e) {
      console.error("Failed to fetch users from Cloud SQL:", e);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const { uid, email, name, avatar } = req.body;
      if (!uid || !email) {
        return res.status(400).json({ error: "Missing uid or email" });
      }
      const user = await dbQueries.getOrCreateUser(uid, email, name, avatar);
      res.json({ success: true, user });
    } catch (e) {
      console.error("Failed to upsert user in Cloud SQL:", e);
      res.status(500).json({ error: "Failed to upsert user" });
    }
  });

  // API Route: AI Bespoke Stylist Advice
  app.post("/api/stylist", async (req, res) => {
    try {
      const { query, currentCart, wishlist } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          response: `Welcome to Mari's Client Concierge. Based on your request ("${query}"), we recommend pairing our double-faced Loro Piana virgin cashmere overcoat in Oatmeal Melange with our 7-gauge Grade-A Mongolian cashmere turtleneck and Italian wool flannel trousers. This combination creates an effortless silhouette of quiet sophistication with supreme thermal warmth.`
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });
      const prompt = `You are the lead bespoke personal stylist for "Mari's", an exclusive minimalist luxury fashion house in Milan/Paris specializing in virgin cashmere, Super 130s wool, Mulberry silk, and Tuscan leather.
      
A distinguished client is seeking sartorial advice.
Client prompt: "${query}"
Context - Client's current cart items: ${JSON.stringify(currentCart || [])}
Context - Client's wishlist items: ${JSON.stringify(wishlist || [])}

Available items in Mari's catalog:
1. The Sculpted Cashmere Overcoat ($2,450) - Double-faced Loro Piana virgin cashmere
2. Double-Breasted Wool Blazer ($1,650) - Italian Super 130s worsted wool
3. Architectural Ribbed Turtleneck ($820) - 7-gauge Grade-A Mongolian cashmere
4. Pleated Flannel Trousers ($680) - Vitale Barberis wool flannel with double forward pleats
5. Minimalist Silk Poplin Shirt ($520) - 19 momme Mulberry silk
6. Architectural Leather Weekender ($1,450) - Florentine full-grain calfskin
7. Heavy Cashmere Stole ($490) - Scottish woven cashmere
8. Architectural Silk Midi Slip ($780) - 22 momme bias-cut silk

Provide a concise, elegant, and warm luxury response (max 3 short paragraphs). Recommend specific pieces from Mari's collection, explain the architectural drape and material harmony, and offer tailoring or styling notes. Maintain an understated, refined voice.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt
      });

      return res.json({
        response: response.text || "Our master stylist recommends pairing our Loro Piana cashmere overcoat with our double-pleated flannel trousers for a refined architectural drape."
      });
    } catch (error) {
      console.error("Stylist API Error:", error);
      return res.json({
        response: "Our client concierge recommends pairing our double-faced Loro Piana cashmere overcoat with our Grade-A Mongolian cashmere turtleneck for an effortless statement of quiet luxury."
      });
    }
  });

  // API Route: AI Intelligent Product Search
  app.post("/api/ai-search", async (req, res) => {
    try {
      const { query, products, language } = req.body;
      const isSpanish = language === 'es';
      const apiKey = process.env.GEMINI_API_KEY;

      if (!query || !query.trim()) {
        return res.json({ matchedProductIds: [], aiRecommendation: "", keywords: [] });
      }

      const productList = Array.isArray(products) && products.length > 0 ? products : [
        { id: 'sculpted-cashmere-overcoat', name: 'The Sculpted Cashmere Overcoat', category: 'Outerwear', description: 'Double-faced Loro Piana virgin cashmere overcoat, Italian tailoring.' },
        { id: 'double-breasted-wool-blazer', name: 'Double-Breasted Wool Blazer', category: 'Suits & Blazers', description: 'Italian Super 130s worsted wool double breasted jacket.' },
        { id: 'chunky-ribbed-turtleneck', name: 'Architectural Ribbed Turtleneck', category: 'Knitwear', description: '7-gauge Grade-A Mongolian cashmere ribbed sweater.' },
        { id: 'tailored-flannel-trousers', name: 'Pleated Flannel Trousers', category: 'Trousers', description: 'Vitale Barberis wool flannel trousers with forward pleats.' },
        { id: 'silk-poplin-shirt', name: 'Minimalist Silk Poplin Shirt', category: 'Shirts & Silk', description: '19 momme Mulberry silk shirt with hidden placket.' },
        { id: 'minimalist-leather-tote', name: 'Architectural Leather Weekender', category: 'Accessories', description: 'Florentine full-grain calfskin leather bag.' }
      ];

      if (!apiKey) {
        // Smart keyword fallback when API key is unavailable
        const q = query.toLowerCase();
        const matched = productList.filter((p: any) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(q))
        ).map((p: any) => p.id);

        const fallbackMsg = isSpanish
          ? `El Concierge IA analizó "${query}" en la colección de Mari y seleccionó ${matched.length || productList.length} coincidencias ideales en cashmere virgen, lana italiana y seda Mulberry.`
          : `AI Concierge analyzed "${query}" across Mari's master collection and identified ${matched.length || productList.length} ideal matches in virgin cashmere, Italian wool, and Mulberry silk.`;

        return res.json({
          matchedProductIds: matched,
          aiRecommendation: fallbackMsg,
          keywords: isSpanish ? [query, "Ajuste de Lujo", "Hecho a Mano"] : [query, "Luxury Fit", "Hand-Finished"]
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });

      const catalogContext = productList.map((p: any) =>
        `ID: "${p.id}" | Name: "${p.name}" | Category: "${p.category}" | Subtitle: "${p.subtitle || ''}" | Description: "${p.description || ''}"`
      ).join("\n");

      const prompt = `You are the AI Search Concierge for "Mari's", a luxury fashion brand.
A client searched (via voice or text in ${isSpanish ? 'Spanish' : 'English'}): "${query}".

Here is the current catalog:
${catalogContext}

Tasks:
1. Analyze the query's semantic intent (e.g., warmth, occasion, material, color, season, style). Understand Spanish queries seamlessly.
2. Select the product IDs that match this intent best.
3. Write a 1-2 sentence luxury recommendation note in ${isSpanish ? 'SPANISH (Español)' : 'ENGLISH'} explaining why these selected garments match the client's search.
4. Extract 2-3 style key tags in ${isSpanish ? 'Spanish' : 'English'}.

Respond strictly in JSON with this structure:
{
  "matchedProductIds": ["id1", "id2"],
  "aiRecommendation": "${isSpanish ? 'Texto elegante en español...' : 'Short 1-2 sentence luxury note...'}",
  "keywords": ["Cashmere", "Winter Outerwear"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const resultText = response.text || '{}';
      let parsed = { matchedProductIds: [], aiRecommendation: '', keywords: [] };
      try {
        parsed = JSON.parse(resultText);
      } catch (e) {
        console.error("Failed to parse AI search JSON response", e);
      }

      return res.json({
        matchedProductIds: parsed.matchedProductIds || [],
        aiRecommendation: parsed.aiRecommendation || (isSpanish ? `Sugerencia curada por el Concierge IA para "${query}".` : `AI Curator curated selection for "${query}".`),
        keywords: parsed.keywords || [query]
      });
    } catch (error) {
      console.error("AI Search API Error:", error);
      const isSpanish = req.body?.language === 'es';
      return res.json({
        matchedProductIds: [],
        aiRecommendation: isSpanish ? `El Curador IA procesó la consulta: "${req.body.query}".` : `AI Curator processed query: "${req.body.query}".`,
        keywords: [req.body.query || 'Lujo']
      });
    }
  });

  // API Route: AI Client Concierge & Doubt Solver Chat Bot
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { messages, userMessage, currentCart, wishlist, products, language, currency } = req.body;
      const isSpanish = language === 'es';
      const apiKey = process.env.GEMINI_API_KEY;

      const productContext = (Array.isArray(products) ? products : []).slice(0, 20).map((p: any) =>
        `- [${p.name}] ($${p.price} USD / ${p.category}): ${p.subtitle || ''}. Sizes: ${(p.sizes || []).join(', ')}. Stock: ${p.stockQuantity ?? 10} units.`
      ).join("\n");

      if (!apiKey) {
        // High quality luxury concierge fallback answers for common doubts
        const queryLower = (userMessage || '').toLowerCase();
        let fallbackAnswer = "";
        
        if (queryLower.includes('material') || queryLower.includes('tela') || queryLower.includes('cashmere') || queryLower.includes('seda') || queryLower.includes('fabric') || queryLower.includes('lana') || queryLower.includes('cuero') || queryLower.includes('leather')) {
          fallbackAnswer = isSpanish
            ? "En **Mari's Atelier**, todas nuestras prendas se confeccionan exclusivamente con materiales nobles de origen ético y trazabilidad certificada:\n\n• **Cashmere Virgen de Doble Faz Loro Piana**: Hilado en Biella, Italia; construcción desestructurada y peso pluma con altísimo poder térmico.\n• **Cashmere Mongolés Grado A Galga 7**: Tejido en telares de precisión en Hawick, Escocia, para una textura ultrasuave y duradera.\n• **Seda Mulberry Orgánica de 19 y 22 Momme**: Cortada al bies con costuras francesas invisibles y caída fluida.\n• **Lana Peinada Super 130s de Vitale Barberis Canonico**: Elasticidad natural y estructura sartorial impecable.\n• **Piel de Becerro Florentina**: Curtido vegetal toscano con pátina natural que mejora con los años.\n\n¿Te gustaría recibir recomendaciones de cuidado o combinación para alguna prenda?"
            : "At **Mari's Atelier**, all our creations are crafted exclusively from noble, traceable fibers:\n\n• **Double-faced Loro Piana Virgin Cashmere**: Spun in Biella, Italy, unlined for an architectural drape and weightless thermal comfort.\n• **7-Gauge Grade-A Mongolian Cashmere**: Spun in Hawick, Scotland, offering unrivaled warmth without pilling.\n• **19 & 22 Momme Organic Mulberry Silk**: Cut on the bias with handcrafted invisible French seams.\n• **Vitale Barberis Canonico Super 130s Worsted Wool**: Flawless natural drape and structure.\n• **Florentine Calfskin Leather**: Tuscan vegetable-tanned full-grain leather.\n\nWould you like tailoring or garment care recommendations for a specific piece?";
        } else if (queryLower.includes('envio') || queryLower.includes('shipping') || queryLower.includes('entrega') || queryLower.includes('tiempo') || queryLower.includes('delivery') || queryLower.includes('costo') || queryLower.includes('cost')) {
          fallbackAnswer = isSpanish
            ? "Ofrecemos **Envío Exprés Gratuito a todo el mundo** en todos los pedidos superiores a **$500 USD** (o su equivalente en la moneda seleccionada):\n\n• **Tiempos de Tránsito**: 1 a 3 días hábiles mediante transporte aéreo prioritario asegurado (DHL Express / FedEx International Priority).\n• **Embalaje de Lujo**: Cada prenda viaja protegida en funda de algodón transpirable dentro de una caja rígida texturizada con sello de cera y tarjeta personalizada.\n• **Seguimiento en Vivo**: Número de rastreo en tiempo real enviado a tu correo y disponible en todo momento."
            : "We provide **Complimentary Worldwide Express Shipping** on all orders over **$500 USD** (or equivalent in your selected currency):\n\n• **Transit Times**: 1 to 3 business days via fully insured DHL Express / FedEx Priority courier.\n• **Bespoke Packaging**: Each piece arrives in a breathable garment bag housed in our signature textured rigid box with wax seal.\n• **Live Tracking**: Real-time transit updates provided directly to your email.";
        } else if (queryLower.includes('talla') || queryLower.includes('medida') || queryLower.includes('size') || queryLower.includes('fit') || queryLower.includes('ajuste') || queryLower.includes('guia')) {
          fallbackAnswer = isSpanish
            ? "Nuestras siluetas siguen el tallaje sartorial europeo contemporáneo con drapeado arquitectónico:\n\n• **EU 46 (XS/S)**: Pecho 92-96 cm | Cintura 78-82 cm | Manga 63 cm\n• **EU 48 (S/M)**: Pecho 96-100 cm | Cintura 82-86 cm | Manga 64 cm\n• **EU 50 (M/L)**: Pecho 100-104 cm | Cintura 86-90 cm | Manga 65 cm\n• **EU 52 (L/XL)**: Pecho 104-108 cm | Cintura 90-94 cm | Manga 66 cm\n• **EU 54 (XL/XXL)**: Pecho 108-112 cm | Cintura 94-98 cm | Manga 67 cm\n\nNuestras prendas de hombros desestructurados ofrecen un calce fluido y cómodo. Puedes abrir la **Guía de Tallas** en la ficha de producto para más detalles."
            : "Our silhouettes adhere to contemporary European tailoring standards:\n\n• **EU 46 (XS/S)**: Chest 36-38 in | Waist 30-32 in | Sleeve 24.8 in\n• **EU 48 (S/M)**: Chest 38-40 in | Waist 32-34 in | Sleeve 25.2 in\n• **EU 50 (M/L)**: Chest 40-42 in | Waist 34-36 in | Sleeve 25.6 in\n• **EU 52 (L/XL)**: Chest 42-44 in | Waist 36-38 in | Sleeve 26.0 in\n• **EU 54 (XL/XXL)**: Chest 44-46 in | Waist 38-40 in | Sleeve 26.4 in\n\nAll outerwear features soft, unstructured shoulders designed to move effortlessly with natural human posture.";
        } else if (queryLower.includes('devol') || queryLower.includes('return') || queryLower.includes('cambio') || queryLower.includes('garantia') || queryLower.includes('exchange') || queryLower.includes('reembolso') || queryLower.includes('refund')) {
          fallbackAnswer = isSpanish
            ? "En Mari's garantizamos una experiencia sin complicaciones con **14 días de devoluciones y cambios de talla 100% de cortesía**:\n\n• Recogida a domicilio programada a tu conveniencia sin cargos adicionales.\n• Reembolso completo inmediato tras la recepción en nuestro atelier de Milán.\n• Cambio exprés de talla garantizado con prioridad de envío."
            : "Mari's offers a **14-day complimentary return and size exchange policy**:\n\n• Door-to-door courier pickup scheduled at your convenience without charge.\n• Immediate full refund or expedited dispatch of your replacement size upon atelier inspection.\n• Garments must remain unworn with intact security tags and provenance cards.";
        } else if (queryLower.includes('pago') || queryLower.includes('comprar') || queryLower.includes('buy') || queryLower.includes('checkout') || queryLower.includes('orden') || queryLower.includes('order')) {
          fallbackAnswer = isSpanish
            ? "Comprar en Mari's es muy sencillo:\n\n1. Selecciona la prenda deseada y elige tu talla y color preferidos.\n2. Haz clic en **Añadir a la Bolsa**.\n3. Abre la Bolsa de Compras en la esquina superior derecha e ingresa tus datos de entrega.\n4. Aceptamos las principales tarjetas de crédito internacionales con encriptación bancaria de alta seguridad."
            : "Ordering from Mari's is seamless:\n\n1. Select your preferred garment, size, and shade from the catalog.\n2. Click **Add to Shopping Bag**.\n3. Open your bag in the top-right header and proceed with shipping & contact details.\n4. We support all major international cards with secure encrypted checkout.";
        } else {
          fallbackAnswer = isSpanish
            ? `Hola, soy el **Concierge Virtual de Mari's**. Estoy aquí para resolver cualquier duda sobre nuestra colección de alta costura, materiales nobles (cashmere, seda, lanas finas), guía de tallas, tiempos de envío exprés o recomendaciones de estilo personalizadas.\n\n¿En qué puedo asistirte hoy?`
            : `Greetings. I am **Mari's Client Concierge Assistant**. I am at your service to resolve any questions regarding our luxury collections, cashmere and silk provenance, sizing conversions, worldwide express shipping, or bespoke styling recommendations.\n\nHow may I assist you today?`;
        }

        return res.json({
          reply: fallbackAnswer,
          suggestedActions: isSpanish ? ["Materiales Nobles", "Tallas y Medidas", "Envíos y Devoluciones", "Ver Colección"] : ["Noble Fabrics", "Size & Fit Guide", "Shipping & Returns", "Explore Collection"]
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' }
        }
      });

      const conversationHistory = Array.isArray(messages) ? messages.map((m: any) => `${m.role === 'user' ? 'Client' : 'Concierge'}: ${m.content}`).join("\n") : '';

      const systemPrompt = `You are the lead luxury client concierge & fashion advisor chatbot for "Mari's", an exclusive high-end fashion atelier based in Milan, Paris, and Zurich.
Your mission is to resolve all client doubts warmly, concisely, accurately, and with impeccable quiet luxury hospitality.

Store Knowledge Base:
- Brand Philosophy: Quiet luxury, timeless architectural silhouettes, noble fibers, zero logo clutter, generational longevity.
- Key Fabrics: Double-faced Loro Piana virgin cashmere (Biella, Italy), 7-gauge Grade-A Mongolian cashmere (Hawick, Scotland), 19-22 momme Organic Mulberry Silk, Vitale Barberis Super 130s worsted wool, full-grain vegetable-tanned Florentine calfskin leather.
- Sizing Range: EU 46 (XS/S), EU 48 (S/M), EU 50 (M/L), EU 52 (L/XL), EU 54 (XL/XXL).
- Worldwide Shipping: Complimentary express air courier on orders over $500 USD (otherwise $45 USD). Transit time is 1-3 business days with insured delivery in rigid bespoke boxes with signature wax seal.
- Returns & Exchanges: 14 days complimentary courier pickup at the client's residence for full refunds or size adjustments.
- Active Currency: ${currency || 'USD'}.
- Products in Mari's Atelier:\n${productContext}

Client's Current Cart: ${JSON.stringify(currentCart || [])}
Client's Wishlist: ${JSON.stringify(wishlist || [])}

Language instruction:
- Client interface is in: ${isSpanish ? 'SPANISH (Español)' : 'ENGLISH'}.
- Reply in the language used by the client (if Spanish, answer in refined Spanish; if English, answer in refined English).

Guidelines:
1. Provide elegant, concise, structured answers (use bullet points and bolding) that directly resolve client doubts.
2. If asked about recommendations or products, suggest exact pieces from Mari's catalog with brief style and pairing context.
3. Maintain an understated, warm, and refined luxury tone.`;

      const contents = `${systemPrompt}\n\nPast Conversation:\n${conversationHistory}\n\nClient's latest inquiry: "${userMessage}"\n\nConcierge Response:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents
      });

      return res.json({
        reply: response.text || (isSpanish ? "Con gusto le asisto con cualquier duda sobre nuestra colección de alta sastrería." : "I am delighted to assist you with any questions regarding our atelier collection."),
        suggestedActions: isSpanish ? ["Materiales Nobles", "Tallas y Medidas", "Envíos y Devoluciones", "Ver Colección"] : ["Noble Fabrics", "Size & Fit Guide", "Shipping & Returns", "Explore Collection"]
      });

    } catch (error) {
      console.error("Chatbot API Error:", error);
      const isSpanish = req.body?.language === 'es';
      return res.json({
        reply: isSpanish
          ? "Nuestro Concierge está a su entera disposición. Todas nuestras prendas cuentan con envío exprés gratuito superior a $500 USD, 14 días de devoluciones de cortesía y confección en cashmere virgen italiano de doble faz."
          : "Our Concierge is at your full disposal. All Mari's pieces include complimentary worldwide express shipping on orders over $500 USD, 14-day returns, and artisanal Italian tailoring in double-faced virgin cashmere.",
        suggestedActions: isSpanish ? ["Materiales Nobles", "Tallas y Medidas"] : ["Noble Fabrics", "Size & Fit Guide"]
      });
    }
  });

  // Vite Middleware for Development
  if (process.env.NODE_ENV !== "production") {
    app.use((req, res, next) => {
      if (
        req.path.startsWith("/src/db/") ||
        req.path.startsWith("/src/middleware/") ||
        req.path.startsWith("/src/lib/firebase-admin")
      ) {
        res.setHeader("Content-Type", "application/javascript");
        return res.status(200).send("export {};\n");
      }
      next();
    });

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
