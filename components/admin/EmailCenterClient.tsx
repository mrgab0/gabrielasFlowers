"use client";

import { useState, useTransition, useRef } from "react";
import {
  Mail,
  Inbox,
  Send,
  PenSquare,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle2,
  User,
  Phone,
  MessageCircle,
  Sparkles,
  Reply,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Check,
  X,
  Clock,
  Filter,
  Paperclip,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Upload,
  Loader2,
} from "lucide-react";
import {
  getEmailsAction,
  sendCustomEmailAction,
  markEmailAsReadAction,
  bulkMarkEmailsAsReadAction,
  deleteEmailAction,
  bulkDeleteEmailsAction,
} from "@/lib/actions/emails";
import { IKContext, IKUpload } from "imagekitio-react";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/nzjtc1avv";
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_huW/0HuThqhQncgbm14znTZHVpk=";

const authenticator = async () => {
  try {
    const response = await fetch("/api/imagekit-auth");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en auth API: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    return {
      signature: data.signature,
      expire: data.expire,
      token: data.token,
    };
  } catch (error: any) {
    console.error("Error al autenticar ImageKit:", error);
    throw error;
  }
};

interface EmailAttachment {
  filename: string;
  url: string;
  size?: number;
  mimeType?: string;
}

interface EmailItem {
  _id: string;
  direction: "inbound" | "outbound";
  type: "contact_form" | "direct_email" | "order_receipt" | "quote" | "delivery_update" | "incoming_reply" | "general";
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  status: "sent" | "received" | "failed" | "draft";
  isRead: boolean;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  orderId?: string;
  attachments?: EmailAttachment[];
  createdAt: string;
}

interface Props {
  initialMessages: EmailItem[];
  initialTotal: number;
  initialUnread: number;
  initialSentCount: number;
  initialInboxCount: number;
}

export const SENDER_ALIASES = [
  {
    id: "sales",
    label: "🌸 sales@flowerforyoullc.com (Ventas & Boutique)",
    formatted: '"Gabriela\'s Flowers • Ventas" <sales@flowerforyoullc.com>',
  },
  {
    id: "info",
    label: "ℹ️ info@flowerforyoullc.com (Información General)",
    formatted: '"Gabriela\'s Flowers • Información" <info@flowerforyoullc.com>',
  },
  {
    id: "support",
    label: "💬 support@flowerforyoullc.com (Atención al Cliente)",
    formatted: '"Gabriela\'s Flowers • Atención al Cliente" <support@flowerforyoullc.com>',
  },
  {
    id: "orders",
    label: "📦 orders@flowerforyoullc.com (Gestión de Pedidos)",
    formatted: '"Gabriela\'s Flowers • Pedidos" <orders@flowerforyoullc.com>',
  },
  {
    id: "delivery",
    label: "🚚 delivery@flowerforyoullc.com (Despacho & Rutas)",
    formatted: '"Gabriela\'s Flowers • Despacho" <delivery@flowerforyoullc.com>',
  },
  {
    id: "gerencia",
    label: "👑 gerencia@flowerforyoullc.com (Gerencia / Dirección)",
    formatted: '"Gabriela\'s Flowers • Gerencia" <gerencia@flowerforyoullc.com>',
  },
];

