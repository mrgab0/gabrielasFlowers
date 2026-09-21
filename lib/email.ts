import nodemailer from "nodemailer";
import dbConnect from "@/lib/db";
import { SiteConfig } from "@/lib/models/SiteConfig";

export interface SmtpConfigOverride {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
}

export async function getCorporateEmailConfig() {
  let senderEmail = "sales@flowerforyoullc.com";
  let senderName = "Gabriela's Flowers LLC";
  let replyTo = "sales@flowerforyoullc.com";
  let smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  let smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
  let smtpUser = process.env.SMTP_USER || "";
  let smtpPass = process.env.SMTP_PASS || "";

  // Si SMTP_FROM está definido en el entorno, usarlo como valor base
  if (process.env.SMTP_FROM) {
    const match = process.env.SMTP_FROM.match(/^(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)$/);
    if (match) {
      if (match[1]) senderName = match[1].trim();
      if (match[2]) {
        senderEmail = match[2].trim();
        replyTo = match[2].trim();
      }
    }
  }

  try {
    await dbConnect();
    const config: any = await SiteConfig.findOne({ key: "global" }).lean();
    if (config) {
      if (config.corporateSenderEmail) senderEmail = config.corporateSenderEmail.trim();
      if (config.corporateSenderName) senderName = config.corporateSenderName.trim();
      if (config.corporateReplyToEmail) replyTo = config.corporateReplyToEmail.trim();

      if (config.smtpHostOverride) smtpHost = config.smtpHostOverride.trim();
      if (config.smtpPortOverride && config.smtpPortOverride > 0) smtpPort = config.smtpPortOverride;
      if (config.smtpUserOverride) smtpUser = config.smtpUserOverride.trim();
      if (config.smtpPassOverride) smtpPass = config.smtpPassOverride.trim();
    }
  } catch (e) {
    // Si MongoDB no está disponible en tiempo de ejecución estático, se usan las variables de entorno
  }

  const senderFormatted = `"${senderName}" <${senderEmail}>`;

  return {
    senderFormatted,
    senderEmail,
    senderName,
    replyTo,
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
  };
}

export function getAdminEmails(): string[] {
  const defaults = [
    "iirockalonso@gmail.com",
    "hernandezmiriamcalifornia@gmail.com",
    "flowersforyou403@gmail.com",
  ];
  const rawEnv = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "";
  const envAdmins = rawEnv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const merged = Array.from(new Set([...defaults, ...envAdmins]));
  return merged.filter((email) => email.includes("@"));
}

export async function getTransporter(override?: SmtpConfigOverride) {
  const emailCfg = await getCorporateEmailConfig();

  const host = override?.host || emailCfg.smtpHost;
  const port = override?.port || emailCfg.smtpPort;
  const user = override?.user || emailCfg.smtpUser;
  const pass = override?.pass || emailCfg.smtpPass;

  if (!user || !pass) {
    throw new Error("Credenciales SMTP no configuradas. Por favor define SMTP_USER y SMTP_PASS en las variables de entorno o en el Panel de Administración.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export const DEFAULT_CORPORATE_SENDER = process.env.SMTP_FROM || `"Gabriela's Flowers LLC" <sales@flowerforyoullc.com>`;

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: any[];
  smtpOverride?: SmtpConfigOverride;
}

export async function sendEmail({ to, subject, html, from, replyTo, attachments, smtpOverride }: SendMailOptions) {
  try {
    const emailCfg = await getCorporateEmailConfig();
    const recipients = Array.isArray(to) ? to : [to];
    let fromAddress = from || emailCfg.senderFormatted;
    const replyToAddress = replyTo || emailCfg.replyTo;

    // Detectar si tenemos una API Key de Resend (en RESEND_API_KEY o como smtpPass "re_...")
    const resendApiKey = process.env.RESEND_API_KEY || (emailCfg.smtpPass?.startsWith("re_") ? emailCfg.smtpPass : null) || (smtpOverride?.pass?.startsWith("re_") ? smtpOverride.pass : null);

    if (resendApiKey) {
      const resendPayload: any = {
        from: fromAddress,
        to: recipients,
        reply_to: replyToAddress,
        subject,
        html,
      };

      if (attachments && attachments.length > 0) {
        resendPayload.attachments = attachments.map((att) => ({
          filename: att.filename,
          content: att.content ? (typeof att.content === "string" ? att.content : att.content.toString("base64")) : undefined,
          path: att.path,
        }));
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resendPayload),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData?.message || `Error de Resend (${res.status})`);
      }

      console.log(`[Resend Success] Enviado a ${recipients.join(", ")} desde ${fromAddress} | ID: ${resData.id}`);
      return { success: true, messageId: resData.id, sender: fromAddress };
    }

    // Si no es Resend API, usar NodeMailer SMTP estándar
    const transporter = await getTransporter(smtpOverride);
    const info = await transporter.sendMail({
      from: fromAddress,
      to: recipients.join(", "),
      replyTo: replyToAddress,
      subject,
      html,
      attachments,
    });

    console.log(`[Email Success] Enviado a ${recipients.join(", ")} desde ${fromAddress} | ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, sender: fromAddress };
  } catch (error: any) {
    console.error("[Email Error] Error al enviar correo:", error);
    return { success: false, error: error?.message || "Error al enviar correo" };
  }
}
