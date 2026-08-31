import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/lib/models/Product';
import { getSiteConfig } from '@/lib/actions/siteConfig';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No se proporcionaron mensajes válidos." }, { status: 400 });
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
      : "No hay productos listados actualmente en el catálogo online.";

    const whatsappPhone = "+1 832 391-1835";
    const whatsappUrl = "https://wa.me/18323911835";
    const storeLocation = "Houston, Texas";

    // 2. Definir instrucciones de sistema precisas
    const systemPrompt = `Eres "Gabriela", la asesora floral virtual y experta de "Gabriela's Flowers LLC", una boutique floral de lujo ubicada en ${storeLocation}.
Tu objetivo es brindar una atención cálida, sofisticada, amable y rápida a los clientes, ayudándoles a elegir el arreglo floral perfecto para cualquier ocasión.

Información clave del negocio:
- Ubicación y Envíos: Houston, Texas y zonas metropolitanas cercanas. Entregas y delivery disponibles el mismo día programado.
- Teléfono / WhatsApp: ${whatsappPhone}
- Horario de Atención: Lunes a Sábado.
- Especialidades: Arreglos florales de rosas premium, ramos buchones, cajas de lujo, orquídeas, ocasiones románticas, aniversarios, cumpleaños, agradecimientos y condolencias.
- Complementos: Globos personalizados, chocolates finos, peluches y dedicatorias con tarjeta.

Catálogo de productos disponibles en la tienda:
${productCatalogSummary}

Reglas de respuesta:
1. Responde siempre en un tono cercano, elegante, dulce y servicial (usando emojis florales como 🌸, 🌹, ✨ con buen gusto).
2. Si el usuario busca un arreglo para una ocasión específica o un presupuesto, recomienda 1 a 3 productos del catálogo e incluye siempre el enlace en formato Markdown: [Nombre del Producto](/productos/slug) para que el cliente pueda hacer clic directo.
3. Al finalizar una recomendación, o si el cliente desea ordenar, cotizar algo personalizado o atención inmediata, ofrécele siempre el enlace directo a WhatsApp con este formato exacto: [📲 Escribir a WhatsApp (${whatsappPhone})](${whatsappUrl}).
4. Mantén las respuestas concisas (máximo 2-3 párrafos cortos) y fáciles de leer en dispositivos móviles.
5. Puedes atender tanto en Español como en Inglés según el idioma en que te hable el cliente.`;

    // Si no hay API key configurada, responder con un mensaje cálido y comercial
    if (!apiKey) {
      return NextResponse.json({
        text: `🌸 ¡Hola! Soy **Gabriela**, tu asesora floral en *Gabriela's Flowers* (${storeLocation}).\n\nCon mucho gusto te ayudo a elegir el arreglo perfecto para tu ocasión especial. Puedes explorar nuestras opciones en el [Catálogo de Flores](/productos) o si deseas una cotización personalizada o entrega para hoy, escríbenos directamente a [📲 WhatsApp (${whatsappPhone})](${whatsappUrl}). ¿Qué tipo de ocasión estás celebrando? ✨`
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
              temperature: 0.7,
              topP: 0.95,
              maxOutputTokens: 600
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
      return NextResponse.json({
        text: `🌸 ¡Hola! Con mucho gusto te asesoro. Puedes ver todos nuestros arreglos en el [Catálogo de Flores](/productos) o contactarnos directo por [📲 WhatsApp (${whatsappPhone})](${whatsappUrl}) para tomar tu pedido de inmediato. ✨`
      });
    }

    return NextResponse.json({ text: aiResponseText });

  } catch (error: any) {
    console.error("Error en Chatbot API:", error);
    return NextResponse.json({
      text: "🌸 Con mucho gusto te ayudamos. Puedes explorar nuestros ramos en el [Catálogo de Flores](/productos) o escribirnos directo a [📲 WhatsApp (+1 832 391-1835)](https://wa.me/18323911835) para atenderte en tiempo real."
    }, { status: 200 });
  }
}