const TEMPLATES = [
  {
    id: "blank",
    name: "✉️ Mensaje en Blanco (Personalizado)",
    defaultSender: SENDER_ALIASES[0].formatted,
    subject: "Información de Gabriela's Flowers LLC",
    body: "<p>Estimado/a cliente,</p><p>Escribimos de Gabriela's Flowers LLC con respecto a...</p><p>Quedamos atentos a cualquier duda o detalle.</p><p>Saludos cordiales,<br><strong>Gabriela's Flowers LLC</strong></p>",
  },
  {
    id: "quote",
    name: "🌸 Cotización de Arreglo Floral Especial",
    defaultSender: SENDER_ALIASES[0].formatted,
    subject: "🌸 Propuesta & Cotización Especial - Gabriela's Flowers LLC",
    body: "<p>¡Hola! 🌸 Qué gusto saludarte.</p><p>En base a tu solicitud, hemos preparado la siguiente propuesta de diseño floral:</p><ul><li><strong>Diseño:</strong> Arreglo Floral Exclusivo</li><li><strong>Flores Principales:</strong> Rosas Premium, Lilies y Follaje Especial</li><li><strong>Valor Estimado:</strong> $0.00 USD (Incluye Dedicatoria Impresa y Envoltorio de Lujo)</li></ul><p>¿Te gustaría personalizar algún color, agregar globos, chocolates o dedicatoria?</p><p>Puedes respondernos directamente a este correo o escribirnos por WhatsApp al (832) 391-1835.</p>",
  },
  {
    id: "delivery",
    name: "🚚 Aviso de Entrega: Arreglo Floral en Camino",
    defaultSender: SENDER_ALIASES[4].formatted,
    subject: "🚚 ¡Tu Arreglo Floral está en Camino! - Gabriela's Flowers LLC",
    body: "<p>¡Excelentes noticias! 🌸🚚</p><p>Queremos informarte que tu pedido floral ha salido de nuestra boutique y <strong>nuestro repartidor ya va en ruta de entrega</strong> a la dirección especificada.</p><p>Tan pronto sea entregado en manos del destinatario, nuestro equipo te lo notificará.</p><p>¡Gracias por confiar en Gabriela's Flowers LLC!</p>",
  },
  {
    id: "coupon",
    name: "🎟️ Regalo Especial: Cupón de Descuento Exclusivo",
    defaultSender: SENDER_ALIASES[0].formatted,
    subject: "🎁 Un Regalo Especial para Ti: Descuento Exclusivo en Gabriela's Flowers",
    body: "<p>¡Hola! 🌸</p><p>Queremos agradecerte por ser parte de la familia <strong>Gabriela's Flowers LLC</strong>.</p><p>Como muestra de aprecio, te obsequiamos un <strong>10% de descuento</strong> en tu próxima compra utilizando el cupón:</p><div style='padding: 12px 20px; background: #fff0ef; border-left: 4px solid #8B0024; font-size: 16px; font-weight: bold; color: #8B0024; margin: 15px 0;'>CUPÓN: GABRIELA10</div><p>Visita nuestro catálogo digital y aplícalo al finalizar tu compra.</p>",
  },
  {
    id: "thanks",
    name: "💌 Agradecimiento & Seguimiento Post-Venta",
    defaultSender: SENDER_ALIASES[2].formatted,
    subject: "🌸 ¡Gracias por tu Compra! - Gabriela's Flowers LLC",
    body: "<p>¡Hola! 🌸</p><p>Esperamos que el arreglo floral haya llevado una gran sonrisa y un momento inolvidable.</p><p>Para nosotros cada detalle cuenta. Si tienes un minuto, nos encantaría saber si todo fue de tu total agrado.</p><p>¡Esperamos acompañarte nuevamente en tus momentos más especiales!</p>",
  },
];

