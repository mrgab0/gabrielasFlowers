"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Instagram, Heart, MessageCircle, ExternalLink, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { TrustpilotShowcase } from "./TrustpilotShowcase";

interface SocialAndReviewsSectionProps {
  // Configuración de Reseñas
  enableReviews?: boolean;
  reviewsTitle?: string;
  ratingScore?: string;
  countText?: string;
  trustpilotWidgetHtml?: string;

  // Configuración de Instagram / Feed Social
  enableSocialFeed?: boolean;
  socialTitle?: string;
  embedHtml?: string;
  instagramUrl?: string;
}

// Función para descomponer múltiples códigos de incrustación de Instagram
const parseEmbeds = (rawHtml?: string): string[] => {
  if (!rawHtml || !rawHtml.trim()) return [];

  // Si contiene separador explícito "---"
  if (rawHtml.includes("---")) {
    return rawHtml.split("---").map((s) => s.trim()).filter(Boolean);
  }

  // Si contiene múltiples etiquetas <blockquote o <iframe
  const matches = rawHtml.match(/(?:<blockquote[\s\S]*?<\/blockquote>|<iframe[\s\S]*?<\/iframe>)/gi);
  if (matches && matches.length > 0) {
    return matches.map((m) => m.trim());
  }

  return [rawHtml.trim()];
};

