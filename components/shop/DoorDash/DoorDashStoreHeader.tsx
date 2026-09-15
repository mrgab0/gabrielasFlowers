"use client";

import React from "react";
import { Star, MapPin, Clock, PhoneCall, MessageCircle, Search, X, Truck, Store, Sparkles } from "lucide-react";

interface DoorDashStoreHeaderProps {
  storeName?: string;
  coverImage?: string;
  ratingScore?: string;
  reviewCount?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  deliveryMode: "delivery" | "pickup";
  onDeliveryModeChange: (mode: "delivery" | "pickup") => void;
}

export function DoorDashStoreHeader({
  storeName = "Gabriela's Flowers LLC",
  coverImage = "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1600&q=80&auto=format",
  ratingScore = "4.9",
  reviewCount = "+180",
  searchQuery,
  onSearchChange,
  deliveryMode,
  onDeliveryModeChange,
}: DoorDashStoreHeaderProps) {
  return (
    <header className="relative w-full mb-6">
      {/* 1. Portada del Comercio (Store Banner Cover) */}
      <div className="relative w-full h-44 sm:h-56 md:h-64 rounded-3xl overflow-hidden shadow-lg border border-[#D4AF37]/30 bg-[#0F1015]">
        <img
          src={coverImage}
          alt={storeName}
          className="w-full h-full object-cover object-center brightness-90 saturate-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Kicker Flotante en la Portada */}
        <div className="absolute top-4 right-4 hidden sm:inline-flex items-center gap-1.5 bg-[#8B0024]/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-[#D4AF37]/50 shadow-md">
          <Sparkles size={12} className="text-[#D4AF37]" />
          <span>Boutique de Flores de Autor</span>
        </div>
      </div>

      {/* 2. Tarjeta de Perfil & Metadatos del Comercio (Superpuesta estilo DoorDash) */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative -mt-12 sm:-mt-14 z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#D4AF37]/20">
          
          {/* Lado Izquierdo: Avatar + Título + Metadatos */}
          <div className="flex items-start sm:items-center gap-4">
            {/* Avatar Circular con Borde Dorado y Sombra */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white dark:border-[#12131A] shadow-xl bg-white flex-shrink-0">
              <img
                src="/logo.jpg"
                alt={storeName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Información del Comercio */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-[#2a0002] dark:text-white tracking-tight">
                  {storeName}
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Abierto hoy
                </span>
              </div>

              {/* Fila de Metadatos estilo DoorDash */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-300 font-medium">
                <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-white">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span>{ratingScore}</span>
                  <span className="text-gray-500 dark:text-gray-400 font-normal">({reviewCount})</span>
                </div>
                <span>•</span>
                <span>Florería de Lujo • Regalos • $$</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin size={13} className="text-[#8B0024]" />
                  <span>Houston & Pasadena, TX</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 text-[#8B0024] dark:text-pink-300 font-semibold">
                  <Clock size={13} />
                  <span>Entrega el mismo día</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Selector de Entrega/Retiro y Contacto Directo */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {/* Toggle DoorDash: Entrega vs Retiro */}
            <div className="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner">
              <button
                type="button"
                onClick={() => onDeliveryModeChange("delivery")}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  deliveryMode === "delivery"
                    ? "bg-white dark:bg-[#16181F] text-[#8B0024] dark:text-[#FF97A4] shadow-sm scale-105"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                <Truck size={14} />
                <span>Entrega</span>
              </button>
              <button
                type="button"
                onClick={() => onDeliveryModeChange("pickup")}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  deliveryMode === "pickup"
                    ? "bg-white dark:bg-[#16181F] text-[#8B0024] dark:text-[#FF97A4] shadow-sm scale-105"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                <Store size={14} />
                <span>Retiro en Tienda</span>
              </button>
            </div>

            {/* Teléfono Directo */}
            <a
              href="tel:+18323911835"
              className="inline-flex items-center justify-center gap-1.5 bg-[#8B0024] hover:bg-[#2a0002] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
              title="Llamar a la Florería"
            >
              <PhoneCall size={13} className="text-[#D4AF37]" />
              <span>+1 832 391-1835</span>
            </a>
          </div>
        </div>

        {/* 3. Barra de Búsqueda Interna estilo DoorDash */}
        <div className="pt-4 max-w-2xl">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar en el catálogo de Gabriela's Flowers (rosas, ramos, cajas, chocolates)..."
              className="w-full bg-white dark:bg-[#16181F] text-gray-900 dark:text-white placeholder-gray-400 text-xs sm:text-sm pl-11 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B0024]/30 focus:border-[#8B0024] transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
