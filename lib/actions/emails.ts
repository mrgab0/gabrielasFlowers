"use server";

import dbConnect from "@/lib/db";
import { EmailMessage } from "@/lib/models/EmailMessage";
import { sendEmail, getAdminEmails, getCorporateEmailConfig } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function getEmailsAction(params?: {
  folder?: "inbox" | "sent" | "all";
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await dbConnect();
    const folder = params?.folder || "inbox";
    const search = params?.search?.trim() || "";
    const page = params?.page || 1;
    const limit = params?.limit || 50;

    const query: any = {};

    if (folder === "inbox") {
      query.direction = "inbound";
    } else if (folder === "sent") {
      query.direction = "outbound";
    }

    if (params?.type && params.type !== "all") {
      query.type = params.type;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { subject: regex },
        { customerName: regex },
        { customerEmail: regex },
        { customerPhone: regex },
        { from: regex },
        { to: regex },
        { orderId: regex },
      ];
    }

    const total = await EmailMessage.countDocuments(query);
    const unreadCount = await EmailMessage.countDocuments({ direction: "inbound", isRead: false });

    const messages = await EmailMessage.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(messages)),
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (error: any) {
    console.error("Error al obtener correos:", error);
    return { success: false, error: error?.message || "Error al cargar correos." };
  }
}

export async function sendCustomEmailAction(data: {
  to: string | string[];
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  from?: string;
  type?: "direct_email" | "quote" | "delivery_update" | "general";
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  orderId?: string;
  bccAdmins?: boolean;
  attachments?: Array<{
    filename: string;
    url: string;
    size?: number;
    mimeType?: string;
  }>;
}) {
  try {
    await dbConnect();
    const emailCfg = await getCorporateEmailConfig();
    const toRecipients = Array.isArray(data.to)
      ? data.to.map((e) => e.trim()).filter(Boolean)
      : data.to.split(",").map((e) => e.trim()).filter(Boolean);

    if (toRecipients.length === 0) {
      return { success: false, error: "Debes ingresar al menos un correo de destino válido." };
    }

    if (!data.subject.trim()) {
      return { success: false, error: "El asunto del correo no puede estar vacío." };
    }

    if (!data.bodyHtml.trim()) {
      return { success: false, error: "El contenido del mensaje no puede estar vacío." };
    }

    // Lista final de destinatarios
    const adminEmails = getAdminEmails();
    const finalRecipients = [...toRecipients];

    if (data.bccAdmins !== false) {
      for (const adm of adminEmails) {
        if (!finalRecipients.includes(adm)) {
          finalRecipients.push(adm);
        }
      }
    }

    // Plantilla visual Gabriela's Flowers para correos enviados desde el panel
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://flowersforyou.vercel.app";
    const logoSrc = `${siteUrl.replace(/\/$/, "")}/logo.jpg`;

    // Si hay adjuntos con imágenes, insertar vista previa visual elegante
    const attachmentsHtml = data.attachments && data.attachments.length > 0
      ? `
        <div style="margin-top: 20px; padding: 15px; background: #fff0ef; border: 1px solid #ffd1d7; border-radius: 10px;">
          <strong style="color: #8B0024; font-size: 13px;">📎 Archivos y Fotos Adjuntas (${data.attachments.length}):</strong>
          <div style="margin-top: 10px;">
            ${data.attachments.map((att) => {
              const isImg = att.url.match(/\.(jpg|jpeg|png|webp|gif)$/i) || att.mimeType?.startsWith("image/");
              if (isImg) {
                return `
                  <div style="margin-bottom: 10px;">
                    <a href="${att.url}" target="_blank" style="text-decoration: none;">
                      <img src="${att.url}" alt="${att.filename}" style="max-width: 100%; max-height: 280px; border-radius: 8px; border: 1px solid #e5e7eb; display: block; object-fit: cover;" />
                      <span style="font-size: 11px; color: #6b7280; display: block; margin-top: 4px;">🔍 Clic para ampliar: <strong>${att.filename}</strong></span>
                    </a>
                  </div>
                `;
              }
              return `
                <div style="margin-bottom: 6px;">
                  <a href="${att.url}" target="_blank" style="color: #8B0024; font-weight: bold; font-size: 12px; text-decoration: underline;">
                    📄 Descargar archivo: ${att.filename}
                  </a>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `
      : "";

    const wrappedHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background-color: #8B0024; padding: 22px; text-align: center; border-bottom: 3px solid #D4AF37;">
          <table role="presentation" style="margin: 0 auto; border-collapse: collapse;">
            <tr>
              <td style="vertical-align: middle; padding-right: 14px;">
                <img src="${logoSrc}" alt="Gabriela's Flowers Logo" style="width: 46px; height: 46px; border-radius: 50%; border: 2px solid #D4AF37; display: block; object-fit: cover;" />
              </td>
              <td style="vertical-align: middle; text-align: left;">
                <h1 style="color: #ffffff; margin: 0; font-family: Georgia, serif; font-size: 22px; font-weight: bold; letter-spacing: 0.5px;">Gabriela's Flowers LLC</h1>
                <p style="color: #ffdf92; margin: 2px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">Boutique Digital & Alta Floristería</p>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="padding: 25px 30px; color: #333333; line-height: 1.6; font-size: 14px;">
          ${data.bodyHtml}
          ${attachmentsHtml}
        </div>

        <div style="background-color: #2a0002; color: #ffdf92; padding: 15px; text-align: center; font-size: 11px; border-top: 1px solid #D4AF37;">
          Gabriela's Flowers LLC • Houston, Texas • Atención: (832) 391-1835 / (800) 555-3569
        </div>
      </div>
    `;

    const resendAttachments = data.attachments?.map((att) => ({
      filename: att.filename,
      path: att.url,
    }));

    const sendRes = await sendEmail({
      to: finalRecipients,
      from: data.from || emailCfg.senderFormatted,
      subject: data.subject.trim(),
      html: wrappedHtml,
      replyTo: data.from ? (data.from.match(/<(.+)>/)?.[1] || data.from) : emailCfg.replyTo,
      attachments: resendAttachments,
    });

    if (!sendRes.success) {
      return { success: false, error: sendRes.error || "No se pudo entregar el correo." };
    }

    // Registrar en MongoDB
    const logged = await EmailMessage.create({
      direction: "outbound",
      type: data.type || "direct_email",
      from: sendRes.sender || emailCfg.senderFormatted,
      to: toRecipients,
      replyTo: emailCfg.replyTo,
      subject: data.subject.trim(),
      bodyHtml: wrappedHtml,
      bodyText: data.bodyText || "",
      status: "sent",
      isRead: true,
      customerName: data.customerName || "",
      customerPhone: data.customerPhone || "",
      customerEmail: data.customerEmail || toRecipients[0],
      orderId: data.orderId || "",
      resendMessageId: sendRes.messageId || "",
      bccAdmins: data.bccAdmins !== false,
      attachments: data.attachments || [],
      createdAt: new Date(),
    });

    revalidatePath("/admin/correos");
    return {
      success: true,
      message: `Correo enviado exitosamente a ${toRecipients.join(", ")}`,
      data: JSON.parse(JSON.stringify(logged)),
    };
  } catch (error: any) {
    console.error("Error al enviar correo desde el panel:", error);
    return { success: false, error: error?.message || "Error al enviar correo." };
  }
}

