"use client";

import { useEffect, useRef } from "react";
import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { TrustpilotShowcase } from "./TrustpilotShowcase";

interface ReviewsSectionProps {
  title?: string;
  ratingScore?: string;
  countText?: string;
  trustpilotWidgetHtml?: string;
}

export function ReviewsSection({
  title,
  ratingScore,
  countText,
  trustpilotWidgetHtml,
}: ReviewsSectionProps) {
  const t = useTranslations("Reviews");
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trustpilotWidgetHtml || !widgetRef.current) return;

    // Ejecutar de forma segura scripts incrustados de Trustpilot en React / Next.js
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
  }, [trustpilotWidgetHtml]);

  return (
    <section className="py-16 bg-white dark:bg-[#12131A] border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl space-y-10">
        
        {/* Encabezado Principal de Reseñas Oficial Trustpilot */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2">
            <span className="text-[#E05A30] font-black text-xs uppercase tracking-[0.2em]">
              {t("eyebrow")}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#1A1C1C] dark:text-white tracking-tight">
            {title || t("title")}
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <span className="text-base font-extrabold text-[#1A1C1C] dark:text-white">
              {ratingScore || t("score")}
            </span>
            <span className="text-xs font-bold text-gray-400">•</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50">
              {countText || t("countText")}
            </span>
          </div>
        </div>

        {/* Si el administrador colocó un código incrustado de Trustpilot o Google Reviews */}
        {trustpilotWidgetHtml && trustpilotWidgetHtml.trim() ? (
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-inner flex justify-center">
            <div
              ref={widgetRef}
              className="w-full flex justify-center [&>iframe]:max-w-full"
            />
          </div>
        ) : (
          /* Grid 4 Columnas Oficial Trustpilot (Estilo Screenshot 405) */
          <TrustpilotShowcase
            ratingScore={ratingScore}
            countText={countText}
            layout="full-grid"
          />
        )}
      </div>
    </section>
  );
}
