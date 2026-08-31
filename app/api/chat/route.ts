import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/lib/models/Product';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Obtener catálogo activo de la base de datos (con fallback tolerante a fallos)
    let catalogSummary = "No hay productos disponibles por el momento.";
    try {
      if (process.env.MONGODB_URI) {
        await dbConnect();
        const activeProducts = await Product.find({ isActive: { $ne: false } })
          .select('name price category slug description badge')
          .limit(20)
          .lean();

        if (activeProducts && activeProducts.length > 0) {
          catalogSummary = activeProducts.map((p: any) => 
            `- ${p.name} ($${p.price}) | Categoría: ${p.category} | Link: /productos/${p.slug}`
          ).join('\n');
        }
      }
    } catch (dbErr) {
      console.warn("No se pudo cargar el catálogo para el chatbot:", dbErr);
    }

    const systemInstruction = `
Eres 'Gabriela's Assistant', la florista virtual y experta de 'Gabriela's Flowers LLC', una boutique floral de lujo en Houston, Texas.
Tu objetivo es brindar una atención amable, elegante, profesional y orientada a la venta de arreglos florales de alta calidad.

INFORMACIÓN IMPORTANTE DE LA TIENDA:
- Nombre: Gabriela's Flowers LLC
- Ubicación principal: Houston, Texas (Cobertura en Houston, Katy, Sugar Land, The Woodlands y áreas metropolitanas).
- Teléfono y WhatsApp Oficial: +1 832 391-1835.
- Entregas: Mismo día disponible, entregas a domicilio personalizadas.
- Idiomas: Español e Inglés.

CATÁLOGO ACTUAL DE PRODUCTOS EN STOCK:
${catalogSummary}

REGLAS DE RESPUESTA:
1. Responde de forma cálida, concisa y elegante (máximo 3 o 4 párrafos cortos o viñetas).
2. Si el usuario pregunta por precios o recomendaciones, ofrece opciones de nuestro catálogo con su nombre exacto y su precio.
3. Si el usuario desea un arreglo personalizado o atención directa con una maestra florista, invítalo a escribirnos a WhatsApp (+1 832 391-1835).
4. Utiliza un tono alegre con emoticones florales sutiles (🌸, 🌹, 💐, ✨).
5. Mantén tus respuestas breves y legibles para un widget de chat móvil.
`;

    // Si NO hay API key configurada en .env.local, devolver respuesta amable de contingencia
    if (!apiKey || apiKey.trim() === "" || apiKey === "tu_api_key_aqui") {
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      const lower = lastUserMsg.toLowerCase();
      let fallbackReply = "¡Hola! 🌸 Gracias por comunicarte con Gabriela's Flowers. Nuestro catálogo está repleto de creaciones florales únicas. ¿Te gustaría ver nuestros ramos más populares o hablar con una florista por WhatsApp?";
      
      if (lower.includes("precio") || lower.includes("ramo") || lower.includes("catalogo") || lower.includes("comprar")) {
        fallbackReply = "🌸 ¡Tenemos ramos hermosos! Desde cajas de rosas ecuatorianas hasta arreglos de girasoles y orquídeas. Puedes explorar nuestro catálogo completo en la sección de Productos o escribirnos al WhatsApp +1 832 391-1835.";
      } else if (lower.includes("envio") || lower.includes("houston") || lower.includes("entrega") || lower.includes("delivery")) {
        fallbackReply = "🚚 Entregamos el mismo día en todo Houston, TX y zonas vecinas. ¡Tus flores llegarán frescas y listas para enamorar!";
      }

      return NextResponse.json({ reply: fallbackReply });
    }

    // Convertir historial de mensajes al formato de la API de Gemini
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Intentar consultar la API gratuita de Gemini 2.5 Flash o Gemini 1.5 Flash
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const apiRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    if (!apiRes.ok) {
      const errBody = await apiRes.text();
      console.error("Error al llamar Gemini API:", apiRes.status, errBody);
      return NextResponse.json({ 
        reply: "¡Hola! 🌸 Para brindarte la mejor atención de inmediato, te invitamos a contactar a nuestras floristas directamente vía WhatsApp al +1 832 391-1835." 
      });
    }

    const data = await apiRes.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      return NextResponse.json({ 
        reply: "¡Hola! 🌸 Con mucho gusto te asesoramos con tu arreglo floral. Escríbenos a WhatsApp al +1 832 391-1835 para atenderte al instante." 
      });
    }

    return NextResponse.json({ reply: replyText });

  } catch (error: any) {
    console.error("Excepción en /api/chat:", error);
    return NextResponse.json({ 
      reply: "¡Hola! 🌸 Gracias por visitar Gabriela's Flowers. Puedes explorar nuestro catálogo o escribirnos por WhatsApp al +1 832 391-1835." 
    }, { status: 200 });
  }
}
