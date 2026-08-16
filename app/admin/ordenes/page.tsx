"use client";

import { useEffect, useState } from "react";
import { getAllOrdersAction, updateOrderStatusAction } from "@/lib/actions/order";
import { Package, Truck, CheckCircle2, Clock, MapPin, User, MessageCircle, RefreshCw, ArrowLeft, Search, Filter, Store, ExternalLink, Calendar, MessageSquare, Heart } from "lucide-react";
import Link from "next/link";

export default function AdminOrdenesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    const res = await getAllOrdersAction();
    if (res.success && res.data) {
      setOrders(res.data);
    }
    setLoading(false);
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const res = await updateOrderStatusAction(orderId, newStatus);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
      );
    } else {
      alert("No se pudo actualizar el estado de la orden.");
    }
    setUpdatingId(null);
  };

  const createWhatsAppNotifyUrl = (order: any) => {
    const phone = (order.customerPhone || "").replace(/\D/g, "");
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://flowersforyou.vercel.app";
    const trackUrl = `${siteUrl}/rastreo`;
    const statusText = order.status || "En Proceso";

    const msg = `¡Hola ${order.customerName}! 🌸 Te notificamos de Flowers For You que tu pedido *${order.orderId}* ha sido actualizado a estado: *${statusText}* ✨\n\nPuedes rastrear el avance en tiempo real aquí: ${trackUrl}`;

    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  // Filtrado de Órdenes
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === "all") return true;
    const status = (order.status || "").toLowerCase();
    if (selectedFilter === "espera") return status.includes("espera") || status.includes("diseño");
    if (selectedFilter === "camino") return status.includes("camino") || status.includes("listo");
    if (selectedFilter === "entregado") return status.includes("entregado") || status.includes("retirado");

    return true;
  });

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 font-bold animate-pulse flex flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-[#FF97A4]" size={28} />
        <span>Cargando Módulo de Despacho & Órdenes...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-pink-50 dark:bg-pink-950/60 text-[#FF97A4] rounded-2xl border border-pink-100 dark:border-pink-900/50">
            <Package size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1C1C] dark:text-white flex items-center gap-2">
              Gestor de Órdenes & Despacho
            </h1>
            <p className="text-xs text-gray-400">Controla y actualiza los estados de envío y retiro para que tus clientes rastreen su pedido en vivo</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={loadOrders}
            className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl transition-colors"
            title="Recargar Pedidos"
          >
            <RefreshCw size={16} />
          </button>

          <Link
            href="/admin"
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-2xl font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Volver al Admin
          </Link>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-[#12131A] p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ID de Pedido, Nombre o Teléfono..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-2xl text-xs font-medium dark:bg-gray-900 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
          />
        </div>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedFilter === "all" ? "bg-white dark:bg-gray-900 text-[#FF97A4] shadow-sm" : "text-gray-500"
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setSelectedFilter("espera")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedFilter === "espera" ? "bg-white dark:bg-gray-900 text-[#FF97A4] shadow-sm" : "text-gray-500"
            }`}
          >
            En Preparación
          </button>
          <button
            onClick={() => setSelectedFilter("camino")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedFilter === "camino" ? "bg-white dark:bg-gray-900 text-[#FF97A4] shadow-sm" : "text-gray-500"
            }`}
          >
            En Camino / Listo
          </button>
          <button
            onClick={() => setSelectedFilter("entregado")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedFilter === "entregado" ? "bg-white dark:bg-gray-900 text-[#FF97A4] shadow-sm" : "text-gray-500"
            }`}
          >
            Entregados
          </button>
        </div>
      </div>

      {/* Lista de Órdenes */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const isPickup = (order.deliveryMethod || "").toLowerCase().includes("pickup") || (order.deliveryMethod || "").toLowerCase().includes("retiro");

            return (
              <div
                key={order._id || order.orderId}
                className="bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 transition-all hover:border-gray-200 dark:hover:border-gray-700"
              >
                {/* Fila 1: Datos Principales */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b pb-4 border-gray-100 dark:border-gray-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#1A1C1C] dark:text-white">
                        {order.orderId}
                      </span>
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(order.createdAt).toLocaleString("es-MX", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <User size={13} className="text-[#FF97A4]" />
                        {order.customerName}
                      </span>
                      <span className="text-gray-400 font-mono">{order.customerPhone}</span>
                    </div>
                  </div>

                  {/* Selector de Estado + Botón Notificar WhatsApp */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">Estado:</span>
                      <select
                        value={order.status || (isPickup ? "En diseño" : "Confirmado")}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                        disabled={updatingId === order.orderId}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A1C1C] dark:text-white focus:ring-2 focus:ring-[#FF97A4] focus:outline-none"
                      >
                        <option value="Confirmado">🕒 Confirmado</option>
                        <option value="En diseño">🌸 En diseño floral</option>
                        <option value="En espera de despacho">📦 En espera de despacho</option>
                        <option value="En camino">🚚 En camino a ubicación</option>
                        <option value="Listo para retirar">🏪 Listo para retirar en boutique</option>
                        <option value="Entregado">✅ Entregado exitosamente</option>
                        <option value="Retirado">✅ Retirado por cliente</option>
                      </select>
                    </div>

                    <a
                      href={createWhatsAppNotifyUrl(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <MessageCircle size={14} />
                      <span>Notificar por WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Fila 2: Dirección, Tarjeta de Dedicatoria y Arreglos Florales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Dirección / GPS / Tarjeta de Dedicatoria */}
                  <div className="p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl space-y-2 border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
                      {isPickup ? "Método: Retiro en Boutique" : "Dirección de Entrega:"}
                    </span>
                    <p className="font-bold text-gray-800 dark:text-gray-200 flex items-start gap-1">
                      {isPickup ? <Store size={14} className="text-purple-500 flex-shrink-0 mt-0.5" /> : <MapPin size={14} className="text-[#FF97A4] flex-shrink-0 mt-0.5" />}
                      <span>{order.address}</span>
                    </p>

                    {order.googleMapsUrl && (
                      <a
                        href={order.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                      >
                        <ExternalLink size={12} />
                        <span>Abrir en Google Maps GPS</span>
                      </a>
                    )}

                    {order.cardMessage && (
                      <div className="bg-pink-50 dark:bg-pink-950/40 p-2.5 rounded-xl border border-pink-200 dark:border-pink-900/50 text-[11px] space-y-0.5 mt-2">
                        <span className="font-extrabold text-[#FF97A4] flex items-center gap-1">
                          <Heart size={12} className="fill-[#FF97A4]" /> Tarjeta de Dedicatoria Impresa:
                        </span>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 italic">
                          "{order.cardMessage}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Arreglos de la Orden con Adicionales y Tax Resaltado */}
                  <div className="p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl space-y-2 border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                      <span>Arreglos Florales ({order.items?.length || 0})</span>
                      <div className="text-right">
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs block">${(order.total || 0).toFixed(2)} USD</span>
                        {order.taxAmount ? (
                          <span className="text-[9px] text-purple-600 dark:text-purple-400 font-semibold block">
                            (Sales Tax: +${order.taxAmount.toFixed(2)})
                          </span>
                        ) : null}
                      </div>
                    </div>
                    
                    <div className="space-y-2 font-medium text-gray-700 dark:text-gray-300">
                      {(order.items || []).map((item: any, i: number) => (
                        <div key={i} className="space-y-1 border-b border-gray-200/50 dark:border-gray-800/50 pb-2 last:border-b-0 last:pb-0">
                          <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                            <span>• {item.name} (x{item.quantity})</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>

                          {item.addons && item.addons.length > 0 && (
                            <div className="pl-3 space-y-1 mt-1">
                              {item.addons.map((add: any, idx: number) => (
                                <div key={idx} className="bg-pink-50 dark:bg-pink-950/40 p-2 rounded-xl border border-pink-200 dark:border-pink-900/50 text-[11px]">
                                  <span className="font-extrabold text-[#FF97A4] block">
                                    ✨ {add.name || add.value} {add.price ? `(+$${add.price.toFixed(2)})` : ''}
                                  </span>
                                  {add.customText && (
                                    <div className="mt-1 bg-white dark:bg-gray-900 p-2 rounded-lg border border-pink-200 dark:border-pink-900/50 text-gray-800 dark:text-gray-200 font-semibold flex items-start gap-1">
                                      <MessageSquare size={12} className="text-[#FF97A4] flex-shrink-0 mt-0.5" />
                                      <span>Texto / Impresión: <strong className="text-[#FF97A4]">"{add.customText}"</strong></span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white dark:bg-[#12131A] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 space-y-2">
            <Package className="mx-auto text-gray-400" size={32} />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No se encontraron órdenes registradas.</p>
            <p className="text-xs text-gray-400">Cuando los clientes realicen compras, aparecerán listadas aquí inmediatamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
