"use client";

import { useEffect } from "react";

export function InstallPrompt() {
  useEffect(() => {
    // Registrar el Service Worker para PWA en tiempo de ocio en segundo plano
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.log("Service Worker registro PWA:", err);
        });
      };

      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(registerSW, { timeout: 6000 });
      } else {
        setTimeout(registerSW, 3000);
      }
    }
  }, []);

  return null;
}

