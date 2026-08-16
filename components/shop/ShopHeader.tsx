"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, ArrowLeft, Fingerprint } from "lucide-react";
import { useCart } from "@/components/shop/Cart/CartContext";
import { LanguageSwitcher } from "@/components/shop/LanguageSwitcher";
import { ThemeToggle } from "@/components/shop/ThemeToggle";
import { CustomerBiometricModal } from "@/components/auth/CustomerBiometricModal";

export const ShopHeader = () => {
  const { cartItems } = useCart();
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#181922]/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo Presionable hacia el Home */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FF97A4]/40 dark:border-gray-700 shadow-md group-hover:scale-105 transition-transform flex-shrink-0 bg-white p-0.5">
              <img src="/logo.jpg" alt="Flowers For You Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <span className="text-xl font-serif font-black text-[#1A1C1C] dark:text-white tracking-tight group-hover:text-[#FF97A4] transition-colors block">
                Flowers <span className="text-[#FF97A4]">For You</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold block -mt-1">
                Boutique Floral
              </span>
            </div>
          </Link>

          {/* Navegación Central */}
          <nav className="hidden md:flex items-center gap-8 font-bold text-xs uppercase tracking-widest text-gray-600 dark:text-gray-300">
            <Link href="/" className="hover:text-[#FF97A4] transition-colors">
              Inicio
            </Link>
            <Link href="/productos" className="hover:text-[#FF97A4] transition-colors">
              Colección
            </Link>
            <Link href="/rastreo" className="hover:text-[#FF97A4] transition-colors">
              Rastreo
            </Link>
            <Link href="/nosotros" className="hover:text-[#FF97A4] transition-colors">
              Nosotros
            </Link>
            <Link href="/contacto" className="hover:text-[#FF97A4] transition-colors">
              Contacto
            </Link>
          </nav>

          {/* Acciones Derecha (Acceso por Huella, Tema, Idioma y Carrito) */}
          <div className="flex items-center gap-2">
            {/* Botón de Acceso Biométrico / Passkeys con Huella */}
            <button
              onClick={() => setIsBioModalOpen(true)}
              className="flex items-center gap-1.5 bg-pink-50 dark:bg-pink-950/60 text-[#FF97A4] border border-pink-200 dark:border-pink-900 px-3 py-2 rounded-xl text-xs font-extrabold hover:bg-pink-100 dark:hover:bg-pink-900 transition-colors shadow-sm"
              title="Acceso con Huella / Face ID"
            >
              <Fingerprint size={16} />
              <span className="inline text-[11px]">Huella 👆</span>
            </button>

            <ThemeToggle />
            <LanguageSwitcher />

            {/* Cart Button indicator */}
            <div className="relative ml-1">
              <Link
                href="/checkout"
                className="flex items-center gap-2 bg-[#FF97A4] text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-[#B0004A] transition-all shadow-md shadow-[#FF97A4]/20"
              >
                <ShoppingCart size={18} />
                <span className="hidden sm:inline">Carrito</span>
                {totalCount > 0 && (
                  <span className="bg-[#1A1C1C] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {totalCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Modal Biométrico */}
      <CustomerBiometricModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
      />
    </>
  );
};