export async function markEmailAsReadAction(id: string, isRead: boolean = true) {
  try {
    await dbConnect();
    await EmailMessage.findByIdAndUpdate(id, { isRead });
    revalidatePath("/admin/correos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Error al actualizar estado." };
  }
}

export async function bulkMarkEmailsAsReadAction(ids: string[], isRead: boolean = true) {
  try {
    await dbConnect();
    if (!ids || ids.length === 0) return { success: true };
    await EmailMessage.updateMany({ _id: { $in: ids } }, { isRead });
    revalidatePath("/admin/correos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Error al actualizar correos en lote." };
  }
}

export async function deleteEmailAction(id: string) {
  try {
    await dbConnect();
    await EmailMessage.findByIdAndDelete(id);
    revalidatePath("/admin/correos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Error al eliminar correo." };
  }
}

export async function bulkDeleteEmailsAction(ids: string[]) {
  try {
    await dbConnect();
    if (!ids || ids.length === 0) return { success: true };
    await EmailMessage.deleteMany({ _id: { $in: ids } });
    revalidatePath("/admin/correos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Error al eliminar correos en lote." };
  }
}

export async function getEmailStatsAction() {
  try {
    await dbConnect();
    const unreadInbox = await EmailMessage.countDocuments({ direction: "inbound", isRead: false });
    const totalInbox = await EmailMessage.countDocuments({ direction: "inbound" });
    const totalSent = await EmailMessage.countDocuments({ direction: "outbound" });
    return { success: true, unreadInbox, totalInbox, totalSent };
  } catch (error: any) {
    return { success: false, unreadInbox: 0, totalInbox: 0, totalSent: 0 };
  }
}
