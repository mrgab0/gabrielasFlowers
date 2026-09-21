"use server";

import dbConnect from "@/lib/db";
import { EmailMessage } from "@/lib/models/EmailMessage";
import { sendEmail, getAdminEmails, getCorporateEmailConfig } from "@/lib/email";

export async function sendContactEmail(formData: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  attachmentUrl?: string;
  attachmentName?: string;
}) {
  try {
    await dbConnect();
    const adminEmails = getAdminEmails();
    const emailCfg = await getCorporateEmailConfig();

    const attachmentsList = formData.attachmentUrl
      ? [
          {
            filename: formData.attachmentName || "referencia_floral.jpg",
            url: formData.attachmentUrl,
            mimeType: "image/jpeg",
          },
        ]
      : [];

    const attachmentHtml = formData.attachmentUrl
      ? `
        <div style="margin-top: 20px; padding: 16px; background-color: #fff0ef; border: 1px solid #ffd1d7; border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0; color: #8B0024; font-size: 14px;">📎 Archivo / Foto de Referencia Adjunta:</h4>
          <div style="text-align: center; margin-bottom: 10px;">
            <a href="${formData.attachmentUrl}" target="_blank" rel="noopener noreferrer">
              <img src="${formData.attachmentUrl}" alt="Foto de referencia" style="max-width: 100%; max-height: 350px; border-radius: 8px; object-fit: contain; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
            </a>
          </div>
          <div style="text-align: center;">
            <a href="${formData.attachmentUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #8B0024; color: #ffffff; padding: 8px 18px; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 12px;">
              📥 Descargar / Ver en Alta Resolución
            </a>
          </div>
        </div>
      `
      : "";

    // Guardar en la bandeja de entrada de MongoDB (EmailMessage)
    try {
      await EmailMessage.create({
        direction: "inbound",
        type: "contact_form",
        from: `"${formData.name}" <${formData.email}>`,
        to: [emailCfg.senderEmail],
        replyTo: formData.email,
        subject: `🌸 Consulta de Contacto: ${formData.name}`,
        bodyHtml: `<div style="font-family: Arial, sans-serif; line-height: 1.6;"><h3 style="color: #8B0024; margin-top: 0;">Mensaje recibido a través de la web:</h3><p><strong>Cliente:</strong> ${formData.name}</p><p><strong>Correo:</strong> ${formData.email}</p><p><strong>Teléfono:</strong> ${formData.phone || "No especificado"}</p><div style="padding: 14px; background: #fff0ef; border-left: 4px solid #8B0024; border-radius: 6px; margin-top: 12px;">${(formData.message || "").replace(/\n/g, "<br>")}</div>${attachmentHtml}</div>`,
        bodyText: formData.message,
        status: "received",
        isRead: false,
        customerName: formData.name,
        customerPhone: formData.phone || "",
        customerEmail: formData.email,
        attachments: attachmentsList,
        createdAt: new Date(),
      });
    } catch (saveErr) {
      console.error("Error guardando mensaje de contacto en MongoDB:", saveErr);
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background-color: #8B0024; color: white; padding: 22px; text-align: center; border-bottom: 3px solid #D4AF37;">
          <h1 style="margin: 0; font-family: Georgia, serif; font-size: 22px;">🌸 Nuevo Mensaje de Contacto</h1>
          <p style="margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.95; color: #ffdf92;">Gabriela's Flowers LLC</p>
        </div>
        <div style="padding: 25px; background-color: #ffffff;">
          <h3 style="color: #2a0002; margin-top: 0; border-bottom: 2px solid #D4AF37; padding-bottom: 5px;">Detalles del Cliente:</h3>
          <p style="margin: 8px 0;"><strong>Nombre:</strong> ${formData.name}</p>
          <p style="margin: 8px 0;"><strong>Correo Electrónico:</strong> <a href="mailto:${formData.email}" style="color: #8B0024; font-weight: bold;">${formData.email}</a></p>
          <p style="margin: 8px 0;"><strong>Teléfono / WhatsApp:</strong> ${formData.phone || "No especificado"}</p>
          
          <h3 style="color: #2a0002; margin-top: 20px; border-bottom: 2px solid #D4AF37; padding-bottom: 5px;">Mensaje / Consulta:</h3>
          <div style="padding: 15px; background-color: #fff0ef; border-left: 4px solid #8B0024; border-radius: 6px; color: #333; line-height: 1.6;">
            ${(formData.message || "").replace(/\n/g, '<br>')}
          </div>
          ${attachmentHtml}
        </div>
        <div style="background-color: #2a0002; color: #ffdf92; padding: 15px; text-align: center; font-size: 12px; border-top: 1px solid #D4AF37;">
          <p style="margin: 0;">Gabriela's Flowers LLC • Boutique Digital</p>
        </div>
      </div>
    `;

    const resendAttachments = formData.attachmentUrl
      ? [
          {
            filename: formData.attachmentName || "referencia_floral.jpg",
            path: formData.attachmentUrl,
          },
        ]
      : undefined;

    // 1. Enviar notificación a los administradores
    const result = await sendEmail({
      to: adminEmails,
      replyTo: formData.email,
      subject: `🌸 Nuevo Mensaje de Contacto: ${formData.name}`,
      html: emailContent,
      attachments: resendAttachments,
    });

    // 2. Si el cliente proporcionó correo válido, enviarle una confirmación automática de recibido
    if (formData.email && formData.email.includes("@")) {
      const customerConfirmationContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background-color: #8B0024; color: white; padding: 22px; text-align: center; border-bottom: 3px solid #D4AF37;">
            <h1 style="margin: 0; font-family: Georgia, serif; font-size: 22px;">Gabriela's Flowers LLC</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.95; color: #ffdf92;">Boutique Digital & Alta Floristería</p>
          </div>
          <div style="padding: 25px; background-color: #ffffff;">
            <h2 style="color: #2a0002; margin-top: 0;">¡Hola ${formData.name}! 🌸</h2>
            <p style="color: #444; line-height: 1.6; font-size: 14px;">
              Hemos recibido tu mensaje correctamente. Nuestro equipo de diseño floral y atención al cliente se pondrá en contacto contigo a la brevedad posible.
            </p>
            <div style="background-color: #fff0ef; border-left: 4px solid #8B0024; padding: 15px; margin: 20px 0; border-radius: 6px; font-size: 13px; color: #555;">
              <strong>Resumen de tu mensaje:</strong><br>
              <em>"${(formData.message || "").replace(/\n/g, '<br>')}"</em>
            </div>
            <p style="color: #666; font-size: 13px;">
              Si necesitas atención urgente o personalizar un arreglo especial de inmediato, puedes escribirnos por WhatsApp:
            </p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="https://wa.me/18323911835" target="_blank" style="background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; font-size: 13px;">
                Contactar por WhatsApp 💬
              </a>
            </div>
          </div>
          <div style="background-color: #2a0002; color: #ffdf92; padding: 15px; text-align: center; font-size: 11px; border-top: 1px solid #D4AF37;">
            Gabriela's Flowers LLC • Houston, Texas
          </div>
        </div>
      `;

      await sendEmail({
        to: formData.email.trim(),
        subject: `🌸 Hemos recibido tu mensaje - Gabriela's Flowers LLC`,
        html: customerConfirmationContent,
        replyTo: emailCfg.replyTo,
      }).catch((e) => console.error("Error enviando confirmación a cliente:", e));
    }

    return result;
  } catch (error: any) {
    console.error("Error enviando correo de contacto:", error);
    return { success: false, error: "Error enviando correo. " + (error?.message || "") };
  }
}