export function EmailCenterClient({
  initialMessages,
  initialTotal,
  initialUnread,
  initialSentCount,
  initialInboxCount,
}: Props) {
  const [messages, setMessages] = useState<EmailItem[]>(initialMessages);
  const [folder, setFolder] = useState<"inbox" | "sent" | "all">("inbox");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [isPending, startTransition] = useTransition();

  // Estados para Selección Múltiple y Visor Inline Acordeón
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Modal de redacción
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [composeAttachments, setComposeAttachments] = useState<EmailAttachment[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const ikUploadRef = useRef<HTMLInputElement>(null);

  const [composeForm, setComposeForm] = useState({
    from: SENDER_ALIASES[0].formatted,
    to: "",
    subject: "",
    bodyHtml: TEMPLATES[0].body,
    customerName: "",
    customerPhone: "",
    bccAdmins: true,
  });
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUploadStart = () => {
    setUploadingAttachment(true);
  };

  const handleUploadError = (err: any) => {
    console.error("Error al subir archivo a ImageKit:", err);
    alert("Hubo un error al subir el archivo. Por favor intenta de nuevo.");
    setUploadingAttachment(false);
  };

  const handleUploadSuccess = (res: any) => {
    setUploadingAttachment(false);
    if (res && res.url) {
      setComposeAttachments((prev) => [
        ...prev,
        {
          filename: res.name || "archivo_adjunto",
          url: res.url,
          size: res.size,
          mimeType: res.fileType,
        },
      ]);
    }
  };

  const handleRemoveComposeAttachment = (index: number) => {
    setComposeAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Recargar correos
  const loadEmails = (targetFolder: "inbox" | "sent" | "all" = folder, targetType = typeFilter, query = searchQuery) => {
    startTransition(async () => {
      const res = await getEmailsAction({
        folder: targetFolder,
        type: targetType === "all" ? undefined : targetType,
        search: query,
      });
      if (res.success && res.data) {
        setMessages(res.data);
        setSelectedIds(new Set());
        if (typeof res.unreadCount === "number") setUnreadCount(res.unreadCount);
      }
    });
  };

  const handleFolderChange = (newFolder: "inbox" | "sent" | "all") => {
    setFolder(newFolder);
    setTypeFilter("all");
    loadEmails(newFolder, "all", searchQuery);
  };

  const handleTypeChange = (newType: string) => {
    setTypeFilter(newType);
    loadEmails(folder, newType, searchQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEmails(folder, typeFilter, searchQuery);
  };

  // Expandir / Contraer Correo Inline (Estilo Gmail)
  const handleToggleExpand = async (email: EmailItem) => {
    const isCurrentlyExpanded = expandedIds.has(email._id);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyExpanded) {
        next.delete(email._id);
      } else {
        next.add(email._id);
      }
      return next;
    });

    // Si no está leído y es entrante, marcarlo como leído automáticamente al abrirlo
    if (!isCurrentlyExpanded && !email.isRead && email.direction === "inbound") {
      setMessages((prev) => prev.map((m) => (m._id === email._id ? { ...m, isRead: true } : m)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await markEmailAsReadAction(email._id, true);
    }
  };

  // Toggle Selección Individual
  const handleToggleSelect = (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(emailId)) {
        next.delete(emailId);
      } else {
        next.add(emailId);
      }
      return next;
    });
  };

  // Seleccionar / Deseleccionar Todos
  const handleSelectAll = () => {
    if (selectedIds.size === messages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(messages.map((m) => m._id)));
    }
  };

  // Acciones en Lote: Marcar como Leído / No Leído
  const handleBulkMarkRead = async (isRead: boolean) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setMessages((prev) =>
      prev.map((m) => (selectedIds.has(m._id) ? { ...m, isRead } : m))
    );

    const affectedInboundUnread = messages.filter(
      (m) => selectedIds.has(m._id) && m.direction === "inbound" && m.isRead !== isRead
    ).length;

    if (isRead) {
      setUnreadCount((prev) => Math.max(0, prev - affectedInboundUnread));
    } else {
      setUnreadCount((prev) => prev + affectedInboundUnread);
    }

    setSelectedIds(new Set());
    await bulkMarkEmailsAsReadAction(ids, isRead);
  };

  // Acciones en Lote: Eliminar Seleccionados
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    if (!confirm(`¿Estás seguro de eliminar los ${ids.length} correos seleccionados?`)) {
      return;
    }

    setMessages((prev) => prev.filter((m) => !selectedIds.has(m._id)));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setSelectedIds(new Set());
    await bulkDeleteEmailsAction(ids);
  };

  // Alternar Estado Leído Individual
  const handleToggleRead = async (email: EmailItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextState = !email.isRead;
    setMessages((prev) => prev.map((m) => (m._id === email._id ? { ...m, isRead: nextState } : m)));
    if (email.direction === "inbound") {
      setUnreadCount((prev) => (nextState ? Math.max(0, prev - 1) : prev + 1));
    }
    await markEmailAsReadAction(email._id, nextState);
  };

  // Eliminar Correo Individual
  const handleDelete = async (emailId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("¿Estás seguro de eliminar este registro de correo?")) return;
    setMessages((prev) => prev.filter((m) => m._id !== emailId));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(emailId);
      return next;
    });
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(emailId);
      return next;
    });
    await deleteEmailAction(emailId);
  };

  // Abrir redactor prellenado para responder
  const handleReply = (email: EmailItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const replyTarget = email.replyTo || email.customerEmail || (email.direction === "inbound" ? email.from : email.to[0]);
    setComposeForm({
      from: SENDER_ALIASES[0].formatted,
      to: replyTarget,
      subject: email.subject.startsWith("Re:") ? email.subject : ("Re: " + email.subject),
      bodyHtml: "<p>¡Hola " + (email.customerName || "") + "! 🌸</p><p>En respuesta a tu consulta...</p><hr style='border: 0; border-top: 1px solid #eee; margin: 15px 0;'><blockquote style='color: #666; font-size: 12px; margin: 0; padding-left: 10px; border-left: 3px solid #8B0024;'><strong>Mensaje Previo:</strong><br>" + (email.bodyHtml || email.bodyText || "") + "</blockquote>",
      customerName: email.customerName || "",
      customerPhone: email.customerPhone || "",
      bccAdmins: true,
    });
    setIsComposeOpen(true);
  };

  // Aplicar plantilla
  const handleApplyTemplate = (templateId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setComposeForm((prev) => ({
      ...prev,
      from: tpl.defaultSender || prev.from,
      subject: prev.subject || tpl.subject,
      bodyHtml: tpl.body,
    }));
  };

  // Enviar correo
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeForm.to.trim() || !composeForm.subject.trim() || !composeForm.bodyHtml.trim()) {
      alert("Por favor completa destinatario, asunto y mensaje.");
      return;
    }

    setSending(true);
    setFeedbackMsg(null);

    try {
      const res = await sendCustomEmailAction({
        from: composeForm.from,
        to: composeForm.to,
        subject: composeForm.subject,
        bodyHtml: composeForm.bodyHtml,
        customerName: composeForm.customerName,
        customerPhone: composeForm.customerPhone,
        customerEmail: composeForm.to,
        bccAdmins: composeForm.bccAdmins,
        attachments: composeAttachments.length > 0 ? composeAttachments : undefined,
      });

      if (res.success) {
        setFeedbackMsg({ type: "success", text: "¡Correo enviado con éxito desde " + (composeForm.from.match(/<(.+)>/)?.[1] || composeForm.from) + "!" });
        setTimeout(() => {
          setIsComposeOpen(false);
          setFeedbackMsg(null);
          setComposeAttachments([]);
          setComposeForm({
            from: SENDER_ALIASES[0].formatted,
            to: "",
            subject: "",
            bodyHtml: TEMPLATES[0].body,
            customerName: "",
            customerPhone: "",
            bccAdmins: true,
          });
          loadEmails();
        }, 1500);
      } else {
        setFeedbackMsg({ type: "error", text: res.error || "Error al enviar correo." });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err?.message || "Error inesperado de conexión." });
    } finally {
      setSending(false);
    }
  };

  const isAllSelected = messages.length > 0 && selectedIds.size === messages.length;
  const isPartiallySelected = selectedIds.size > 0 && selectedIds.size < messages.length;

  return (
    <div className="bg-white dark:bg-[#181922] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col min-h-[750px]">
      
      {/* Barra Superior del Centro de Correos */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-50 dark:bg-pink-950/60 rounded-2xl text-[#8B0024] dark:text-[#FF97A4] border border-pink-200 dark:border-pink-900/50">
            <Mail size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white font-serif tracking-tight">
                Centro de Correos & Webmail
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300">
                Resend Conectado
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              Administra múltiples correos con selección masiva y vista de hilo expandible directamente bajo cada mensaje.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              setComposeForm({
                from: SENDER_ALIASES[0].formatted,
                to: "",
                subject: "",
                bodyHtml: TEMPLATES[0].body,
                customerName: "",
                customerPhone: "",
                bccAdmins: true,
              });
              setIsComposeOpen(true);
            }}
            className="flex-1 md:flex-initial bg-[#8B0024] hover:bg-[#70001d] text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md shadow-[#8B0024]/20 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <PenSquare size={16} />
            <span>Redactar Correo</span>
          </button>

          <button
            onClick={() => loadEmails()}
            disabled={isPending}
            title="Refrescar lista"
            className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-2xl transition-all"
          >
            <RefreshCw size={16} className={isPending ? "animate-spin text-[#8B0024]" : ""} />
          </button>
        </div>
      </div>

      {/* Cuerpo Principal: Sidebar de Carpetas + Feed Expandible Inline */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        
        {/* Columna Izquierda: Carpetas y Filtros (3 columnas) */}
        <div className="lg:col-span-3 border-r border-gray-200 dark:border-gray-800 p-4 space-y-4 bg-gray-50/30 dark:bg-gray-900/10">
          
          <div className="space-y-1">
            <button
              onClick={() => handleFolderChange("inbox")}
              className={"w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all " + (
                folder === "inbox" && typeFilter === "all"
                  ? "bg-[#fff0ef] dark:bg-[#8B0024]/20 text-[#8B0024] dark:text-[#FF97A4] border border-[#ffd1d7] dark:border-[#8B0024]/40 font-black"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Inbox size={16} />
                <span>Bandeja de Entrada</span>
              </div>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#8B0024] text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleFolderChange("sent")}
              className={"w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all " + (
                folder === "sent"
                  ? "bg-[#fff0ef] dark:bg-[#8B0024]/20 text-[#8B0024] dark:text-[#FF97A4] border border-[#ffd1d7] dark:border-[#8B0024]/40 font-black"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Send size={16} />
                <span>Enviados</span>
              </div>
            </button>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 block mb-1">
              Filtrar por Categoría
            </span>

            <button
              onClick={() => handleTypeChange("contact_form")}
              className={"w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all " + (
                typeFilter === "contact_form"
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              )}
            >
              <span>🌸</span>
              <span>Formularios Web</span>
            </button>

            <button
              onClick={() => handleTypeChange("order_receipt")}
              className={"w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all " + (
                typeFilter === "order_receipt"
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              )}
            >
              <span>🛍️</span>
              <span>Recibos de Órdenes</span>
            </button>

            <button
              onClick={() => handleTypeChange("direct_email")}
              className={"w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all " + (
                typeFilter === "direct_email"
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              )}
            >
              <span>✉️</span>
              <span>Mensajes Directos</span>
            </button>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar correo o cliente..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8B0024]"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            </form>
          </div>

          <div className="p-3 bg-[#fff0ef] dark:bg-pink-950/20 border border-[#ffd1d7] dark:border-pink-900/40 rounded-2xl text-[11px] text-gray-600 dark:text-gray-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#8B0024] dark:text-[#FF97A4]">
              <Sparkles size={13} />
              <span>Múltiples Alias Activos</span>
            </div>
            <p>
              Envía desde cualquier cuenta corporativa oficial y visualiza el historial de respuestas expandible en tiempo real.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Feed Expandible Inline con Acciones en Lote (9 columnas) */}
        <div className="lg:col-span-9 flex flex-col bg-white dark:bg-[#181922]">
          
          {/* Barra de Herramientas de Selección Múltiple y Acciones Masivas */}
          <div className="p-3.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40 flex items-center justify-between gap-3 min-h-[52px]">
            
            <div className="flex items-center gap-3">
              {/* Checkbox Maestro para Seleccionar Todos */}
              <button
                type="button"
                onClick={handleSelectAll}
                title={isAllSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                {isAllSelected ? (
                  <CheckSquare size={18} className="text-[#8B0024]" />
                ) : isPartiallySelected ? (
                  <div className="w-[18px] h-[18px] rounded border-2 border-[#8B0024] bg-pink-100 dark:bg-pink-950 flex items-center justify-center">
                    <span className="w-2 h-0.5 bg-[#8B0024]" />
                  </div>
                ) : (
                  <Square size={18} className="text-gray-400" />
                )}
                <span className="hidden sm:inline text-gray-600 dark:text-gray-300 text-xs">
                  {selectedIds.size > 0 ? `${selectedIds.size} seleccionados` : "Seleccionar todos"}
                </span>
              </button>

              {/* Botón de Expansión Global */}
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (expandedIds.size === messages.length) {
                      setExpandedIds(new Set());
                    } else {
                      setExpandedIds(new Set(messages.map((m) => m._id)));
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {expandedIds.size === messages.length ? "Contraer todos" : "Expandir todos"}
                </button>
              )}
            </div>

            {/* Acciones en Lote Flotantes cuando hay correos seleccionados */}
            {selectedIds.size > 0 ? (
              <div className="flex items-center gap-2 animate-in fade-in duration-200">
                <button
                  type="button"
                  onClick={() => handleBulkMarkRead(true)}
                  className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  title="Marcar como leídos"
                >
                  <Eye size={14} className="text-emerald-500" />
                  <span className="hidden sm:inline">Marcar leídos</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkMarkRead(false)}
                  className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  title="Marcar como no leídos"
                >
                  <EyeOff size={14} className="text-amber-500" />
                  <span className="hidden sm:inline">No leídos</span>
                </button>

                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  title="Eliminar seleccionados"
                >
                  <Trash2 size={14} />
                  <span>Eliminar ({selectedIds.size})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Cancelar selección"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="text-xs text-gray-400 font-medium">
                {messages.length} {messages.length === 1 ? "correo" : "correos"} en esta vista
              </div>
            )}

          </div>

          {/* Lista de Correos con Acordeón Desplegable Directo Debajo */}
          <div className="overflow-y-auto max-h-[720px] divide-y divide-gray-100 dark:divide-gray-800">
            {messages.length === 0 ? (
              <div className="p-16 text-center text-gray-400 space-y-3">
                <Mail size={44} className="mx-auto text-gray-300 dark:text-gray-700" />
                <p className="text-sm font-bold text-gray-600 dark:text-gray-300">No se encontraron correos en esta bandeja</p>
                <p className="text-xs text-gray-400">Prueba cambiando los filtros o la búsqueda</p>
              </div>
            ) : (
              messages.map((email) => {
                const isExpanded = expandedIds.has(email._id);
                const isSelected = selectedIds.has(email._id);
                const isUnread = !email.isRead && email.direction === "inbound";
                
                const formattedDate = new Date(email.createdAt).toLocaleDateString("es-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                // Snippet limpio sin etiquetas HTML
                const cleanSnippet = (email.bodyText || email.bodyHtml || "")
                  .replace(/<[^>]*>?/gm, " ")
                  .replace(/\s+/g, " ")
                  .trim()
                  .slice(0, 110);

                return (
                  <div
                    key={email._id}
                    className={"transition-colors " + (
                      isExpanded
                        ? "bg-[#fff0ef]/40 dark:bg-pink-950/20"
                        : isSelected
                        ? "bg-[#fff0ef]/60 dark:bg-pink-950/30"
                        : isUnread
                        ? "bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/60"
                        : "hover:bg-gray-50/70 dark:hover:bg-gray-800/40"
                    )}
                  >
                    
                    {/* Fila Principal de Resumen del Correo (Click para abrir visor debajo) */}
                    <div
                      onClick={() => handleToggleExpand(email)}
                      role="button"
                      tabIndex={0}
                      className="p-4 cursor-pointer flex items-start sm:items-center gap-3 select-none"
                    >
                      {/* Checkbox de Selección Múltiple */}
                      <div
                        onClick={(e) => handleToggleSelect(email._id, e)}
                        className="pt-0.5 sm:pt-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                        title={isSelected ? "Deseleccionar" : "Seleccionar"}
                      >
                        {isSelected ? (
                          <CheckSquare size={17} className="text-[#8B0024]" />
                        ) : (
                          <Square size={17} className="text-gray-300 dark:text-gray-600 hover:text-gray-500" />
                        )}
                      </div>

                      {/* Punto de No Leído */}
                      <div className="pt-1.5 sm:pt-0">
                        {isUnread ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#8B0024] shadow-sm animate-pulse" title="No leído" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700" />
                        )}
                      </div>

                      {/* Remitente / Destinatario */}
                      <div className="w-40 sm:w-48 flex-shrink-0">
                        <span className={"text-xs truncate block " + (isUnread ? "font-black text-gray-900 dark:text-white" : "font-semibold text-gray-700 dark:text-gray-300")}>
                          {email.customerName || (email.direction === "inbound" ? email.from.split("<")[0].trim() || email.from : email.to.join(", "))}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono truncate block">
                          {email.direction === "inbound" ? (email.from.match(/<(.+)>/)?.[1] || email.from) : `Para: ${email.to[0]}`}
                        </span>
                      </div>

                      {/* Asunto + Snippet (Estilo Gmail) */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex flex-wrap sm:flex-nowrap items-baseline gap-1.5">
                          <span className={"text-xs truncate " + (isUnread ? "font-extrabold text-gray-900 dark:text-white" : "font-medium text-gray-800 dark:text-gray-200")}>
                            {email.subject}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-normal truncate hidden md:inline">
                            — {cleanSnippet}
                          </span>
                        </div>
                      </div>

                      {/* Badges de Categoría, WhatsApp y Adjuntos */}
                      <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
                        <span className={"text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider " + (
                          email.type === "contact_form"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                            : email.type === "order_receipt"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        )}>
                          {email.type === "contact_form" ? "Formulario" : email.type === "order_receipt" ? "Recibo" : "Directo"}
                        </span>

                        {email.customerPhone && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Phone size={10} />
                            <span>WA</span>
                          </span>
                        )}

                        {email.attachments && email.attachments.length > 0 && (
                          <span className="text-[10px] text-[#8B0024] dark:text-pink-400 font-bold bg-pink-50 dark:bg-pink-950/60 px-2 py-0.5 rounded-full flex items-center gap-1" title={`${email.attachments.length} archivo(s) adjunto(s)`}>
                            <Paperclip size={10} />
                            <span>{email.attachments.length}</span>
                          </span>
                        )}
                      </div>

                      {/* Fecha y Flecha de Expansión */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                          {formattedDate}
                        </span>
                        <div className="text-gray-400 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                          {isExpanded ? <ChevronUp size={16} className="text-[#8B0024]" /> : <ChevronDown size={16} />}
                        </div>
                      </div>

                    </div>

                    {/* Visor Desplegable Inline Directamente Debajo (Estilo Gmail) */}
                    {isExpanded && (
                      <div className="px-6 py-5 border-t border-b border-[#ffd1d7]/80 dark:border-pink-900/40 bg-white dark:bg-[#15161E] space-y-5 animate-in fade-in slide-in-from-top-2 duration-200 shadow-inner">
                        
                        {/* Cabecera del Correo Expandido */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/80 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                          
                          <div className="space-y-1.5 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-sm text-[#1A1C1C] dark:text-white font-serif">
                                {email.subject}
                              </span>
                              <span className={"text-[9px] px-2 py-0.5 rounded-full font-bold uppercase " + (
                                email.type === "contact_form"
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                                  : email.type === "order_receipt"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              )}>
                                {email.type === "contact_form" ? "Formulario Web" : email.type === "order_receipt" ? "Recibo de Pedido" : "Correo Directo"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-gray-600 dark:text-gray-300">
                              <div>
                                <strong className="text-gray-400">De: </strong>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{email.from}</span>
                              </div>
                              <div>
                                <strong className="text-gray-400">Para: </strong>
                                <span>{email.to.join(", ")}</span>
                              </div>
                              {email.customerName && (
                                <div>
                                  <strong className="text-gray-400">Cliente: </strong>
                                  <span className="font-bold text-[#8B0024] dark:text-pink-300">{email.customerName}</span>
                                </div>
                              )}
                              {email.customerPhone && (
                                <div>
                                  <strong className="text-gray-400">Teléfono: </strong>
                                  <a
                                    href={"https://wa.me/" + email.customerPhone.replace(/\D/g, "")}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                                  >
                                    <Phone size={11} /> {email.customerPhone} (WhatsApp)
                                  </a>
                                </div>
                              )}
                              <div>
                                <strong className="text-gray-400">Fecha: </strong>
                                <span>{new Date(email.createdAt).toLocaleString("es-US")}</span>
                              </div>
                            </div>
                          </div>

                          {/* Botones de Acción Inline */}
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => handleReply(email, e)}
                              className="bg-[#8B0024] hover:bg-[#70001d] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
                            >
                              <Reply size={14} />
                              <span>Responder</span>
                            </button>

                            {email.customerPhone && (
                              <a
                                href={"https://wa.me/" + email.customerPhone.replace(/\D/g, "") + "?text=" + encodeURIComponent(
                                  "¡Hola " + (email.customerName || "") + "! 🌸 Te contactamos de Gabriela's Flowers LLC en relación a tu consulta."
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#25D366] hover:bg-[#1EBE5B] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                              >
                                <MessageCircle size={14} />
                                <span>WhatsApp</span>
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={(e) => handleToggleRead(email, e)}
                              title={email.isRead ? "Marcar como no leído" : "Marcar como leído"}
                              className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors"
                            >
                              {email.isRead ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDelete(email._id, e)}
                              title="Eliminar mensaje"
                              className="p-2 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-600 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                        </div>

                        {/* Contenido Renderizado del Correo (Aprovecha Todo el Ancho) */}
                        <div className="p-4 bg-white dark:bg-[#181922] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-x-auto">
                          <div
                            className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
                          />
                        </div>

                        {/* Sección de Archivos y Fotos Adjuntas */}
                        {email.attachments && email.attachments.length > 0 && (
                          <div className="p-4 bg-gray-50/90 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                              <Paperclip size={15} className="text-[#8B0024]" />
                              <span>Archivos y Fotos Adjuntas ({email.attachments.length})</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {email.attachments.map((att, idx) => {
                                const isImg = att.url.match(/\.(jpg|jpeg|png|webp|gif)$/i) || att.mimeType?.startsWith("image/") || att.url.includes("imagekit.io");
                                return (
                                  <div
                                    key={idx}
                                    className="p-3 bg-white dark:bg-[#181922] rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between gap-2 shadow-sm hover:border-[#8B0024] transition-all"
                                  >
                                    <div className="space-y-2">
                                      {isImg ? (
                                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-lg aspect-video bg-black/5">
                                          <img src={att.url} alt={att.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                            <ExternalLink size={14} />
                                            <span>Ver en grande</span>
                                          </div>
                                        </a>
                                      ) : (
                                        <div className="h-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                          <FileText size={32} />
                                        </div>
                                      )}
                                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate" title={att.filename}>
                                        {att.filename}
                                      </p>
                                    </div>

                                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                      <span className="text-[10px] text-gray-400">
                                        {att.size ? `${(att.size / 1024).toFixed(1)} KB` : "Adjunto"}
                                      </span>
                                      <a
                                        href={att.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download={att.filename}
                                        className="text-xs text-[#8B0024] hover:text-[#70001d] font-bold flex items-center gap-1 hover:underline"
                                      >
                                        <Download size={13} />
                                        <span>Descargar</span>
                                      </a>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* Modal para Redactar Correo */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181922] w-full max-w-2xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-5 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-pink-50 dark:bg-pink-950/60 rounded-xl text-[#8B0024] border border-pink-200 dark:border-pink-900/50">
                  <PenSquare size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white font-serif">
                    Redactar Correo Oficial
                  </h3>
                  <span className="text-[10px] text-gray-500 font-medium block">
                    Emite correos corporativos oficiales bajo identidad Gabriela's Flowers
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsComposeOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Selector de Remitente (De:) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    Remitente Oficial (De:) *
                  </label>
                  <select
                    value={composeForm.from}
                    onChange={(e) => setComposeForm({ ...composeForm, from: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8B0024]"
                  >
                    {SENDER_ALIASES.map((alias) => (
                      <option key={alias.id} value={alias.formatted}>
                        {alias.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selector de Plantillas */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    Plantilla Rápida
                  </label>
                  <select
                    onChange={(e) => handleApplyTemplate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8B0024]"
                  >
                    {TEMPLATES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    Destinatario (Para:) *
                  </label>
                  <input
                    type="email"
                    required
                    value={composeForm.to}
                    onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
                    placeholder="cliente@ejemplo.com"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8B0024]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    Nombre del Cliente (Opcional)
                  </label>
                  <input
                    type="text"
                    value={composeForm.customerName}
                    onChange={(e) => setComposeForm({ ...composeForm, customerName: e.target.value })}
                    placeholder="Ej: Maria Gómez"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8B0024]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                  Asunto del Correo *
                </label>
                <input
                  type="text"
                  required
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  placeholder="Ej: Cotización de Arreglo Floral..."
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8B0024]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                  Cuerpo del Mensaje (HTML / Texto) *
                </label>
                <textarea
                  required
                  rows={6}
                  value={composeForm.bodyHtml}
                  onChange={(e) => setComposeForm({ ...composeForm, bodyHtml: e.target.value })}
                  placeholder="Escribe aquí el contenido del correo..."
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-sans text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8B0024]"
                />
              </div>

              {/* Adjuntos en el Redactor (ImageKit) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Paperclip size={14} className="text-[#8B0024]" />
                    <span>Archivos o Fotos Adjuntas ({composeAttachments.length})</span>
                  </label>
                  <span className="text-[10px] text-gray-400">Resend & ImageKit CDN</span>
                </div>

                <IKContext publicKey={publicKey} urlEndpoint={urlEndpoint} authenticator={authenticator}>
                  <IKUpload
                    ref={ikUploadRef}
                    onError={handleUploadError}
                    onSuccess={handleUploadSuccess}
                    onUploadStart={handleUploadStart}
                    style={{ display: "none" }}
                    folder="/admin_attachments"
                    accept="image/*,application/pdf"
                  />

                  {/* Lista de Adjuntos Cargados */}
                  {composeAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {composeAttachments.map((att, idx) => {
                        const isImg = att.url.match(/\.(jpg|jpeg|png|webp|gif)$/i) || att.mimeType?.startsWith("image/") || att.url.includes("imagekit.io");
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 bg-[#fff0ef] dark:bg-pink-950/40 border border-[#ffd1d7] dark:border-pink-900 rounded-xl text-xs max-w-xs animate-in fade-in"
                          >
                            {isImg ? (
                              <img src={att.url} alt={att.filename} className="w-7 h-7 rounded object-cover border border-[#ffd1d7]" />
                            ) : (
                              <FileText size={16} className="text-[#8B0024]" />
                            )}
                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
                              {att.filename}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveComposeAttachment(idx)}
                              className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg text-rose-600 transition-colors"
                              title="Eliminar adjunto"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={uploadingAttachment}
                    onClick={() => ikUploadRef.current?.click()}
                    className="w-full border border-dashed border-gray-300 dark:border-gray-700 hover:border-[#8B0024] bg-gray-50 dark:bg-gray-800/60 hover:bg-pink-50/30 p-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 transition-all"
                  >
                    {uploadingAttachment ? (
                      <>
                        <Loader2 className="animate-spin text-[#8B0024]" size={15} />
                        <span>Subiendo archivo a ImageKit...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} className="text-[#8B0024]" />
                        <span>Adjuntar Foto o Documento (ImageKit)</span>
                      </>
                    )}
                  </button>
                </IKContext>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="bccAdmins"
                  checked={composeForm.bccAdmins}
                  onChange={(e) => setComposeForm({ ...composeForm, bccAdmins: e.target.checked })}
                  className="rounded border-gray-300 text-[#8B0024] focus:ring-[#8B0024]"
                />
                <label htmlFor="bccAdmins" className="text-xs text-gray-600 dark:text-gray-400 font-medium cursor-pointer">
                  Enviar copia simultánea a los administradores
                </label>
              </div>

              {feedbackMsg && (
                <div
                  className={"p-3 rounded-xl text-xs font-bold flex items-center gap-2 " + (
                    feedbackMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                      : "bg-red-50 text-red-800 border border-red-300"
                  )}
                >
                  {feedbackMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-[#8B0024] hover:bg-[#70001d] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:bg-gray-300"
                >
                  {sending ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Enviar Correo</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
