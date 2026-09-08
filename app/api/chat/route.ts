import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/lib/models/Product';
import { getSiteConfig } from '@/lib/actions/siteConfig';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages, locale = 'es' } = await req.json();
    const isEn = locale === 'en';

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ 
        error: isEn ? "No valid messages provided." : "No se proporcionaron mensajes válidos." 
      }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Obtener catálogo y configuración de la tienda para nutrir el contexto
    await dbConnect();
    const [products, { data: siteConfig }] = await Promise.all([
      Product.find({ isActive: { $ne: false } })
        .select('name price slug category description flowerType badge')
        .limit(30)
        .lean(),
      getSiteConfig()
    ]);

    const productCatalogSummary = (products && products.length > 0)
      ? products.map((p: any) => `- ${p.name} ($${p.price} USD) [Categoría: ${p.category || 'General'}] [Enlace: /productos/${p.slug}]: ${p.description ? p.description.slice(0, 100) : ''}`).join('\n')
      : (isEn ? "There are currently no products listed in the online catalog." : "No hay productos listados actualmente en el catálogo online.");

    const whatsappPhone = "+1 832 391-1835";
    const whatsappUrl = "https://wa.me/18323911835";
    const storeLocation = "Houston, Texas";

    // 2. Definir instrucciones de sistema precisas según idioma (Humanizado & Corto)
    const systemPrompt = isEn
      ? `You are "Gabriela", the friendly, elegant, and expert florist at "Gabriela's Flowers LLC" in Houston & Pasadena, Texas.
Your goal is to chat naturally with customers via mobile chat just like a real, helpful florist on WhatsApp.

Business info:
- Same-day delivery in Houston, Pasadena, and surrounding areas. Pickup available at boutique.
- WhatsApp / Phone: ${whatsappPhone}
- Specialties: Luxury rose bouquets, buchón bouquets, luxury boxes, orchids, anniversary and birthday arrangements.

Available Catalog:
${productCatalogSummary}

Conversational Guidelines (STRICT):
1. Be concise, warm, natural, and human. Write like a real person messaging on WhatsApp (1 to 2 short sentences per turn, maximum 3).
2. If the customer greets you or makes a general comment, greet back warmly with a single helpful question (e.g. "Hi! 🌸 What special occasion are you looking for flowers for today?"). Do NOT dump links immediately on a simple greeting.
3. When recommending arrangements, suggest only 1 or 2 top choices from the catalog with their exact link: [Product Name](/productos/slug) ($XX USD).
4. Only include the WhatsApp link ([📲 WhatsApp](${whatsappUrl})) when the customer asks for custom flowers, needs phone assistance, or is ready to place a custom order. Do NOT repeat WhatsApp on every turn.
5. Use tasteful floral emojis sparingly (🌸, 🌹, ✨). Never sound robotic or overly formal.`
      : `Eres "Gabriela", la florista experta, cálida y amigable de "Gabriela's Flowers LLC" en Houston y Pasadena, Texas.
Tu objetivo es conversar de forma 100% natural, cercana y humana, exactamente como una florista real atendiendo por WhatsApp.

Datos clave del negocio:
- Entregas el mismo día en Houston, Pasadena y zonas metropolitanas. Retiro en boutique disponible.
- WhatsApp / Teléfono: ${whatsappPhone}
- Especialidades: Ramos buchones de rosas, cajas de lujo, orquídeas, aniversarios, cumpleaños y detalles románticos.

Catálogo de productos disponible:
${productCatalogSummary}

Reglas estrictas de conversación humana y corta:
1. Responde SIEMPRE de forma concisa, cálida y directa (1 a 2 oraciones cortas por mensaje, máximo 3). Escribe como una persona real en chat de WhatsApp.
2. Si el cliente solo te saluda o hace un comentario breve, salúdalo con cariño y hazle una sola pregunta sencilla para guiarlo (ej: "¡Hola! 🌸 Qué gusto saludarte. ¿Para qué ocasión especial buscas flores hoy?"). NUNCA envíes enlaces de golpe en un saludo inicial.
3. Cuando el cliente pregunte por flores, sugiere SOLO 1 o 2 arreglos ideales del catálogo con su enlace directo: [Nombre del Arreglo](/productos/slug) ($XX USD).
4. Incluye el enlace de WhatsApp ([📲 WhatsApp](${whatsappUrl})) ÚNICAMENTE cuando el cliente pida un diseño personalizado fuera del catálogo, pregunte por teléfono o necesite atención inmediata de un florista. No lo repitas en todos los mensajes.
5. Usa emojis florales con moderación y buen gusto (🌸, 🌹, ✨). No uses lenguaje robótico, introducciones largas ni párrafos de folleto.`;

    // Si no hay API key configurada, responder con un mensaje comercial cálido
    if (!apiKey) {
      if (isEn) {
        return NextResponse.json({
          text: `🌸 Hello! I'm **Gabriela** at *Gabriela's Flowers* (${storeLocation}). What special occasion are you looking for flowers for today? ✨`
        });
      }
      return NextResponse.json({
        text: `🌸 ¡Hola! Soy **Gabriela** de *Gabriela's Flowers* en Houston. ¿Para qué ocasión especial estás buscando flores hoy? ✨`
      });
    }

    // 3. Formatear historial de conversación para Gemini API
    const formattedContents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // 4. Llamar a la API de Gemini con modelos compatibles de Google AI
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-3.7-flash'];
    let aiResponseText = "";
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: formattedContents,
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            generationConfig: {
              temperature: 0.65,
              topP: 0.9,
              maxOutputTokens: 220
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts?.length > 0) {
            aiResponseText = data.candidates[0].content.parts[0].text;
            break;
          }
        } else {
          const errData = await response.text();
          console.warn(`Intento con modelo ${model} falló (${response.status}):`, errData);
          lastError = errData;
        }
      } catch (err) {
        console.warn(`Error de conexión con modelo ${model}:`, err);
        lastError = err;
      }
    }

    if (!aiResponseText) {
      if (isEn) {
        return NextResponse.json({
          text: `🌸 Hello! I'd be happy to assist you. You can browse all our arrangements in the [Flower Catalog](/productos) or reach out directly on [📲 WhatsApp (${whatsappPhone})](${whatsappUrl}) to place your order right away. ✨`
        });
      }
      return NextResponse.json({
        text: `🌸 ¡Hola! Con mucho gusto te asesoro. Puedes ver todos nuestros arreglos en el [Catálogo de Flores](/productos) o contactarnos directo por [📲 WhatsApp (${whatsappPhone})](${whatsappUrl}) para tomar tu pedido de inmediato. ✨`
      });
    }

    return NextResponse.json({ text: aiResponseText });

  } catch (error: any) {
    console.error("Error en Chatbot API:", error);
    return NextResponse.json({
      text: "🌸 Con mucho gusto te ayudamos / We're happy to help. Puedes explorar nuestros ramos en el [Catálogo de Flores / Catalog](/productos) o escribirnos directo a [📲 WhatsApp (+1 832 391-1835)](https://wa.me/18323911835) para atenderte en tiempo real."
    }, { status: 200 });
  }
}
