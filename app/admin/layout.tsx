import AdminLoginPage from "./login/page";
import { verifyAdminSession, logoutAdminAction } from "@/lib/adminAuth";
import { LogOut, Settings, Search, BarChart3, Package } from "lucide-react";
import { ThemeToggle } from "@/components/shop/ThemeToggle";

export const runtime = 'nodejs';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await verifyAdminSession();

  // Si NO está autenticado, protege strictly todas las páginas de /admin y muestra el Login
  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0F1015] flex flex-col text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <nav className="bg-white dark:bg-[#181922] shadow-sm px-6 py-3.5 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <a href="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full border-2 border-[#FF97A4] overflow-hidden flex items-center justify-center bg-pink-50 dark:bg-pink-950/40 shadow-sm group-hover:scale-105 transition-transform">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-serif font-black text-lg text-[#1A1C1C] dark:!text-white block leading-none group-hover:text-[#FF97A4] transition-colors admin-logo-title">
                  Gabriela's Flowers
                </span>
                <span className="text-[10px] font-bold text-gray-500 dark:!text-white/80 uppercase tracking-widest block mt-0.5 admin-logo-subtitle">
                  Panel de Administración
                </span>
              </div>
            </a>
            
            {/* Botón para cambiar de tema (Modo Claro / Oscuro) cerca del logo */}
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold admin-nav-links">
            <a href="/admin/ordenes" className="px-3.5 py-2 rounded-xl bg-pink-100 dark:bg-pink-950/80 hover:bg-pink-200 dark:hover:bg-pink-900/80 text-[#B0004A] dark:text-pink-300 transition-colors border border-pink-300 dark:border-pink-800/80 flex items-center gap-1.5 font-extrabold shadow-sm">
              <Package size={15} />
              <span>🛍️ Órdenes & Despacho</span>
            </a>
            <a href="/admin/productos" className="px-3.5 py-2 rounded-xl bg-gray-200/80 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors flex items-center gap-1.5 font-extrabold">
              📦 Productos
            </a>
            <a href="/admin/sliders" className="px-3.5 py-2 rounded-xl bg-gray-200/80 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors flex items-center gap-1.5 font-extrabold">
              🖼️ Banners
            </a>
            <a href="/admin/estadisticas" className="px-3.5 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 hover:bg-indigo-200 dark:hover:bg-indigo-900/80 text-indigo-950 dark:text-indigo-200 transition-colors border border-indigo-300 dark:border-indigo-800/80 flex items-center gap-1.5 font-extrabold shadow-sm">
              <BarChart3 size={15} className="text-indigo-700 dark:text-indigo-300" />
              <span>📊 Estadísticas & Carritos</span>
            </a>
            <a href="/admin/adicionales" className="px-3.5 py-2 rounded-xl bg-gray-200/80 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors flex items-center gap-1.5 font-extrabold">
              ✨ Adicionales
            </a>
            <a href="/admin/entregas" className="px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 text-emerald-950 dark:text-emerald-200 transition-colors border border-emerald-300 dark:border-emerald-800/80 flex items-center gap-1.5 font-extrabold">
              🚚 Entregas
            </a>
            <a href="/admin/cupones" className="px-3.5 py-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 hover:bg-purple-200 dark:hover:bg-purple-900/80 text-purple-950 dark:text-purple-200 transition-colors border border-purple-300 dark:border-purple-800/80 flex items-center gap-1.5 font-extrabold">
              🎟️ Cupones
            </a>
            <a href="/admin/pagos" className="px-3.5 py-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 hover:bg-blue-200 dark:hover:bg-blue-900/80 text-blue-950 dark:text-blue-200 transition-colors border border-blue-300 dark:border-blue-800/80 flex items-center gap-1.5 font-extrabold">
              💳 Cuentas de Pago
            </a>
            <a href="/admin/seo" className="px-3.5 py-2 rounded-xl bg-teal-100 dark:bg-teal-950/80 hover:bg-teal-200 dark:hover:bg-teal-900/80 text-teal-950 dark:text-teal-200 transition-colors border border-teal-300 dark:border-teal-800/80 flex items-center gap-1.5 font-extrabold shadow-sm">
              <Search size={15} className="text-teal-700 dark:text-teal-300" />
              <span>🔍 Optimización SEO</span>
            </a>
            <a href="/admin/configuracion" className="px-3.5 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900/80 text-amber-950 dark:text-amber-200 transition-colors border border-amber-300 dark:border-amber-800/80 flex items-center gap-1.5 font-extrabold shadow-sm">
              <Settings size={15} className="text-amber-700 dark:text-amber-300 animate-spin-slow" />
              <span>⚙️ Configuración</span>
            </a>

            <div className="h-5 w-px bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block"></div>

            <a href="/" target="_blank" className="px-3.5 py-2 rounded-xl bg-pink-100 dark:bg-pink-950/80 hover:bg-pink-200 dark:hover:bg-pink-900/80 text-[#B0004A] dark:text-pink-300 transition-colors border border-pink-300 dark:border-pink-800/80 flex items-center gap-1.5 font-extrabold">
              👁️ Ver Tienda
            </a>

            {/* Formulario de Cierre de Sesión */}
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="bg-[#1A1C1C] dark:bg-gray-800 text-white hover:bg-red-600 dark:hover:bg-red-600 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ml-1"
              >
                <LogOut size={14} />
                <span>Salir</span>
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6 flex-1">{children}</main>
    </div>
  );
}
