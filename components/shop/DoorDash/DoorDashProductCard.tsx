"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Check, Sparkles, Flame } from "lucide-react";
import { useCart } from "@/components/shop/Cart/CartContext";
import { useTranslations } from "next-intl";

interface DoorDashProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  description?: string;
  category: string;
  badge?: string;
  image: string;
  isAddon?: boolean;
}

export function DoorDashProductCard({
  id,
  name,
  slug,
  price,
  description,
  category,
  badge,
  image,
  isAddon = false,
}: DoorDashProductCardProps) {
  const { addToCart } = useCart();
  const t = useTranslations("common");
  const [justAdded, setJustAdded] = useState(false);

  const optimizeImageUrl = (url: string) => {
    if (!url) return "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&q=80&auto=format";
    if (url.includes("ik.imagekit.io") && !url.includes("tr=")) {
      return url.includes("?") ? `${url}&tr=w-400,q-80,f-auto` : `${url}?tr=w-400,q-80,f-auto`;
    }
    if (url.includes("images.unsplash.com") && !url.includes("w=")) {
      return `${url}${url.includes("?") ? "&" : "?"}w=400&q=80&auto=format`;
    }
    return url;
  };

  const optimizedImage = optimizeImageUrl(image);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      id,
      name,
      price,
      image: optimizedImage,
    });

    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1600);
  };

  // Resumen o descripción por defecto estilo DoorDash
  const itemDescription =
    description && description.trim().length > 0
      ? description
      : isAddon
      ? "Detalle especial complementario para acompañar tu arreglo floral."
      : "Diseño floral artesanal exclusivo con flores frescas seleccionadas.";

  const href = isAddon ? "/checkout" : `/productos/${slug}`;

  return (
    <div className="group relative bg-white dark:bg-[#16181F] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800/80 hover:border-[#D4AF37]/50 hover:shadow-[0_10px_30px_rgba(42,0,2,0.08)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 flex justify-between gap-3 sm:gap-4 select-none cursor-pointer">
      {/* Enlace al detalle en toda la tarjeta */}
      <Link href={href} className="flex-1 flex flex-col justify-between min-w-0 pr-1">
        <div className="space-y-1 sm:space-y-1.5">
          {/* Badge o Insignia Superior */}
          {badge && (
            <div className="inline-flex items-center gap-1 bg-[#fff0ef] dark:bg-pink-950/60 text-[#8B0024] dark:text-[#FF97A4] border border-[#D4AF37]/30 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider mb-1">
              <Flame size={11} className="text-amber-500" />
              <span>{badge}</span>
            </div>
          )}

          {/* Nombre del Producto */}
          <h3 className="font-serif font-bold text-base sm:text-lg text-[#2a0002] dark:text-white group-hover:text-[#8B0024] dark:group-hover:text-[#FF97A4] transition-colors leading-snug line-clamp-2">
            {name}
          </h3>

          {/* Snippet de Descripción (2 líneas) */}
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-normal">
            {itemDescription}
          </p>
        </div>

        {/* Precio & Categoría en la parte inferior */}
        <div className="pt-3 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-black text-[#8B0024] dark:text-[#FF97A4] font-serif">
            ${price.toFixed(2)}
          </span>
          <span className="text-[11px] text-gray-400 font-medium truncate max-w-[140px]">
            {category}
          </span>
        </div>
      </Link>

      {/* Columna Derecha: Foto Cuadrada + Botón Rápido estilo DoorDash */}
      <div className="relative flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-inner group/img">
        <Link href={href} className="block w-full h-full">
          <img
            src={optimizedImage}
            alt={name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none select-none"
          />
        </Link>

        {/* Botón Circular '+' Flotante de Añadir Rápido al Carrito */}
        <button
          type="button"
          onClick={handleQuickAdd}
          aria-label={`Añadir ${name} al carrito`}
          className={`absolute bottom-2 right-2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 z-10 ${
            justAdded
              ? "bg-emerald-600 text-white scale-110 ring-4 ring-emerald-200 dark:ring-emerald-900"
              : "bg-white dark:bg-[#1A1C24] text-[#2a0002] dark:text-white hover:bg-[#8B0024] hover:text-white hover:scale-110 active:scale-95 border border-gray-200 dark:border-gray-700"
          }`}
          title={justAdded ? "¡Añadido al carrito!" : "Añadir rápido"}
        >
          {justAdded ? (
            <Check size={18} className="stroke-[3] animate-in zoom-in-50 duration-200" />
          ) : (
            <Plus size={20} className="stroke-[2.5]" />
          )}
        </button>
      </div>
    </div>
  );
}
