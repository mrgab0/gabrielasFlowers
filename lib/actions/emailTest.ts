"use server";

import { sendEmail, getCorporateEmailConfig } from "@/lib/email";

export async function sendTestCorporateEmailAction(targetEmail: string, customSender?: string) {
  try {
    const destination = (targetEmail || "").trim();
    if (!destination || !destination.includes("@")) {
      return { success: false, error: "Por favor ingresa una dirección de correo válida." };
    }

    const emailCfg = await getCorporateEmailConfig();
    const effectiveSender = customSender?.trim() || emailCfg.senderFormatted;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background-color: #8B0024; padding: 25px; text-align: center; border-bottom: 3px solid #D4AF37;">
          <h1 style="color: #ffffff; margin: 0; font-family: Georgia, serif; font-size: 24px;">Gabriela's Flowers LLC</h1>
          <p style="color: #ffdf92; margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">Prueba de Correo Corporativo</p>
        </div>
        
        <div style="padding: 30px; text-align: center;">
          <h2 style="color: #2a0002; margin-top: 0;">¡Servicio de Correo Conectado con Éxito! ✉️🌸</h2>
          <p style="color: #555555; font-size: 14px; line-height: 1.6;">
            Este es un correo de prueba enviado desde tu servidor de <strong>Gabriela's Flowers LLC</strong> a través del remitente corporativo:
          </p>
          
          <div style="background-color: #fff0ef; border-left: 4px solid #8B0024; padding: 15px; text-align: left; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 3px 0; font-size: 13px; color: #2a0002;"><strong>Remitente Oficial:</strong> ${effectiveSender}</p>
            <p style="margin: 3px 0; font-size: 13px; color: #2a0002;"><strong>Destinatario de Prueba:</strong> ${destination}</p>
            <p style="margin: 3px 0; font-size: 13px; color: #2a0002;"><strong>Fecha & Hora:</strong> ${new Date().toLocaleString("es-US", { timeZone: "America/Chicago" })} (Houston Time)</p>
          </div>

          <p style="color: #888888; font-size: 12px;">
            Los recibos de compra, notificaciones de pedidos y mensajes de contacto se enviarán automáticamente con esta identidad.
          </p>
        </div>

        <div style="background-color: #2a0002; color: #ffdf92; padding: 15px; text-align: center; font-size: 11px; border-top: 1px solid #D4AF37;">
          Gabriela's Flowers LLC • Boutique Digital & Alta Floristería • Houston, Texas
        </div>
      </div>
    `;

    const result = await sendEmail({
      to: destination,
      subject: `🌸 Prueba de Correo Corporativo - Gabriela's Flowers (${customSender ? customSender.split('@')[1]?.replace('>', '') || 'Custom' : 'Oficial'})`,
      html: htmlContent,
      from: effectiveSender,
      replyTo: emailCfg.replyTo,
    });

    if (result.success) {
      return { success: true, message: `Correo de prueba enviado con éxito a ${destination} desde ${effectiveSender}` };
    } else {
      return { success: false, error: result.error || "No se pudo entregar el correo." };
    }
  } catch (error: any) {
    console.error("Error en sendTestCorporateEmailAction:", error);
    return { success: false, error: error?.message || "Error al enviar correo de prueba." };
  }
}
