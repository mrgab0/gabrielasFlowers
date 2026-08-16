"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/shop/LanguageSwitcher";
import { ThemeToggle } from "@/components/shop/ThemeToggle";
import { CustomerBiometricModal } from "@/components/auth/CustomerBiometricModal";
import { Fingerprint, Instagram, Facebook, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface StickyNavProps {
  siteConfig?: any;
}

export function StickyNav({ siteConfig }: StickyNavProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("nav");

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 180);
    };
    window.addEventListener("scroll", handleScroll);
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const enableSocials = siteConfig?.enableHeaderSocials !== false;
  const instagramUrl = siteConfig?.instagramUrl || "https://instagram.com";
  const facebookUrl = siteConfig?.facebookUrl || "https://facebook.com";
  const tiktokUrl = siteConfig?.tiktokUrl || "https://tiktok.com";
  const whatsappUrl = siteConfig?.whatsappUrl || "https://wa.me/16576988586";

  return (
    <>
      <nav
        className={`w-full z-50 transition-all duration-300 border-y border-[#D4AF37]/40 ${
          isSticky
            ? "fixed top-0 bg-[#fff8f7]/95 dark:bg-[#181922]/95 backdrop-blur-md shadow-md"
            : "relative bg-[#fff8f7]/80 dark:bg-[#12131A]/80 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          
          {/* LADO IZQUIERDO: Logo de Gabriela's Flowers en Sticky & Redes Sociales */}
          <div className="flex items-center gap-3 py-2">
            {isSticky && (
              <Link href="/" className="flex items-center gap-2 pr-3 border-r border-[#D4AF37]/30">
                <img
                  src="/logo.jpg"
                  alt="Gabriela's Flowers Logo"
                  className="w-8 h-8 rounded-full object-cover border border-[#D4AF37]"
                />
                <span className="font-serif font-bold text-sm text-[#2a0002] dark:text-white hidden sm:inline">
                  Gabriela's Flowers
                </span>
              </Link>
            )}

            {enableSocials && (
              <div className="hidden lg:flex items-center gap-1">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-700 dark:text-gray-300 hover:text-[#8B0024] dark:hover:text-pink-400 transition-colors rounded-full hover:bg-[#fff0ef] dark:hover:bg-gray-800"
                    title="Instagram"
                  >
                    <Instagram size={16} />
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-700 dark:text-gray-300 hover:text-[#8B0024] dark:hover:text-pink-400 transition-colors rounded-full hover:bg-[#fff0ef] dark:hover:bg-gray-800"
                    title="Facebook"
                  >
                    <Facebook size={16} />
                  </a>
                )}
                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-700 dark:text-gray-300 hover:text-[#8B0024] dark:hover:text-pink-400 transition-colors rounded-full hover:bg-[#fff0ef] dark:hover:bg-gray-800 font-extrabold text-xs"
                    title="TikTok"
                  >
                    🎵
                  </a>
                )}
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform"
                    title="WhatsApp Directo"
                  >
                    <MessageCircle size={16} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* CENTRO: Menú de Navegación */}
          <div 
            ref={scrollRef}
            className="flex-1 flex justify-start sm:justify-center overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden font-bold text-xs uppercase tracking-[0.15em] text-[#2a0002] dark:text-gray-200"
          >
            <Link href="/" className="px-4 sm:px-6 py-3.5 border-r border-[#D4AF37]/30 hover:bg-[#fff0ef] dark:hover:bg-gray-800/60 hover:text-[#8B0024] transition-colors">
              {siteConfig?.menuHomeLabel || t('home')}
            </Link>
            <Link href="/productos" className="px-4 sm:px-6 py-3.5 border-r border-[#D4AF37]/30 hover:bg-[#fff0ef] dark:hover:bg-gray-800/60 hover:text-[#8B0024] transition-colors">
              {siteConfig?.menuCatalogLabel || t('catalog')}
            </Link>
            <Link href="/rastreo" className="px-4 sm:px-6 py-3.5 border-r border-[#D4AF37]/30 hover:bg-[#fff0ef] dark:hover:bg-gray-800/60 hover:text-[#8B0024] transition-colors">
              {siteConfig?.menuTrackingLabel || "📦 Rastreo"}
            </Link>
            <Link href="/nosotros" className="px-4 sm:px-6 py-3.5 border-r border-[#D4AF37]/30 hover:bg-[#fff0ef] dark:hover:bg-gray-800/60 hover:text-[#8B0024] transition-colors">
              {siteConfig?.menuAboutLabel || t('about')}
            </Link>
            <Link href="/contacto" className="px-4 sm:px-6 py-3.5 border-r border-[#D4AF37]/30 hover:bg-[#fff0ef] dark:hover:bg-gray-800/60 hover:text-[#8B0024] transition-colors">
              {siteConfig?.menuContactLabel || t('contact')}
            </Link>
            <Link href="/checkout" className="px-4 sm:px-6 py-3.5 hover:bg-[#fff0ef] dark:hover:bg-gray-800/60 hover:text-[#8B0024] transition-colors">
              {t('cart')}
            </Link>
          </div>

          {/* DERECHA: Botones de Control (Huella, Modo Oscuro e Idioma) */}
          <div className="pl-2 flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setIsBioModalOpen(true)}
              className="flex items-center gap-1 bg-[#fff0ef] dark:bg-pink-950/60 text-[#8B0024] dark:text-pink-300 border border-[#D4AF37]/40 px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-[#faeae9] transition-colors shadow-sm"
              title="Acceso con Huella / Face ID (Passkeys)"
            >
              <Fingerprint size={14} />
              <span className="hidden sm:inline text-[11px]">Huella 👆</span>
            </button>

            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      <CustomerBiometricModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
      />
    </>
  );
}
