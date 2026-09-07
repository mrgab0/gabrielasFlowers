"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { Footer } from "@/components/shop/Footer";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Check,
  MessageCircle,
  Gift,
  Sparkles,
  MapPin,
  Heart
} from "lucide-react";

interface BlogPostDetailProps {
  post: any;
  locale?: string;
}

export function BlogPostDetail({ post, locale = "es" }: BlogPostDetailProps) {
  const [copied, setCopied] = useState(false);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] dark:bg-[#0B0C10] flex flex-col">
        <ShopHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md">
            <h1 className="text-2xl font-serif font-black text-gray-900 dark:text-white">Artículo no encontrado</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">El post que buscas no existe o fue movido.</p>
            <Link
              href="/nosotros"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#8B0024] text-white rounded-full text-xs font-bold"
            >
              <ArrowLeft size={14} />
              <span>Volver a Nosotros & Blog</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`Mira este artículo de Gabriela's Flowers: ${post.title} ` + (typeof window !== "undefined" ? window.location.href : ""))}`;

  // Formatear markdown básico a HTML seguro
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    const paragraphs = content.split(/\n\n+/);

    return (
      <div className="space-y-6 text-gray-800 dark:text-gray-200 text-sm sm:text-base leading-relaxed">
        {paragraphs.map((para, i) => {
          const trimmed = para.trim();

          // Subtítulo H2 (##)
          if (trimmed.startsWith("## ")) {
            return (
              <h2 key={i} className="text-2xl sm:text-3xl font-serif font-black text-gray-900 dark:!text-white pt-6 pb-1 border-b border-gray-100 dark:border-gray-800">
                {trimmed.replace("## ", "")}
              </h2>
            );
          }

          // Subtítulo H3 (###)
          if (trimmed.startsWith("### ")) {
            return (
              <h3 key={i} className="text-lg sm:text-xl font-serif font-black text-gray-900 dark:!text-white pt-4 pb-0.5">
                {trimmed.replace("### ", "")}
              </h3>
            );
          }

          // Blockquote (>)
          if (trimmed.startsWith("> ")) {
            return (
              <blockquote key={i} className="p-4 sm:p-5 my-4 bg-pink-50/80 dark:bg-pink-950/40 rounded-2xl border-l-4 border-[#FF97A4] text-gray-900 dark:text-gray-100 font-medium italic">
                {trimmed.replace(/^>\s*/, "")}
              </blockquote>
            );
          }

          // Lista de viñetas (-)
          if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            const items = trimmed.split(/\n/).filter((l) => l.trim().length > 0);
            return (
              <ul key={i} className="space-y-2.5 my-3 pl-4 list-disc marker:text-[#FF97A4]">
                {items.map((it, idx) => {
                  const cleanItem = it.replace(/^[-*]\s*/, "");
                  return (
                    <li key={idx} className="font-medium text-gray-700 dark:text-gray-300">
                      {cleanItem}
                    </li>
                  );
                })}
              </ul>
            );
          }

          // Párrafo normal
          return (
            <p key={i} className="font-normal text-gray-700 dark:text-gray-300 leading-relaxed">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] dark:bg-[#0B0C10] text-[#1A1C1C] dark:text-gray-100 flex flex-col transition-colors duration-300">
      <ShopHeader />

      {/* Structured Data JSON-LD para Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt || post.title,
            image: post.mainImage || "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200",
            author: {
              "@type": "Organization",
              name: "Gabriela's Flowers LLC"
            },
            publisher: {
              "@type": "Organization",
              name: "Gabriela's Flowers LLC",
              logo: {
                "@type": "ImageObject",
                url: "https://gabrielas-flowers.vercel.app/logo.jpg"
              }
            },
            datePublished: post.createdAt || new Date().toISOString()
          })
        }}
      />

      <main className="flex-1 py-10 md:py-16">
        <article className="max-w-4xl w-full mx-auto px-4 sm:px-6 space-y-8">
          
          {/* Navegación de Regreso */}
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/nosotros"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-[#8B0024] dark:hover:text-[#FF97A4] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Volver a Nosotros & Blog</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-all text-xs font-bold flex items-center gap-1.5"
                title="Copiar enlace"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                <span className="hidden sm:inline">{copied ? "¡Copiado!" : "Compartir"}</span>
              </button>

              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-all text-xs font-bold flex items-center gap-1.5"
                title="Compartir por WhatsApp"
              >
                <MessageCircle size={14} />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Encabezado del Post */}
          <header className="space-y-4 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-pink-100 dark:bg-pink-950/80 text-[#8B0024] dark:text-pink-300 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles size={13} />
              <span>Boutique Floral & Consejos</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-gray-900 dark:!text-white leading-tight tracking-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium leading-relaxed max-w-2xl mx-auto">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400 pt-1">
              <span className="flex items-center gap-1">
                <Calendar size={14} className="text-[#FF97A4]" />
                {new Date(post.createdAt || Date.now()).toLocaleDateString("es-ES", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={14} className="text-purple-500" />
                3 min de lectura
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-emerald-500" />
                Houston & Pasadena, TX
              </span>
            </div>
          </header>

          {/* Imagen Principal del Artículo */}
          {post.mainImage && (
            <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 h-72 sm:h-96 md:h-[420px] bg-gray-100 dark:bg-gray-800">
              <img
                src={post.mainImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Contenido Completo del Artículo */}
          <div className="bg-white dark:bg-[#181922] p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
            {renderFormattedContent(post.content)}
          </div>

          {/* CAJA DE ACCIÓN / COMPRA RELACIONADA */}
          <div className="bg-gradient-to-r from-[#fff0ef] via-pink-50 to-[#fff0ef] dark:from-[#181922] dark:via-[#221820] dark:to-[#181922] p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-md space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#8B0024] text-white flex items-center justify-center mx-auto shadow-md">
              <Gift size={22} />
            </div>
            <h3 className="text-2xl font-serif font-black text-gray-900 dark:!text-white">
              ¿Listo para Enviar Flores de Lujo en Houston?
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 max-w-lg mx-auto font-medium">
              Explora nuestra exclusiva colección de ramos buchones, rosas de exportación y cajas personalizadas con entrega el mismo día.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
              <Link
                href="/productos"
                className="px-6 py-3 rounded-full bg-[#8B0024] hover:bg-[#B0004A] text-white font-black text-xs shadow-md transition-all active:scale-95"
              >
                Ver Catálogo de Flores
              </Link>
              <a
                href={`https://wa.me/18323911835?text=${encodeURIComponent(`¡Hola! Leí su artículo sobre "${post.title}" y quisiera cotizar un arreglo floral.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <MessageCircle size={15} />
                <span>Ordenar por WhatsApp</span>
              </a>
            </div>
          </div>

        </article>
      </main>

      <Footer />
    </div>
  );
}
