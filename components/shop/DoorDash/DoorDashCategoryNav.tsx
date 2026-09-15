"use client";

import React, { useState } from "react";
import { Sparkles, ChevronDown } from "lucide-react";

export interface CategoryItem {
  id: string;
  name: string;
  count: number;
}

interface DoorDashCategoryNavProps {
  categories: CategoryItem[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export function DoorDashCategoryNav({
  categories,
  activeCategory,
  onSelectCategory,
}: DoorDashCategoryNavProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleCategoryClick = (id: string) => {
    onSelectCategory(id);
    setIsMobileOpen(false); // en móvil cerramos el menú tras seleccionar para mostrar los productos
  };

  const activeCategoryItem = categories.find((c) => c.id === activeCategory);
  const activeCategoryName = activeCategoryItem ? activeCategoryItem.name : "Categorías";

  return (
    <aside className="w-full lg:w-60 xl:w-64 flex-shrink-0 lg:sticky lg:top-24 self-start space-y-3 lg:pr-2">
      <div className="bg-[#fff8f7] dark:bg-[#0B0C10] rounded-2xl p-4 border border-[#D4AF37]/25 shadow-none">
        
        {/* Encabezado del Menú (en Móvil incluye botón para desplegar/contraer) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#D4AF37]" />
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#8B0024] dark:text-[#FF97A4]">
              Menú de Categorías
            </h3>
          </div>

          {/* Botón en Móvil para desplegar todas las categorías */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8B0024] dark:text-[#FF97A4] bg-[#fff0ef] dark:bg-pink-950/60 px-3 py-1 rounded-full border border-[#D4AF37]/30 transition-all active:scale-95"
          >
            <span>{isMobileOpen ? "Cerrar" : "Explorar"}</span>
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${isMobileOpen ? "rotate-180" : "rotate-0"}`}
            />
          </button>
        </div>

        {/* Vista compacta en Móvil cuando está cerrado: muestra la categoría activa actual */}
        <div className={`lg:hidden ${isMobileOpen ? "hidden" : "block"} pt-1`}>
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#fff0ef] dark:bg-pink-950/60 text-[#8B0024] dark:text-white flex items-center justify-between border-l-4 border-[#8B0024] hover:opacity-90 transition-opacity"
          >
            <span className="truncate pr-2 font-bold">{activeCategoryName}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-300 font-semibold whitespace-nowrap">
              Ver todas ({categories.length}) ▾
            </span>
          </button>
        </div>

        {/* Lista Vertical de Categorías: idéntica a PC tanto en escritorio como en móvil */}
        <nav className={`space-y-1 pt-1 ${isMobileOpen ? "block" : "hidden lg:block"}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between group ${
                    isActive
                      ? "bg-[#fff0ef] dark:bg-pink-950/60 text-[#8B0024] dark:text-white shadow-sm border-l-4 border-[#8B0024]"
                      : "text-gray-800 dark:text-white hover:text-[#8B0024] dark:hover:text-[#FF97A4] hover:bg-[#faeae9]/60 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="truncate pr-2">{cat.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                      isActive
                        ? "bg-[#8B0024] text-white"
                        : "bg-gray-200/80 dark:bg-gray-800/90 text-gray-700 dark:text-white group-hover:bg-[#8B0024]/10 group-hover:text-[#8B0024]"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

      </div>
    </aside>
  );
}
