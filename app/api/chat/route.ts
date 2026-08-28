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
3. Si el cliente solicita un arreglo completamente personalizado, pedidos corporativos o requiere confirmación inmediata de delivery urgente, invítale amablemente a escribir directo por WhatsApp al ${whatsappPhone}.
4. Mantén las respuestas concisas (máximo 2-3 párrafos cortos) y fáciles de leer en dispositivos móviles.
5. Puedes atender tanto en Español como en Inglés según el idioma en que te hable el cliente.`;

    // Si no hay API key configurada en las variables de entorno:
    if (!apiKey) {
      return NextResponse.json({
        text: "🌸 ¡Hola! Soy Gabriela, tu asesora floral. Actualmente el servicio de IA está en configuración (recuerda agregar `GEMINI_API_KEY` en tus variables de entorno). Mientras tanto, puedes contactarnos directamente por WhatsApp al +1 832 391-1835 o explorar nuestra colección en /productos. ¿En qué te puedo ayudar hoy? ✨"
      });
    }

    // 3. Formatear historial de conversación para Gemini API
    const formattedContents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // 4. Llamar a la API de Gemini (Modelo: gemini-2.5-flash-lite / gemini-1.5-flash)
    const modelsToTry = ['gemini-2.5-flash-lite', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];
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
      throw new Error(`No se pudo obtener respuesta de los modelos Gemini: ${lastError}`);
    }

    return NextResponse.json({ text: aiResponseText });

  } catch (error: any) {
    console.error("Error en Chatbot API:", error);
    return NextResponse.json({
      text: "🌸 Disculpa, tuve un pequeño inconveniente al procesar tu mensaje. Puedes escribirnos directo a nuestro WhatsApp (+1 832 391-1835) y con mucho gusto te atenderemos de inmediato."
    }, { status: 500 });
  }
}