export function SocialAndReviewsSection({
  enableReviews = true,
  reviewsTitle,
  ratingScore,
  countText,
  trustpilotWidgetHtml,
  enableSocialFeed = true,
  socialTitle = "Instagram @GabrielasFlowers 📸",
  embedHtml,
  instagramUrl = "https://instagram.com",
}: SocialAndReviewsSectionProps) {
  const t = useTranslations("Reviews");
  const sectionRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const embedList = parseEmbeds(embedHtml);
  const hasEmbeds = embedList.length > 0;

  // Detección de visibilidad para carga diferida de scripts pesados
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsSectionVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Cargar Trustpilot sólo cuando el usuario hace scroll hacia la sección
  useEffect(() => {
    if (!isSectionVisible || !trustpilotWidgetHtml || !widgetRef.current) return;
    const container = widgetRef.current;
    container.innerHTML = trustpilotWidgetHtml;

    const scripts = Array.from(container.querySelectorAll("script"));
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [trustpilotWidgetHtml, isSectionVisible]);

  // Cargar y procesar script oficial de Instagram Embeds sólo al acercarse
  useEffect(() => {
    if (isSectionVisible && hasEmbeds && typeof window !== "undefined") {
      if ((window as any).instgrm) {
        (window as any).instgrm.Embeds?.process();
      } else {
        const existingScript = document.getElementById("instagram-embed-script");
        if (!existingScript) {
          const script = document.createElement("script");
          script.id = "instagram-embed-script";
          script.src = "//www.instagram.com/embed.js";
          script.async = true;
          document.body.appendChild(script);
        }
      }
    }
  }, [embedHtml, currentSlide, hasEmbeds, isSectionVisible]);

  // Publicaciones de muestra de Instagram para el Slider nativo cuando no hay embeds personalizados
  const instagramPosts = [
    {
      id: "post1",
      image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&auto=format&fit=crop&q=80",
      caption: "El lujo de regalar rosas frescas rojas seleccionadas a mano. 🌹 #GabrielasFlowers #HoustonTx",
      likes: 248,
      comments: 18,
    },
    {
      id: "post2",
      image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&auto=format&fit=crop&q=80",
      caption: "Girasoles y lirios que iluminan cualquier espacio. 🌻✨ #BoutiqueFloral #HoustonEvents",
      likes: 194,
      comments: 12,
    },
    {
      id: "post3",
      image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=800&auto=format&fit=crop&q=80",
      caption: "Orquídeas blancas imperiales para expresar distinción y elegancia. 🤍 #Orquideas",
      likes: 312,
      comments: 24,
    },
    {
      id: "post4",
      image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&auto=format&fit=crop&q=80",
      caption: "Caja Deluxe de rosas rosadas y hortensias. El detalle perfecto para enamorar. 💕",
      likes: 410,
      comments: 31,
    },
    {
      id: "post5",
      image: "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&auto=format&fit=crop&q=80",
      caption: "Felicidad en tonos pasteles con nuestro bouquet de tulipanes holandeses. 🌷",
      likes: 285,
      comments: 15,
    },
  ];

  const totalSlides = hasEmbeds ? embedList.length : instagramPosts.length;

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  if (!enableReviews && !enableSocialFeed) return null;

  return (
    <section ref={sectionRef} className="relative z-20 py-16 bg-[#fff8f7]/90 dark:bg-[#0B0C10]/90 backdrop-blur-sm border-t border-[#D4AF37]/20 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl relative z-20">
        <div className={`grid grid-cols-1 ${enableReviews && enableSocialFeed ? "lg:grid-cols-12" : "max-w-4xl mx-auto"} gap-8 items-stretch`}>

          {/* COLUMNA IZQUIERDA: Reseñas Verificadas & Trustpilot (Mismo lugar y relación de aspecto) */}
          {enableReviews && (
            <div className={`${enableSocialFeed ? "lg:col-span-6" : "col-span-1"} bg-white dark:bg-[#12131A] p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col justify-between space-y-6 relative z-10`}>
              <div>
                {/* Header Oficial estilo Trustpilot */}
                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100 dark:border-gray-800">
                  <div className="inline-flex items-center gap-2">
                    <span className="text-[#E05A30] font-black text-xs uppercase tracking-[0.2em]">
                      {t("eyebrow")}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    <ShieldCheck size={12} />
                    <span>{t("badge")}</span>
                  </div>
                </div>

                {/* Título de la Sección de Reseñas */}
                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1A1C1C] dark:text-white tracking-tight mb-4">
                  {reviewsTitle || t("title")}
                </h3>

                {/* Si existe un Widget incrustado de Trustpilot / Google Reviews */}
                {trustpilotWidgetHtml && trustpilotWidgetHtml.trim() ? (
                  <div
                    ref={widgetRef}
                    className="w-full flex justify-center border border-gray-100 dark:border-gray-800 rounded-2xl p-4 bg-gray-50 dark:bg-gray-900/50"
                  />
                ) : (
                  /* Tarjetas y Calificación Oficial de Trustpilot (Estilo Screenshot 405) */
                  <TrustpilotShowcase
                    ratingScore={ratingScore}
                    countText={countText}
                    layout={enableSocialFeed ? "split-column" : "full-grid"}
                  />
                )}
              </div>

              {/* Pie con Nota de Confianza */}
              <div className="pt-2 text-center border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  ⭐⭐⭐⭐⭐ Calificación promedio de 4.9 en Trustpilot basada en clientes de Houston & alrededores.
                </span>
              </div>
            </div>
          )}

          {/* COLUMNA DERECHA: Instagram Live Feed & Slider Incrustado */}
          {enableSocialFeed && (
            <div className={`${enableReviews ? "lg:col-span-6" : "col-span-1"} bg-white dark:bg-[#12131A] p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden z-10`}>
              <div>
                {/* Header de Instagram */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-md">
                      <Instagram size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#1A1C1C] dark:text-white flex items-center gap-1">
                        Instagram Live Feed
                        <Sparkles size={12} className="text-[#8B0024] dark:text-[#FF97A4]" />
                      </h4>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 font-semibold">@GabrielasFlowers LLC</p>
                    </div>
                  </div>

                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-pink-100 dark:bg-pink-950/60 text-[#8B0024] dark:text-pink-300 border border-pink-200 dark:border-pink-900/50 hover:bg-[#8B0024] hover:text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Seguir</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#1A1C1C] dark:text-white tracking-tight mb-4">
                  {socialTitle}
                </h3>

                {/* Opción A: Slider de Códigos Incrustados / Embeds Reales de Instagram */}
                {hasEmbeds ? (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-3 flex justify-center min-h-[380px] items-center">
                      <div
                        key={currentSlide}
                        className="w-full flex justify-center [&>iframe]:max-w-full [&>iframe]:rounded-xl [&>blockquote]:mx-auto transition-all duration-300"
                        dangerouslySetInnerHTML={{ __html: embedList[currentSlide % embedList.length] }}
                      />

                      {/* Controles del Slider si hay más de 1 Embed */}
                      {embedList.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevSlide}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all z-20"
                            aria-label="Anterior publicación"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            onClick={handleNextSlide}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all z-20"
                            aria-label="Siguiente publicación"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Puntos Indicadores si hay múltiples Embeds */}
                    {embedList.length > 1 && (
                      <div className="flex justify-center items-center gap-1.5 pt-1">
                        {embedList.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-2 rounded-full transition-all ${
                              currentSlide === idx ? "w-6 bg-[#FF97A4]" : "w-2 bg-gray-200 dark:bg-gray-800"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Opción B: Slider Nativo de Publicaciones de Instagram */
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-[#F9F9F9] dark:bg-gray-900/60">

                      {/* Imagen y Tarjeta de la Publicación de Instagram Activa */}
                      <div className="relative aspect-[4/3] sm:aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800 group">
                        <img
                          src={instagramPosts[currentSlide].image}
                          alt="Instagram post"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                          <p className="text-xs sm:text-sm font-medium line-clamp-2 mb-2 drop-shadow-sm">
                            {instagramPosts[currentSlide].caption}
                          </p>
                          <div className="flex items-center gap-4 text-xs font-bold text-gray-200">
                            <span className="flex items-center gap-1">
                              <Heart size={14} className="text-rose-500 fill-rose-500" />
                              {instagramPosts[currentSlide].likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle size={14} className="text-white" />
                              {instagramPosts[currentSlide].comments}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Flechas de Navegación del Slide */}
                      <button
                        onClick={handlePrevSlide}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all z-10"
                        aria-label="Anterior publicación"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <button
                        onClick={handleNextSlide}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-white p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all z-10"
                        aria-label="Siguiente publicación"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>

                    {/* Indicadores / Puntos del Slide de Instagram */}
                    <div className="flex justify-center items-center gap-1.5 pt-1">
                      {instagramPosts.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-2 rounded-full transition-all ${
                            currentSlide === idx ? "w-6 bg-[#FF97A4]" : "w-2 bg-gray-200 dark:bg-gray-800"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón inferior de acción a Instagram */}
              <div className="pt-2">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl shadow-lg shadow-pink-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Instagram size={16} />
                  <span>Ver todas las publicaciones en Instagram</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
