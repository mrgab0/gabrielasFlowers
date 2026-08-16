"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const isEnglish = pathname.startsWith("/en");

  const toggleLanguage = (targetLocale: "es" | "en") => {
    let newPath = pathname;

    if (pathname.startsWith("/es") || pathname.startsWith("/en")) {
      newPath = pathname.replace(/^\/(es|en)/, `/${targetLocale}`);
    } else {
      newPath = `/${targetLocale}${pathname}`;
    }

    router.push(newPath);
  };

  return (
    <div className="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200 text-[11px] font-extrabold text-gray-700 shadow-inner">
      <button
        type="button"
        onClick={() => toggleLanguage("es")}
        className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
          !isEnglish
            ? "bg-white text-[#1A1C1C] shadow-sm font-black"
            : "text-gray-400 hover:text-gray-700"
        }`}
        title="Cambiar a Español"
      >
        <span>🇲🇽</span>
        <span>ES</span>
      </button>
      <button
        type="button"
        onClick={() => toggleLanguage("en")}
        className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
          isEnglish
            ? "bg-white text-[#1A1C1C] shadow-sm font-black"
            : "text-gray-400 hover:text-gray-700"
        }`}
        title="Switch to English"
      >
        <span>🇺🇸</span>
        <span>EN</span>
      </button>
    </div>
  );
}
