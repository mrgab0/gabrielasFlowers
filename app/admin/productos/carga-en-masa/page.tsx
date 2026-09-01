"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IKContext, IKUpload } from "imagekitio-react";
import {
  createBulkProducts,
  updateBulkBatch,
  publishBulkBatch,
  fetchAddonsList,
  deleteProduct
} from "@/lib/actions/product";
import {
  Upload,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Layers,
  Image as ImageIcon,
  Package,
  Wand2,
  X,
  Link as LinkIcon,
  Sparkles,
  Rocket,
  Clock,
  Calendar,
  CheckSquare,
  Square,
  Flower2,
  Tag,
  Gift
} from "lucide-react";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/nzjtc1avv";
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_huW/0HuThqhQncgbm14znTZHVpk=";

const authenticator = async () => {
  try {
    const response = await fetch("/api/imagekit-auth");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en auth API: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    return {
      signature: data.signature,
      expire: data.expire,
      token: data.token,
    };
  } catch (error: any) {
    console.error("Error al autenticar ImageKit:", error);
    throw error;
  }
};

const CATEGORIES = [
  "Rosas de Lujo",
  "Bouquets & Cajas",
  "Heart Boxes",
  "Flores Amarillas",
  "Cumpleaños",
  "Aniversario",
  "Infantiles",
  "Condolencias",
  "General"
];

const BOUQUET_TYPES = [
  "Ramo Royal",
  "Caja Estilo Dior",
  "Heart Box",
  "Arreglo en Jarrón",
  "Bouquet Especial",
  "Caja Cuadrada de Rosas"
];

const FLOWER_COUNT_OPTIONS = [0, 12, 18, 24, 36, 50, 100, 200];
const BADGES = ["", "Bestsellers", "Luxury", "Popular!", "Oferta", "Nuevo"];

interface UploadDraftItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  images: string[];
  badge: string;
  flowerCount: number;
  bouquetType: string;
}

