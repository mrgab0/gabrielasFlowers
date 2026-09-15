"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { DoorDashStoreHeader } from "./DoorDashStoreHeader";
import { DoorDashCategoryNav, CategoryItem } from "./DoorDashCategoryNav";
import { DoorDashProductCard } from "./DoorDashProductCard";
import { Search, RefreshCw, ChevronDown } from "lucide-react";

interface DoorDashStoreFeedProps {
  products: any[];
  addons?: any[];
  siteConfig?: any;
  coverImage?: string;
  locale?: string;
  featuredComponent?: React.ReactNode;
}

function slugifyCategory(cat: string) {
  return cat
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function DoorDashStoreFeed({
  products,
  addons = [],
  siteConfig,
  coverImage,
  locale = "es",
  featuredComponent,
}: DoorDashStoreFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<"delivery" | "pickup">("delivery");
  const [activeCategory, setActiveCategory] = useState<string>("populares");
  // Estado para solapar (contraer/expandir) cada categoría
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const isClickScrolling = useRef(false);

  // 1. Filtrado de productos y adicionales según búsqueda en tiempo real
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchName = p.name?.toLowerCase().includes(q);
      const matchCat = p.category?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchFlower = p.flowerType?.toLowerCase().includes(q);
      return matchName || matchCat || matchDesc || matchFlower;
    });
  }, [products, searchQuery]);

  const filteredAddons = useMemo(() => {
    if (!searchQuery.trim()) return addons;
    const q = searchQuery.toLowerCase().trim();
    return addons.filter((a) => {
      const matchName = a.name?.toLowerCase().includes(q);
      const matchCat = a.category?.toLowerCase().includes(q);
      return matchName || matchCat;
    });
  }, [addons, searchQuery]);

  // 2. Reagrupar productos en Categorías reales
  const sections = useMemo(() => {
    const list: {
      id: string;
      name: string;
      items: any[];
      isAddonSection?: boolean;
    }[] = [];

    // Sección 1: Más Populares / Destacados
    const popularItems = filteredProducts.filter(
      (p) => p.isFeatured || Boolean(p.badge)
    );
    if (popularItems.length > 0) {
      list.push({
        id: "populares",
        name: "🔥 Más Populares",
        items: popularItems,
      });
    }

    // Secciones por cada categoría única presente en la base de datos
    const categoriesSet = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        categoriesSet.add(p.category.trim());
      }
    });

    const categoryNames = Array.from(categoriesSet);

    categoryNames.forEach((catName) => {
      const catSlug = slugifyCategory(catName);
      const catItems = filteredProducts.filter((p) => p.category === catName);
      if (catItems.length > 0) {
        list.push({
          id: `cat-${catSlug}`,
          name: catName,
          items: catItems,
        });
      }
    });

    // Sección final: Adicionales & Complementos (Chocolates, Peluches, Globos)
    if (filteredAddons.length > 0) {
      list.push({
        id: "adicionales",
        name: "✨ Adicionales & Regalos",
        items: filteredAddons,
        isAddonSection: true,
      });
    }

    return list;
  }, [filteredProducts, filteredAddons, products]);

  // Lista de categorías para el menú lateral/móvil
  const navCategories: CategoryItem[] = useMemo(() => {
    return sections.map((sec) => ({
      id: sec.id,
      name: sec.name,
      count: sec.items.length,
    }));
  }, [sections]);

  // Alternar expansión de categoría al tocar el encabezado
  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 3. Manejador de clic en categoría del menú: expandir automáticamente y scroll suave a la sección
  const handleSelectCategory = (id: string) => {
    setActiveCategory(id);
    // Asegurar que la categoría se expanda automáticamente
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: true,
    }));

    setTimeout(() => {
      const targetElement = document.getElementById(`section-${id}`);
      if (targetElement) {
        isClickScrolling.current = true;
        const yOffset = -140; // Espacio para el header sticky
        const y =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });

        setTimeout(() => {
          isClickScrolling.current = false;
        }, 800);
      }
    }, 60);
  };

  // 4. Scrollspy automático con IntersectionObserver
  useEffect(() => {
    if (typeof window === "undefined" || sections.length === 0) return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      if (isClickScrolling.current) return;
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace("section-", "");
          setActiveCategory(id);
          break;
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // Zona de lectura activa
      threshold: 0,
    });

    sections.forEach((sec) => {
      const el = document.getElementById(`section-${sec.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="w-full">
      {/* Encabezado del Comercio estilo DoorDash */}
      <DoorDashStoreHeader
        storeName={siteConfig?.heroTitle || "Gabriela's Flowers LLC"}
        coverImage={coverImage}
        ratingScore={siteConfig?.reviewsRatingScore ? siteConfig.reviewsRatingScore.split("/")[0].trim() : "4.9"}
        reviewCount={siteConfig?.reviewsCountText || "+180"}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        deliveryMode={deliveryMode}
        onDeliveryModeChange={setDeliveryMode}
      />

      {/* Componente Destacado (FeaturedProductsSlider SIEMPRE VISIBLE en la parte superior) */}
      {!searchQuery.trim() && featuredComponent && (
        <div className="w-full -mt-2 mb-4">
          {featuredComponent}
        </div>
      )}

      {/* Barra de Categorías Sticky en Móvil */}
      {navCategories.length > 0 && (
        <div className="lg:hidden">
          <DoorDashCategoryNav
            categories={navCategories}
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
          />
        </div>
      )}

      {/* Contenedor Principal en 2 Columnas (Estilo Tienda DoorDash) */}
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-start gap-8">
          
          {/* Columna Izquierda: Menú Lateral Sticky (Desktop) */}
          {navCategories.length > 0 && (
            <DoorDashCategoryNav
              categories={navCategories}
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
            />
          )}

          {/* Columna Derecha: Catálogo Reagrupado por Categorías Solapables */}
          <main className="flex-1 min-w-0 space-y-10">
            {sections.length === 0 ? (
              // Estado vacío cuando no hay resultados de búsqueda
              <div className="bg-white dark:bg-[#16181F] rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm max-w-lg mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#fff0ef] dark:bg-pink-950/50 flex items-center justify-center mx-auto text-[#8B0024] dark:text-[#FF97A4]">
                  <Search size={28} />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#2a0002] dark:text-white">
                  No se encontraron flores ni regalos
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No encontramos resultados para &quot;{searchQuery}&quot;. Intenta con otro término como &quot;rosas&quot;, &quot;bouquets&quot; o &quot;chocolates&quot;.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-2 bg-[#8B0024] hover:bg-[#2a0002] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <RefreshCw size={14} />
                  <span>Ver Todo el Catálogo</span>
                </button>
              </div>
            ) : (
              // Renderizado de cada sección por Categoría (Solapable / Acordeón)
              sections.map((section) => {
                const isSearching = Boolean(searchQuery.trim());
                const isExpanded = isSearching || Boolean(expandedCategories[section.id]);

                return (
                  <section
                    key={section.id}
                    id={`section-${section.id}`}
                    className="scroll-mt-36 space-y-4"
                  >
                    {/* Botón Encabezado de la Categoría (Solapa / Contrae y Expande) */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(section.id)}
                      aria-expanded={isExpanded}
                      className="w-full flex items-center justify-between border-b border-[#D4AF37]/20 pb-3 text-left group cursor-pointer transition-all hover:border-[#8B0024]/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2a0002] dark:text-white tracking-tight group-hover:text-[#8B0024] dark:group-hover:text-[#FF97A4] transition-colors">
                          {section.name}
                        </h2>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full">
                          {section.items.length} {section.items.length === 1 ? "artículo" : "artículos"}
                        </span>
                      </div>

                      {/* Indicador de Despliegue con Chevron */}
                      <div className="flex items-center gap-2">
                        <span className="hidden sm:inline text-[11px] uppercase tracking-wider font-bold text-gray-400 group-hover:text-[#8B0024] dark:group-hover:text-[#FF97A4] transition-colors">
                          {isExpanded ? "Contraer" : "Ver Arreglos"}
                        </span>
                        <div
                          className={`p-1.5 rounded-full bg-[#fff0ef] dark:bg-pink-950/60 border border-[#D4AF37]/30 transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : "rotate-0"
                          }`}
                        >
                          <ChevronDown size={17} className="text-[#8B0024] dark:text-[#FF97A4]" />
                        </div>
                      </div>
                    </button>

                    {/* Cuadrícula de Tarjetas DoorDash (visible al expandir o al buscar) */}
                    {isExpanded && (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-in fade-in-50 slide-in-from-top-1 duration-300">
                        {section.items.map((item: any) => {
                          if (section.isAddonSection) {
                            return (
                              <DoorDashProductCard
                                key={`addon-${item._id}`}
                                id={item._id}
                                name={item.name}
                                slug="adicional"
                                price={item.price}
                                description={item.description || "Complemento ideal para acompañar tu ramo"}
                                category={item.category ? `Adicional: ${item.category}` : "Adicionales"}
                                badge={item.category || "Regalo"}
                                image={item.image || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80&auto=format"}
                                isAddon={true}
                              />
                            );
                          }

                          return (
                            <DoorDashProductCard
                              key={item._id.toString()}
                              id={item._id.toString()}
                              name={item.name}
                              slug={item.slug}
                              price={item.price}
                              description={item.description}
                              category={item.category}
                              badge={item.badge}
                              image={item.images && item.images.length > 0 ? item.images[0] : ""}
                            />
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
