import { LoginButton } from "@/components/LoginButton";

export default function AdminPage() {
  return (
    <div className="bg-white dark:bg-[#12131A] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1C1C] dark:text-white">Bienvenido al Panel Administrador</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Gestiona los pedidos, envíos, productos, banners, estadísticas, ofertas y SEO de tu floristería.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <a href="/admin/ordenes" className="bg-pink-600 text-white p-5 rounded-2xl font-bold hover:bg-pink-700 text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">🛍️</span>
          <span>Gestor de Órdenes & Despacho</span>
        </a>
        <a href="/admin/productos" className="bg-blue-600 text-white p-5 rounded-2xl font-bold hover:bg-blue-700 text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">📦</span>
          <span>Gestionar Productos</span>
        </a>
        <a href="/admin/estadisticas" className="bg-indigo-600 text-white p-5 rounded-2xl font-bold hover:bg-indigo-700 text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">📊</span>
          <span>Estadísticas & Carritos</span>
        </a>
        <a href="/admin/sliders" className="bg-[#FF97A4] text-white p-5 rounded-2xl font-bold hover:bg-[#b0004a] text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">🖼️</span>
          <span>Gestionar Banners</span>
        </a>
        <a href="/admin/adicionales" className="bg-purple-600 text-white p-5 rounded-2xl font-bold hover:bg-purple-700 text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">✨</span>
          <span>Gestionar Adicionales</span>
        </a>
        <a href="/admin/entregas" className="bg-emerald-600 text-white p-5 rounded-2xl font-bold hover:bg-emerald-700 text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">🚚</span>
          <span>Opciones de Entrega</span>
        </a>
        <a href="/admin/cupones" className="bg-amber-500 text-white p-5 rounded-2xl font-bold hover:bg-amber-600 text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">🎟️</span>
          <span>Cupones de Descuento</span>
        </a>
        <a href="/admin/pagos" className="bg-cyan-600 text-white p-5 rounded-2xl font-bold hover:bg-cyan-700 text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">💳</span>
          <span>Cuentas de Pago & QR</span>
        </a>
        <a href="/admin/seo" className="bg-teal-600 text-white p-5 rounded-2xl font-bold hover:bg-teal-700 text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">🔍</span>
          <span>Optimización SEO</span>
        </a>
        <a href="/admin/configuracion" className="bg-gray-800 text-white p-5 rounded-2xl font-bold hover:bg-black text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2">
          <span className="text-2xl">⚙️</span>
          <span>Configuración (2FA & Lemas)</span>
        </a>
      </div>

      <div className="border-t pt-6 border-gray-100 dark:border-gray-800">
        <LoginButton />
      </div>
    </div>
  );
}