export default function CargaEnMasaAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"step1" | "step2">("step1");

  // Step 1 State: Subida masiva de imágenes
  const [draftItems, setDraftItems] = useState<UploadDraftItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isSavingPreAgregated, setIsSavingPreAgregated] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [showManualUrlModal, setShowManualUrlModal] = useState(false);

  // Parámetros por defecto para Step 1
  const [globalCategory, setGlobalCategory] = useState("Rosas de Lujo");
  const [globalPrice, setGlobalPrice] = useState<number>(50);
  const [globalStock, setGlobalStock] = useState<number>(10);
  const [globalDescription, setGlobalDescription] = useState(
    "Hermoso arreglo elaborado con flores frescas de la más alta calidad en Gabriela's Flowers."
  );

  // Step 2 State: Pre-Agregador Dashboard (DB Products with isActive: false)
  const [dbPreProducts, setDbPreProducts] = useState<any[]>([]);
  const [loadingPreProducts, setLoadingPreProducts] = useState(false);
  const [availableAddons, setAvailableAddons] = useState<any[]>([]);
  const [publishingIds, setPublishingIds] = useState<string[]>([]);
  const [updatingBatchId, setUpdatingBatchId] = useState<string | null>(null);

  // Batch Editor Inputs for Step 2
  const [batchCategory, setBatchCategory] = useState("Rosas de Lujo");
  const [batchFlowerCount, setBatchFlowerCount] = useState<number>(24);
  const [batchBouquetType, setBatchBouquetType] = useState("Ramo Royal");
  const [batchPrice, setBatchPrice] = useState<number>(85);
  const [batchStock, setBatchStock] = useState<number>(15);
  const [batchBadge, setBatchBadge] = useState("Bestsellers");
  const [batchAddons, setBatchAddons] = useState<string[]>([]);

  const ikUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPreProductsData();
    loadAddonsData();
  }, []);

  async function fetchPreProductsData() {
    setLoadingPreProducts(true);
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        const allProducts = data.products || [];
        const preOnly = allProducts.filter((p: any) => p.isActive === false);
        setDbPreProducts(preOnly);
      }
    } catch (error) {
      console.error("Error al cargar productos pre-agregados:", error);
    } finally {
      setLoadingPreProducts(false);
    }
  }

  async function loadAddonsData() {
    const res = await fetchAddonsList();
    if (res.success && res.addons) {
      setAvailableAddons(res.addons);
    }
  }

  // Extracción de nombre limpio
  const cleanFilenameToName = (filename: string): string => {
    let clean = filename.replace(/\.[^/.]+$/, "");
    clean = clean.replace(/[-_]/g, " ");
    clean = clean.replace(/\b\w/g, (char) => char.toUpperCase());
    return clean.trim() || "Arreglo Floral Exclusivo";
  };

  const handleUploadStart = () => {
    setUploading(true);
  };

  const handleUploadError = (err: any) => {
    console.error("Error en ImageKit:", err);
    alert("Ocurrió un error al cargar la imagen en ImageKit.");
    setUploading(false);
  };

  const handleUploadSuccess = (res: any) => {
    setUploading(false);
    if (res && res.url) {
      const extractedName = cleanFilenameToName(res.name || "Nuevo Producto");
      const newItem: UploadDraftItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: extractedName,
        price: globalPrice,
        category: globalCategory,
        description: globalDescription,
        stock: globalStock,
        images: [res.url],
        badge: "",
        flowerCount: 0,
        bouquetType: "",
      };
      setDraftItems((prev) => [...prev, newItem]);
    }
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    const newItem: UploadDraftItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "Producto Importado por URL",
      price: globalPrice,
      category: globalCategory,
      description: globalDescription,
      stock: globalStock,
      images: [manualUrl.trim()],
      badge: "",
      flowerCount: 0,
      bouquetType: "",
    };
    setDraftItems((prev) => [...prev, newItem]);
    setManualUrl("");
    setShowManualUrlModal(false);
  };

  const handleAddBlankCard = () => {
    const newItem: UploadDraftItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "Nuevo Arreglo Floral",
      price: globalPrice,
      category: globalCategory,
      description: globalDescription,
      stock: globalStock,
      images: ["https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800"],
      badge: "",
      flowerCount: 0,
      bouquetType: "",
    };
    setDraftItems((prev) => [...prev, newItem]);
  };

  // Enviar borradores al estado Pre-Agregado (isActive: false)
  const handleSaveToPreAggregator = async () => {
    if (draftItems.length === 0) return;

    setIsSavingPreAgregated(true);
    try {
      const payload = draftItems.map((it) => ({
        name: it.name,
        price: it.price,
        category: it.category,
        description: it.description,
        images: it.images,
        stock: it.stock,
        badge: it.badge,
        flowerCount: it.flowerCount,
        bouquetType: it.bouquetType,
      }));

      const res = await createBulkProducts(payload, false); // publishImmediately = false
      if (res.success) {
        setDraftItems([]);
        await fetchPreProductsData();
        setActiveTab("step2");
        alert(`¡Éxito! Se enviaron ${res.count} productos al Pre-Agregador. Ahora puedes editarlos en masa por lote.`);
      } else {
        alert(`Error al enviar a Pre-Agregador: ${res.error}`);
      }
    } catch (error) {
      console.error("Error al enviar a pre-agregador:", error);
      alert("Error al procesar la pre-agregación.");
    } finally {
      setIsSavingPreAgregated(false);
    }
  };

  // Agrupar productos de DB Pre-Agregador por Fecha de Subida (Batch)
  const groupPreProductsByDate = () => {
    const groups: { [key: string]: any[] } = {};

    dbPreProducts.forEach((prod) => {
      const dateObj = prod.createdAt ? new Date(prod.createdAt) : new Date();
      const dateKey = dateObj.toLocaleString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(prod);
    });

    return Object.entries(groups).map(([dateLabel, products]) => ({
      dateLabel,
      products,
    }));
  };

  const batchGroups = groupPreProductsByDate();

  // Aplicar edición en lote a un grupo específico de productos
  const handleApplyBatchEditToGroup = async (groupProducts: any[], groupKey: string) => {
    const ids = groupProducts.map((p) => p._id);
    setUpdatingBatchId(groupKey);
    try {
      const res = await updateBulkBatch(ids, {
        category: batchCategory,
        flowerCount: batchFlowerCount,
        bouquetType: batchBouquetType,
        price: batchPrice,
        stock: batchStock,
        badge: batchBadge,
        addons: batchAddons,
      });

      if (res.success) {
        await fetchPreProductsData();
        alert(`¡Lote actualizado! Se aplicaron los atributos a ${res.count} productos.`);
      } else {
        alert(`Error al actualizar lote: ${res.error}`);
      }
    } catch (error) {
      console.error("Error al actualizar lote:", error);
    } finally {
      setUpdatingBatchId(null);
    }
  };

  // Publicar lote completo (isActive: true)
  const handlePublishGroup = async (groupProducts: any[]) => {
    const ids = groupProducts.map((p) => p._id);
    if (!confirm(`¿Publicar ${ids.length} productos en la tienda pública?`)) return;

    setPublishingIds(ids);
    try {
      const res = await publishBulkBatch(ids);
      if (res.success) {
        await fetchPreProductsData();
        alert(`🚀 ¡Enhorabuena! Se publicaron ${res.count} productos en la tienda.`);
      } else {
        alert(`Error al publicar lote: ${res.error}`);
      }
    } catch (error) {
      console.error("Error al publicar lote:", error);
    } finally {
      setPublishingIds([]);
    }
  };

  const handleDeletePreProduct = async (id: string, name: string) => {
    if (confirm(`¿Eliminar borrador "${name}"?`)) {
      await deleteProduct(id);
      setDbPreProducts((prev) => prev.filter((p) => p._id !== id));
    }
  };

  const toggleAddonSelection = (addonId: string) => {
    setBatchAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#8B0024] font-bold mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Volver al Inventario
          </Link>
          <h1 className="text-2xl font-black text-[#1A1C1C] flex items-center gap-2">
            <Layers className="text-[#8B0024]" size={24} />
            Módulo de Carga en Masa y Pre-Agregador
          </h1>
          <p className="text-xs text-gray-400">
            Carga fotos a ImageKit, edita los parámetros comunes por lote (Rosas, Precios, Adicionales) y publícalos a la tienda cuando estén listos.
          </p>
        </div>

        {/* Selector de Pasos / Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("step1")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "step1"
                ? "bg-[#8B0024] text-white shadow-md"
                : "text-gray-600 hover:bg-white"
            }`}
          >
            <Upload size={14} />
            <span>1. Subir Fotos</span>
            {draftItems.length > 0 && (
              <span className="bg-pink-300 text-gray-900 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {draftItems.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              fetchPreProductsData();
              setActiveTab("step2");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "step2"
                ? "bg-[#8B0024] text-white shadow-md"
                : "text-gray-600 hover:bg-white"
            }`}
          >
            <Package size={14} />
            <span>2. Pre-Agregador</span>
            {dbPreProducts.length > 0 && (
              <span className="bg-[#D4AF37] text-gray-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {dbPreProducts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PASO 1: SUBIDA MASIVA Y GENERACIÓN DE BORRADORES */}
      {/* ========================================================================= */}
      {activeTab === "step1" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Instrucción del Paso 1 */}
          <div className="bg-gradient-to-r from-gray-900 to-[#12131A] text-white p-6 rounded-2xl shadow-md border border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="text-[#D4AF37]" size={18} />
                <h2 className="font-bold text-sm uppercase tracking-wider text-pink-300">
                  Paso 1: Subir Fotos y Configurar Valores Base
                </h2>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                Los productos se guardarán pausados en el Pre-Agregador.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1 uppercase tracking-wider">Categoría Base</label>
                <select
                  value={globalCategory}
                  onChange={(e) => setGlobalCategory(e.target.value)}
                  className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1 uppercase tracking-wider">Precio Base ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={globalPrice}
                  onChange={(e) => setGlobalPrice(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1 uppercase tracking-wider">Stock por Defecto</label>
                <input
                  type="number"
                  value={globalStock}
                  onChange={(e) => setGlobalStock(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Uploader ImageKit */}
          <IKContext publicKey={publicKey} urlEndpoint={urlEndpoint} authenticator={authenticator}>
            <IKUpload
              ref={ikUploadRef}
              onError={handleUploadError}
              onSuccess={handleUploadSuccess}
              onUploadStart={handleUploadStart}
              style={{ display: "none" }}
              folder="/products"
              accept="image/*"
              multiple
            />

            <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-[#8B0024]/40 bg-[#8B0024]/5 hover:bg-[#8B0024]/10 transition-all text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 bg-white rounded-2xl mx-auto flex items-center justify-center text-[#8B0024] shadow-md border border-pink-100">
                {uploading ? <Loader2 className="animate-spin" size={28} /> : <Upload size={28} />}
              </div>

              <div>
                <h3 className="font-black text-lg text-gray-900">
                  {uploading ? "Subiendo fotos a ImageKit..." : "Selecciona o Arrastra Múltiples Fotos de Arreglos"}
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-lg mx-auto">
                  Cada imagen subida a ImageKit (`/products`) creará una tarjeta de producto en el borrador de Pre-Agregación.
                </p>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !uploading && ikUploadRef.current?.click()}
                  disabled={uploading}
                  className="bg-[#8B0024] hover:bg-[#70001d] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Upload size={14} />
                  <span>{uploading ? "Cargando..." : "Subir Fotos en Masa"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowManualUrlModal(true)}
                  className="bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <LinkIcon size={14} />
                  <span>Añadir por URL</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddBlankCard}
                  className="bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Agregar Fila Vacía</span>
                </button>
              </div>
            </div>
          </IKContext>

          {/* Modal de URL Manual */}
          {showManualUrlModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-base text-gray-900">Añadir URL de Imagen</h3>
                  <button type="button" onClick={() => setShowManualUrlModal(false)} className="text-gray-400 p-1">
                    <X size={18} />
                  </button>
                </div>
                <div>
                  <input
                    type="url"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="https://ik.imagekit.io/du7tc3jqd/products/rosas.jpg"
                    className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0024]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={handleAddManualUrl} className="px-4 py-2 text-xs font-bold bg-[#8B0024] text-white rounded-xl">
                    Añadir
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Borradores Subidos */}
          {draftItems.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <Package size={18} className="text-[#8B0024]" />
                  Fotos Cargadas ({draftItems.length})
                </h3>
                <button
                  type="button"
                  onClick={handleSaveToPreAggregator}
                  disabled={isSavingPreAgregated}
                  className="bg-[#8B0024] hover:bg-[#70001d] text-white px-5 py-2.5 rounded-full text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
                >
                  {isSavingPreAgregated ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                  <span>Enviar a Pre-Agregador (Paso 2)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {draftItems.map((item, idx) => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex gap-3 items-center">
                    <img src={item.images[0]} alt={item.name} className="w-16 h-16 rounded-xl object-cover border flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => setDraftItems(prev => prev.map(it => it.id === item.id ? { ...it, name: e.target.value } : it))}
                        className="w-full text-xs font-bold p-1.5 border rounded-lg"
                      />
                      <div className="flex gap-2 text-[11px] text-gray-500 mt-1">
                        <span>${item.price}</span>
                        <span>•</span>
                        <span>{item.category}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDraftItems(prev => prev.filter(it => it.id !== item.id))}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* PASO 2: PRE-AGREGADOR (STAGING DASHBOARD AGRUPADO POR FECHA DE SUBIDA) */}
      {/* ========================================================================= */}
      {activeTab === "step2" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header informativo del Pre-Agregador */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Clock className="text-[#8B0024]" size={20} />
                Panel Pre-Agregador: Productos Pausados Agrupados por Fecha
              </h2>
              <button
                type="button"
                onClick={fetchPreProductsData}
                className="text-xs text-[#8B0024] font-bold hover:underline flex items-center gap-1"
              >
                Actualizar Lista
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Aquí se encuentran todos los borradores listos para ser editados en masa por grupo (rosas, precios, adicionales) y publicados cuando decidas.
            </p>
          </div>

          {loadingPreProducts ? (
            <div className="p-16 text-center text-gray-400 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-[#8B0024]" size={24} />
              <span>Cargando productos en Pre-Agregador...</span>
            </div>
          ) : batchGroups.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-100 shadow-sm space-y-3">
              <Package size={44} className="mx-auto text-gray-300" />
              <p className="font-bold text-gray-700 text-base">No hay productos pendientes en el Pre-Agregador.</p>
              <p className="text-xs text-gray-400">
                Sube fotos en el Paso 1 para comenzar a editar en lote por fecha.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("step1")}
                className="bg-[#8B0024] text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#70001d] transition-colors inline-flex items-center gap-1.5 shadow-md"
              >
                <Plus size={14} /> Ir al Paso 1: Subir Fotos
              </button>
            </div>
          ) : (
            batchGroups.map((group, groupIdx) => {
              const isGroupUpdating = updatingBatchId === group.dateLabel;
              const isGroupPublishing = publishingIds.some((id) =>
                group.products.some((p) => p._id === id)
              );

              return (
                <div
                  key={group.dateLabel}
                  className="bg-white rounded-2xl border-2 border-gray-200/80 shadow-md overflow-hidden space-y-4"
                >
                  {/* Encabezado del Grupo / Lote por Fecha */}
                  <div className="bg-gradient-to-r from-gray-900 via-[#1A1C1C] to-gray-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#8B0024] rounded-xl text-white font-black text-xs">
                        #{groupIdx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-[#D4AF37]" />
                          <h3 className="font-bold text-sm text-white">
                            Lote del {group.dateLabel}
                          </h3>
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium">
                          {group.products.length} productos registrados en este lote
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePublishGroup(group.products)}
                      disabled={isGroupPublishing}
                      className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isGroupPublishing ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Rocket size={16} />
                      )}
                      <span>🚀 Publicar Lote Completo a Tienda ({group.products.length})</span>
                    </button>
                  </div>

                  {/* Barra de Edición Masiva Avanzada para este Lote */}
                  <div className="p-5 bg-pink-50/40 dark:bg-gray-800/30 border-b border-gray-200/80 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div className="flex items-center gap-2 text-xs font-black text-[#8B0024] uppercase tracking-wider">
                        <Wand2 size={16} />
                        Edición en Lote para este Grupo ({group.products.length} ítems)
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApplyBatchEditToGroup(group.products, group.dateLabel)}
                        disabled={isGroupUpdating}
                        className="bg-[#8B0024] hover:bg-[#70001d] text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isGroupUpdating ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        <span>Aplicar Cambios a este Lote</span>
                      </button>
                    </div>

                    {/* Campos de Atributos Comunes */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                      {/* Categoría */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Categoría
                        </label>
                        <select
                          value={batchCategory}
                          onChange={(e) => setBatchCategory(e.target.value)}
                          className="w-full p-2 border rounded-xl text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0024]"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Cantidad de Rosas */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Flower2 size={10} className="text-pink-600" /> Cant. Rosas
                        </label>
                        <select
                          value={batchFlowerCount}
                          onChange={(e) => setBatchFlowerCount(parseInt(e.target.value) || 0)}
                          className="w-full p-2 border rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0024]"
                        >
                          {FLOWER_COUNT_OPTIONS.map((count) => (
                            <option key={count} value={count}>
                              {count === 0 ? "Sin definir" : `${count} Rosas`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Tipo de Bouquet */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Tipo Bouquet
                        </label>
                        <select
                          value={batchBouquetType}
                          onChange={(e) => setBatchBouquetType(e.target.value)}
                          className="w-full p-2 border rounded-xl text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0024]"
                        >
                          {BOUQUET_TYPES.map((bt) => (
                            <option key={bt} value={bt}>
                              {bt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Precio */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Precio ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={batchPrice}
                          onChange={(e) => setBatchPrice(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border rounded-xl text-xs font-black text-[#8B0024] bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0024]"
                        />
                      </div>

                      {/* Stock */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Stock
                        </label>
                        <input
                          type="number"
                          value={batchStock}
                          onChange={(e) => setBatchStock(parseInt(e.target.value) || 0)}
                          className="w-full p-2 border rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0024]"
                        />
                      </div>

                      {/* Badge / Insignia */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Tag size={10} className="text-[#8B0024]" /> Insignia
                        </label>
                        <select
                          value={batchBadge}
                          onChange={(e) => setBatchBadge(e.target.value)}
                          className="w-full p-2 border rounded-xl text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#8B0024]"
                        >
                          <option value="">Sin insignia</option>
                          {BADGES.filter(Boolean).map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Selector de Adicionales en Masa */}
                    {availableAddons.length > 0 && (
                      <div className="pt-2 border-t border-gray-200">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Gift size={12} className="text-[#8B0024]" /> Adicionales que Aplican a este Lote:
                        </label>

                        <div className="flex flex-wrap gap-2">
                          {availableAddons.map((addon) => {
                            const isSelected = batchAddons.includes(addon._id);
                            return (
                              <button
                                key={addon._id}
                                type="button"
                                onClick={() => toggleAddonSelection(addon._id)}
                                className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1.5 ${
                                  isSelected
                                    ? "bg-[#8B0024] text-white border-[#8B0024] shadow-sm"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                {isSelected ? <CheckSquare size={12} /> : <Square size={12} />}
                                <span>{addon.name} (+${addon.price})</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Grid de Productos Individuales del Lote */}
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.products.map((prod) => (
                      <div
                        key={prod._id}
                        className="bg-white border rounded-2xl p-4 shadow-sm relative space-y-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-3">
                          <img
                            src={prod.images?.[0] || "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800"}
                            alt={prod.name}
                            className="w-16 h-16 rounded-xl object-cover border flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-xs text-gray-900 block truncate">
                              {prod.name}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-black text-[#8B0024]">${prod.price?.toFixed(2)}</span>
                              <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-bold">
                                {prod.category}
                              </span>
                            </div>
                            {prod.flowerCount ? (
                              <span className="text-[10px] text-pink-600 font-bold block mt-0.5">
                                🌹 {prod.flowerCount} Rosas {prod.bouquetType ? `• ${prod.bouquetType}` : ''}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t text-xs">
                          <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Pausado / Pre-Agregado ⏸️
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeletePreProduct(prod._id, prod.name)}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="Eliminar borrador"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })
          )}

        </div>
      )}

    </div>
  );
}
