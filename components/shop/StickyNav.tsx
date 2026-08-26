"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/shop/LanguageSwitcher";
import { ThemeToggle } from "@/components/shop/ThemeToggle";
import { CustomerBiometricModal } from "@/components/auth/CustomerBiometricModal";
import { MegaMenuDropdown } from "@/components/shop/MegaMenuDropdown";
import { Fingerprint, Instagram, Facebook, MessageCircle, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

interface StickyNavProps {
  siteConfig?: any;
}

export function StickyNav({ siteConfig }: StickyNavProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
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
        className={`w-full z-50 transition-all duration-500 border-y border-[#D4AF37]/20 ${
          isSticky
            ? "fixed top-0 bg-[#fff8f7]/95 dark:bg-[#181922]/95 backdrop-blur-lg shadow-[0_10px_30px_rgba(42,0,2,0.08)] py-1"
            : "relative bg-[#fff8f7]/90 dark:bg-[#12131A]/90 backdrop-blur-md py-2"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          
          {/* LADO IZQUIERDO: Logo de Gabriela's Flowers SIEMPRE VISIBLE */}
          <div className="flex items-center gap-4 py-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#D4AF37]/50 shadow-md group-hover:scale-105 group-active:scale-95 transition-transform bg-white">
                <img
                  src="/logo.jpg"
                  alt="Gabriela's Flowers Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-serif font-black text-lg text-[#2B0002] dark:text-white hidden lg:inline tracking-tight">
                Gabriela's <span className="text-[#FF97A4]">Flowers</span>
              </span>
            </Link>

            {enableSocials && (
              <div className="hidden xl:flex items-center gap-1 ml-4 pl-4 border-l border-[#D4AF37]/30">
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-800 dark:text-gray-300 hover:text-[#FF97A4] hover:-translate-y-1 active:scale-95 transition-all bg-white/40 dark:bg-gray-800/40 rounded-full shadow-sm hover:shadow-md" title="Instagram">
                    <Instagram size={15} />
                  </a>
                )}
                {facebookUrl && (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-800 dark:text-gray-300 hover:text-[#FF97A4] hover:-translate-y-1 active:scale-95 transition-all bg-white/40 dark:bg-gray-800/40 rounded-full shadow-sm hover:shadow-md" title="Facebook">
                    <Facebook size={15} />
                  </a>
                )}
                {tiktokUrl && (
                  <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-800 dark:text-gray-300 hover:text-[#FF97A4] hover:-translate-y-1 active:scale-95 transition-all bg-white/40 dark:bg-gray-800/40 rounded-full shadow-sm hover:shadow-md font-extrabold text-[10px]" title="TikTok">
                    🎵
                  </a>
                )}
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-emerald-700 dark:text-emerald-400 hover:-translate-y-1 active:scale-95 transition-all bg-white/40 dark:bg-gray-800/40 rounded-full shadow-sm hover:shadow-md" title="WhatsApp Directo">
                    <MessageCircle size={15} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* CENTRO: Menú de Navegación (Botones flotantes con sombra y hover) */}
          <div 
            ref={scrollRef}
            className="flex-1 flex justify-center overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden font-bold text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.15em] py-2 gap-2 sm:gap-3 px-4"
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            {[
              { href: "/", label: t('home') },
              { href: "/productos", label: t('catalog'), isMega: true },
              { href: "/rastreo", label: t('tracking') },
              { href: "/nosotros", label: t('about') },
              { href: "/contacto", label: t('contact') },
              { href: "/checkout", label: t('cart') }
            ].map((link, idx) => (
              <div 
                key={idx} 
                className="relative"
                onMouseEnter={() => link.isMega && setIsMegaMenuOpen(true)}
              >
                <Link 
                  href={link.href} 
                  className="px-4 py-2.5 rounded-full bg-white/60 dark:bg-gray-800/60 text-[#2B0002] dark:text-gray-200 shadow-[0_4px_12px_rgba(42,0,2,0.15)] dark:shadow-none hover:shadow-[0_8px_20px_rgba(42,0,2,0.25)] hover:bg-white dark:hover:bg-gray-700 hover:text-[#8B0025] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-300 border border-transparent hover:border-[#FF97A4]/30 inline-flex items-center gap-1"
                >
                  {link.label}
                  {link.isMega && <ChevronDown size={12} className={`transition-transform duration-300 ${isMegaMenuOpen ? "rotate-180" : ""}`} />}
                </Link>
              </div>
            ))}
          </div>

          {/* Mega Menú Flotante */}
          <div onMouseEnter={() => setIsMegaMenuOpen(true)} onMouseLeave={() => setIsMegaMenuOpen(false)}>
            <MegaMenuDropdown 
              isOpen={isMegaMenuOpen} 
              onClose={() => setIsMegaMenuOpen(false)} 
            />
          </div>

          {/* DERECHA: Botones de Control (Huella, Modo Oscuro e Idioma) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsBioModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#fff0ef] dark:bg-pink-950/60 text-[#8B0025] border border-[#FF97A4]/40 px-3 py-2 rounded-full text-xs font-bold shadow-[0_2px_8px_rgba(42,0,2,0.06)] hover:shadow-[0_6px_16px_rgba(42,0,2,0.12)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
              title="Acceso con Huella / Face ID (Passkeys)"
            >
              <Fingerprint size={14} />
              <span className="hidden sm:inline text-[11px]">Huella 👆</span>
            </button>

            <div className="hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
              <ThemeToggle />
            </div>
            
            <div className="hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
              <LanguageSwitcher />
            </div>
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
