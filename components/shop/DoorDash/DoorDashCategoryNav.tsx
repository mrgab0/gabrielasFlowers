"use client";

import React, { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

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
  const mobilePillsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll del contenedor móvil para mantener la píldora activa visible
  useEffect(() => {
    if (!mobilePillsRef.current) return;
    const activeButton = mobilePillsRef.current.querySelector(`[data-cat="${activeCategory}"]`);
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeCategory]);

  return (
    <>
      {/* 1. MÓVIL: Barra Horizontal Sticky de Pastillas (DoorDash Mobile Bar) */}
      <div className="lg:hidden sticky top-14 sm:top-16 z-30 bg-[#fff8f7]/95 dark:bg-[#0B0C10]/95 backdrop-blur-md border-y border-[#D4AF37]/20 py-2.5 shadow-sm">
        <div
          ref={mobilePillsRef}
          className="flex items-center gap-2 px-4 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                data-cat={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`whitespace-nowrap flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#8B0024] text-white shadow-md scale-105"
                    : "bg-white dark:bg-[#16181F] text-gray-700 dark:text-gray-300 border border-gray-200/80 dark:border-gray-800 hover:border-[#8B0024]/40"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DESKTOP: Menú Lateral Sticky estilo DoorDash (Left Sidebar) */}
      <aside className="hidden lg:block w-60 xl:w-64 flex-shrink-0 sticky top-24 self-start space-y-3 pr-2">
        <div className="bg-white/80 dark:bg-[#12131A]/80 backdrop-blur-md rounded-2xl p-4 border border-[#D4AF37]/20 shadow-[0_4px_20px_rgba(42,0,2,0.03)]">
          <div className="flex items-center gap-2 px-3 pb-3 border-b border-gray-100 dark:border-gray-800/80 mb-2">
            <Sparkles size={14} className="text-[#D4AF37]" />
            <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#8B0024] dark:text-[#FF97A4]">
              Menú de Categorías
            </h3>
          </div>

          <nav className="space-y-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between group ${
                    isActive
                      ? "bg-[#fff0ef] dark:bg-pink-950/50 text-[#8B0024] dark:text-[#FF97A4] shadow-sm border-l-4 border-[#8B0024]"
                      : "text-gray-600 dark:text-gray-300 hover:text-[#2a0002] dark:hover:text-white hover:bg-[#faeae9]/50 dark:hover:bg-gray-800/40"
                  }`}
                >
                  <span className="truncate pr-2">{cat.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                      isActive
                        ? "bg-[#8B0024] text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-[#8B0024]/10 group-hover:text-[#8B0024]"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
