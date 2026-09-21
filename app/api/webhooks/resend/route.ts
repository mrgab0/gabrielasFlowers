import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { EmailMessage } from "@/lib/models/EmailMessage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await dbConnect();

    const eventType = body?.type || "email.delivered";
    const emailData = body?.data || body;

    // Si es un email entrante recibido por Resend
    if (eventType === "email.received" || emailData?.from) {
      const fromAddress = typeof emailData.from === "string" ? emailData.from : emailData?.from?.email || "desconocido";
      const toAddresses = Array.isArray(emailData.to) ? emailData.to : [emailData.to || "sales@flowerforyoullc.com"];
      const subject = emailData.subject || "Sin asunto";
      const htmlContent = emailData.html || emailData.text || "<p>Mensaje sin contenido</p>";

      await EmailMessage.create({
        direction: "inbound",
        type: "incoming_reply",
        from: fromAddress,
        to: toAddresses,
        replyTo: fromAddress,
        subject,
        bodyHtml: htmlContent,
        bodyText: emailData.text || "",
        status: "received",
        isRead: false,
        customerEmail: fromAddress,
        resendMessageId: emailData.id || "",
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error("Error en webhook de Resend:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
