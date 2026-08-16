"use server";

import dbConnect from "@/lib/db";
import { Product, slugify } from "@/lib/models/Product";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- PRODUCT ACTIONS ---

export async function createProduct(formData: FormData) {
  try {
    await dbConnect();
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const images = (formData.getAll("images") as string[]).filter((img) => img && typeof img === 'string' && img.trim() !== "");
    const stock = parseInt(formData.get("stock") as string) || 0;
    const sku = formData.get("sku") as string || "";
    
    // Nuevos campos
    const flowerCount = parseInt(formData.get("flowerCount") as string) || 0;
    const bouquetType = formData.get("bouquetType") as string || "";
    const badge = formData.get("badge") as string || "";
    const addonsRaw = formData.getAll("addons") as string[];
    const addons = addonsRaw.filter((a) => a && typeof a === 'string' && a.trim() !== "");

    // Procesar características
    const featureLabels = formData.getAll("featureLabels") as string[];
    const featureValues = formData.getAll("featureValues") as string[];
    const features = featureLabels
      .map((label, index) => ({ label, value: featureValues[index] }))
      .filter(f => f.label && f.value);

    // Evitar colisiones de Slug
    const baseSlug = slugify(name);
    const existingProduct = await Product.findOne({ slug: baseSlug });
    const slug = existingProduct
      ? slugify(`${name}-${Math.floor(Math.random() * 1000)}`)
      : baseSlug;

    const newProduct = new Product({
      name,
      price,
      category,
      description,
      images,
      stock,
      sku,
      flowerCount,
      bouquetType,
      badge,
      addons,
      features,
      slug,
      isActive: true,
    });

    const saved = await newProduct.save();
    revalidatePath("/admin/productos");
    revalidatePath("/");
    return { success: true, id: saved._id.toString() };
  } catch (error) {
    console.error("Error al crear:", error);
    return { success: false, error: error instanceof Error ? error.message : "No se pudo guardar el producto" };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    await dbConnect();
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const images = (formData.getAll("images") as string[]).filter((img) => img && typeof img === 'string' && img.trim() !== "");
    const stock = parseInt(formData.get("stock") as string) || 0;
    const sku = formData.get("sku") as string || "";
    
    // Nuevos campos
    const flowerCount = parseInt(formData.get("flowerCount") as string) || 0;
    const bouquetType = formData.get("bouquetType") as string || "";
    const badge = formData.get("badge") as string || "";
    const addonsRaw = formData.getAll("addons") as string[];
    const addons = addonsRaw.filter((a) => a && typeof a === 'string' && a.trim() !== "");

    // Procesar características
    const featureLabels = formData.getAll("featureLabels") as string[];
    const featureValues = formData.getAll("featureValues") as string[];
    const features = featureLabels
      .map((label, index) => ({ label, value: featureValues[index] }))
      .filter(f => f.label && f.value);

    // Evitar colisiones de Slug si cambia el nombre
    const baseSlug = slugify(name);
    const existingProduct = await Product.findOne({ slug: baseSlug, _id: { $ne: id } });
    const slug = existingProduct
      ? slugify(`${name}-${Math.floor(Math.random() * 1000)}`)
      : baseSlug;

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        name,
        price,
        category,
        description,
        images,
        stock,
        sku,
        flowerCount,
        bouquetType,
        badge,
        addons,
        features,
        slug,
      },
      { new: true }
    );

    revalidatePath("/admin/productos");
    revalidatePath("/");
    return { success: true, id: updated?._id.toString() };
  } catch (error) {
    console.error("Error al editar producto:", error);
    return { success: false, error: error instanceof Error ? error.message : "No se pudo actualizar el producto" };
  }
}

export async function updateProductFormAction(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  const res = await updateProduct(id, formData);
  if (res.success) {
    redirect("/admin/productos");
  }
}

export async function getProductById(id: string) {
  try {
    await dbConnect();
    const product = await Product.findById(id).lean();
    if (!product) return { success: false, error: "Producto no encontrado" };
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error) {
    return { success: false, error: "Error al cargar producto" };
  }
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  try {
    await dbConnect();
    await Product.findByIdAndUpdate(id, { isActive });
    revalidatePath("/", "layout");
    revalidatePath("/admin/productos");
    return { success: true };
  } catch (error) {
    console.error("Error al cambiar estado del producto:", error);
    return { success: false, error: "Error al actualizar estado del producto" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await dbConnect();
    await Product.findByIdAndDelete(id);
    revalidatePath("/", "layout");
    revalidatePath("/admin/productos");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return { success: false, error: "No se pudo eliminar el producto" };
  }
}
