"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface TrustpilotShowcaseProps {
  ratingScore?: string;
  countText?: string;
  layout?: "split-column" | "full-grid";
}

// 5 Cajas cuadradas verdes oficiales estilo Trustpilot
export function TrustpilotStarBoxes({
  count = 5,
  size = "md",
}: {
  count?: number;
  size?: "sm" | "md" | "lg";
}) {
  const boxSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5 sm:w-5.5 sm:h-5.5",
    lg: "w-6 h-6 sm:w-7 sm:h-7",
  };
  const starSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3.5 h-3.5",
    lg: "w-4.5 h-4.5",
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`${boxSizes[size]} flex items-center justify-center rounded-[2px] transition-transform ${
            i < count ? "bg-[#00B67A]" : "bg-[#DCDCE6] dark:bg-gray-700"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className={`${starSizes[size]} fill-white`}
            aria-hidden="true"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </div>
      ))}
    </div>
  );
}

// Logo oficial permanente de Trustpilot (Estrella verde + Tipografía)
export function TrustpilotLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 fill-[#00B67A] shrink-0"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className="font-extrabold tracking-tight text-[#1A1C1C] dark:text-white text-base sm:text-lg select-none">
        Trustpilot
      </span>
    </div>
  );
}

export function TrustpilotShowcase({
  ratingScore = "4.9",
  countText,
  layout = "split-column",
}: TrustpilotShowcaseProps) {
  const t = useTranslations("Reviews");
  const locale = useLocale();
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const reviewsList = [
    {
      id: 1,
      name: t("rev1Name"),
      initials: "CM",
      title: t("rev1Title"),
      location: t("rev1Location"),
      rating: 5,
      date: t("rev1Date"),
      comment: t("rev1"),
      verified: true,
      color: "bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300",
    },
    {
      id: 2,
      name: t("rev2Name"),
      initials: "AV",
      title: t("rev2Title"),
      location: t("rev2Location"),
      rating: 5,
      date: t("rev2Date"),
      comment: t("rev2"),
      verified: true,
      color: "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300",
    },
    {
      id: 3,
      name: t("rev3Name"),
      initials: "MR",
      title: t("rev3Title"),
      location: t("rev3Location"),
      rating: 5,
      date: t("rev3Date"),
      comment: t("rev3"),
      verified: true,
      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
    },
  ];

  // Rotación suave del carrusel si el usuario no tiene el cursor encima
  useEffect(() => {
    if (layout === "full-grid" || isPaused) return;
    const interval = setInterval(() => {
      setActiveReviewIdx((prev) => (prev + 1) % reviewsList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [layout, isPaused, reviewsList.length]);

  const handlePrev = () => {
    setActiveReviewIdx((prev) => (prev === 0 ? reviewsList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveReviewIdx((prev) => (prev + 1) % reviewsList.length);
  };

  const activeReview = reviewsList[activeReviewIdx];

  // 1. Tarjeta Resumen Pastel Degradado (Trustpilot Overall Score Card)
  const renderSummaryCard = (compact: boolean = false) => (
    <div
      className={`rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-300 border border-white/80 dark:border-white/10 shadow-sm hover:shadow-md ${
        compact ? "min-h-[280px] sm:min-h-[300px]" : "min-h-[320px]"
      } bg-gradient-to-br from-[#D9F2FD] via-[#E5EFFB] to-[#FDE2E4] dark:from-[#132238] dark:via-[#1c1f33] dark:to-[#2c1d28]`}
    >
      {/* Veredicto de Calificación ("Great" / "Excelente") */}
      <h4 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight mb-2">
        {t("verdict")}
      </h4>

      {/* 5 Cajas Verdes con Estrellas */}
      <div className="my-2">
        <TrustpilotStarBoxes count={5} size="lg" />
      </div>

      {/* Total de Reseñas */}
      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium my-3">
        {locale === "en" ? (
          <>
            Based on <strong className="font-bold text-[#111827] dark:text-white">2,450</strong> reviews
          </>
        ) : (
          <>
            Basado en <strong className="font-bold text-[#111827] dark:text-white">2,450</strong> opiniones
          </>
        )}
      </p>

      {/* Logotipo de Trustpilot */}
      <div className="pt-2">
        <TrustpilotLogo />
      </div>
    </div>
  );

  // 2. Tarjeta Individual de Reseña Verificada
  const renderReviewCard = (rev: typeof reviewsList[0], compact: boolean = false) => (
    <div
      key={rev.id}
      className={`bg-white dark:bg-[#151722] rounded-3xl p-5 sm:p-6 border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative ${
        compact ? "min-h-[280px] sm:min-h-[300px]" : "min-h-[320px]"
      }`}
    >
      <div>
        {/* Estrellas Verdes Trustpilot */}
        <div className="mb-3">
          <TrustpilotStarBoxes count={rev.rating} size="md" />
        </div>

        {/* Título de la Reseña */}
        <h5 className="font-extrabold text-[#111827] dark:text-white text-sm sm:text-base leading-snug mb-2 line-clamp-2">
          {rev.title}
        </h5>

        {/* Contenido / Comentario */}
        <p className="text-xs sm:text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed italic line-clamp-4">
          "{rev.comment}"
        </p>
      </div>

      {/* Autor, Iniciales & Badge de Compra Verificada */}
      <div className="pt-4 mt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0 ${rev.color}`}
          >
            {rev.initials}
          </div>
          <div>
            <span className="font-bold text-xs sm:text-sm text-[#111827] dark:text-white block leading-tight">
              {rev.name}
            </span>
            <span className="text-[10px] text-gray-400 block">{rev.location}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/50">
            <CheckCircle2 size={10} />
            <span className="hidden sm:inline">{t("verifiedPurchase")}</span>
          </span>
          <span className="block text-[10px] text-gray-400 mt-0.5">{rev.date}</span>
        </div>
      </div>
    </div>
  );

  // VISTA A: Columna dividida (para SocialAndReviewsSection manteniendo aspecto 1:1)
  if (layout === "split-column") {
    return (
      <div
        className="w-full space-y-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
          {/* Columna Izquierda: Tarjeta de Puntuación Degradado Trustpilot */}
          {renderSummaryCard(true)}

          {/* Columna Derecha: Tarjeta de Reseña Activa con Carrusel */}
          <div className="relative">
            {renderReviewCard(activeReview, true)}

            {/* Controles del Carrusel (Prev / Next) */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Reseña anterior"
                className="w-7 h-7 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-center hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Siguiente reseña"
                className="w-7 h-7 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-center hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Indicadores de Puntos de Navegación */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {reviewsList.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveReviewIdx(idx)}
              aria-label={`Ver reseña ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeReviewIdx === idx
                  ? "w-6 bg-[#00B67A]"
                  : "w-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // VISTA B: Grid horizontal completo de 4 columnas (1 Resumen + 3 Reseñas)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
      {renderSummaryCard(false)}
      {reviewsList.map((rev) => renderReviewCard(rev, false))}
    </div>
  );
}
