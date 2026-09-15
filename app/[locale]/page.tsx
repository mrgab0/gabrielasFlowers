import { getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { StickyNav } from "@/components/shop/StickyNav";
import { FeaturedProductsSlider } from "@/components/shop/FeaturedProductsSlider";
import { DoorDashStoreFeed } from "@/components/shop/DoorDash/DoorDashStoreFeed";
import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { getSiteConfig } from "@/lib/actions/siteConfig";
import { getSliders } from "@/lib/actions/slider";
import { getAddons } from "@/lib/actions/addon";

// Code splitting dinámico para componentes bajo el pliegue (Below the fold)
const SocialAndReviewsSection = dynamic(
  () => import("@/components/shop/SocialAndReviewsSection").then((m) => m.SocialAndReviewsSection),
  { ssr: true }
);

const CustomIframeSection = dynamic(
  () => import("@/components/shop/CustomIframeSection").then((m) => m.CustomIframeSection),
  { ssr: true }
);

const AnimatedButterflies = dynamic(
  () => import("@/components/shop/AnimatedButterflies").then((m) => m.AnimatedButterflies)
);

const Footer = dynamic(
  () => import("@/components/shop/Footer").then((m) => m.Footer),
  { ssr: true }
);

// Fallback para compilaciones de producción estáticas sin variable MONGODB_URI
const FALLBACK_PRODUCTS = [
  {
    _id: "seed-1",
    name: "Coquette Bouquet",
    slug: "coquette-bouquet",
    price: 120.0,
    category: "Rosas de Lujo",
    badge: "Luxury Roses",
    isFeatured: true,
    description: "Hermoso bouquet coquette elaborado con rosas premium rosadas y lazos de seda fina.",
    images: ["https://ik.imagekit.io/du7tc3jqd/products/1__28__3ppRHa0AY.jpg?tr=w-400,q-80,f-auto"],
  },
  {
    _id: "seed-2",
    name: "25 Pink Roses + Dior Paper",
    slug: "25-pink-roses-dior-paper",
    price: 80.0,
    category: "Bouquets & Cajas",
    badge: "Bestseller",
    isFeatured: true,
    description: "25 rosas rosadas de exportación envueltas en papel estilo Dior con detalles de lujo.",
    images: ["https://ik.imagekit.io/du7tc3jqd/products/Screenshot_231_SYV2USxJu.png?tr=w-400,q-80,f-auto"],
  },
  {
    _id: "seed-3",
    name: "Bouquett 25 Roses & i Love You Banner",
    slug: "bouquett-25-roses-i-love-you-banner",
    price: 100.0,
    category: "Bouquets & Cajas",
    badge: "Lovely",
    isFeatured: true,
    description: "Ramo romántico con dedicatoria personalizada y cinta estampada I Love You.",
    images: ["https://ik.imagekit.io/du7tc3jqd/products/1__25__V4f9AzDyF.jpg?tr=w-400,q-80,f-auto"],
  },
  {
    _id: "seed-4",
    name: "50 Roses + Custom Banner + Baby Breath",
    slug: "50-roses-custom-banner-baby-breath",
    price: 200.0,
    category: "Rosas de Lujo",
    badge: "Bestseller",
    isFeatured: true,
    description: "Imponente ramo buchón de 50 rosas rojas con nube de baby breath y corona dorada.",
    images: ["https://ik.imagekit.io/du7tc3jqd/products/1__39__djBwUwQpF.jpg?tr=w-400,q-80,f-auto"],
  },
  {
    _id: "seed-5",
    name: "50 Red Roses bouquet + Diamond banner",
    slug: "50-red-roses-bouquet-diamond-banner",
    price: 175.0,
    category: "Rosas de Lujo",
    badge: "Luxury",
    isFeatured: true,
    description: "50 rosas rojas de tallo largo con pedrería brillante y cinta conmemorativa.",
    images: ["https://ik.imagekit.io/du7tc3jqd/products/1__34__Kd2eN5C-Y.jpg?tr=w-400,q-80,f-auto"],
  },
  {
    _id: "seed-6",
    name: "12 Pink Roses",
    slug: "12-pink-roses",
    price: 69.0,
    category: "Rosas de Lujo",
    isFeatured: false,
    description: "Docena de rosas rosadas frescas ideales para ocasiones especiales y cumpleaños.",
    images: ["https://ik.imagekit.io/du7tc3jqd/products/1__23__GZKx49ZOh.jpg?tr=w-400,q-80,f-auto"],
  },
  {
    _id: "seed-7",
    name: "Bouquet of Roses With Chocolates",
    slug: "bouquet-of-roses-with-chocolates",
    price: 195.0,
    category: "Bouquets & Cajas",
    badge: "Bestseller",
    isFeatured: true,
    description: "Exclusivo arreglo de rosas acompañado de caja de bombones Ferrero Rocher.",
    images: ["https://ik.imagekit.io/du7tc3jqd/products/1__29__7iLyoQihy.jpg?tr=w-400,q-80,f-auto"],
  },
  {
    _id: "seed-8",
    name: "Fashion Red Roses",
    slug: "fashion-red-roses",
    price: 138.0,
    category: "Rosas de Lujo",
    isFeatured: false,
    description: "Diseño fashion en papel impermeable negro mate y follaje importado.",
    images: ["https://ik.imagekit.io/du7tc3jqd/products/1__21__MTrxHrrFP.jpg?tr=w-400,q-80,f-auto"],
  }
];

const FALLBACK_ADDONS = [
  {
    _id: "addon-seed-1",
    name: "Caja de Chocolates Ferrero Rocher (16 unidades)",
    price: 25.0,
    category: "Chocolates",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80&auto=format",
  },
  {
    _id: "addon-seed-2",
    name: "Globo con Helio Metálico Feliz Aniversario",
    price: 12.0,
    category: "Globos",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80&auto=format",
  },
  {
    _id: "addon-seed-3",
    name: "Oso de Peluche Gigante 50cm",
    price: 45.0,
    category: "Peluches",
    image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=400&q=80&auto=format",
  }
];

// Incremental Static Revalidation (ISR) a 60 segundos para respuesta perimetral instantánea
export const revalidate = 60;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  let productsRaw: any[] = [];
  let addons: any[] = [];
  let siteConfig: any = null;
  let initialSlides: any[] = [];

  try {
    await dbConnect();
    const [t, dbProducts, addonsRes, siteConfigRes, slidersRes] = await Promise.all([
      getTranslations({ locale }),
      Product.find({ isActive: { $ne: false } })
        .sort({ isFeatured: -1, createdAt: -1 })
        .lean(),
      getAddons(),
      getSiteConfig(),
      getSliders(),
    ]);

    productsRaw = dbProducts && dbProducts.length > 0 ? dbProducts : FALLBACK_PRODUCTS;
    addons = addonsRes?.success && addonsRes.data && addonsRes.data.length > 0 ? addonsRes.data : FALLBACK_ADDONS;
    siteConfig = siteConfigRes?.data;
    initialSlides = slidersRes?.data ? [...slidersRes.data].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
  } catch (dbErr) {
    console.warn("Aviso de BD en Home (usando fallback offline/build):", dbErr);
    productsRaw = FALLBACK_PRODUCTS;
    addons = FALLBACK_ADDONS;
    const [siteConfigRes, slidersRes] = await Promise.all([getSiteConfig(), getSliders()]);
    siteConfig = siteConfigRes?.data;
    initialSlides = slidersRes?.data || [];
  }

  const products = JSON.parse(JSON.stringify(productsRaw));

  // Portada fotográfica de la floristería: usa el banner activo del admin si existe o una imagen de lujo por defecto
  const activeSlideBanner = initialSlides.find(
    (s: any) => s.type === 'banner' && s.image && !s.image.match(/\.(mp4|webm|ogg)$/i)
  );
  const coverImage =
    activeSlideBanner?.image ||
    (initialSlides.length > 0 && initialSlides[0]?.image ? initialSlides[0].image : null) ||
    "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1600&q=80&auto=format";

  return (
    <main className="min-h-screen bg-[#fff8f7] dark:bg-[#0B0C10] text-[#221a19] dark:text-gray-100 transition-colors duration-300 relative overflow-x-hidden">
      {/* Componente de Mariposas Animadas con Aleteo 3D */}
      <AnimatedButterflies />

      {/* Header & Sticky Nav Bar con Mega-Menu integrado */}
      <StickyNav siteConfig={siteConfig} />

      {/* Experiencia de Comercio DoorDash:
          1. Header de Comercio (Cover, Avatar, Rating 4.9, Selector Entrega/Retiro, Buscador en vivo)
          2. FeaturedProductsSlider (Selección de Temporada - Conservado Intacto)
          3. Menú Lateral Sticky en Desktop & Barra Horizontal de Pastillas en Móvil
          4. Feed Reagrupado por Categorías con Tarjetas Horizontales DoorDash y Botón '+' Rápido
      */}
      <div className="pt-2 pb-8">
        <DoorDashStoreFeed
          products={products}
          addons={addons}
          siteConfig={siteConfig}
          coverImage={coverImage}
          locale={locale}
          featuredComponent={<FeaturedProductsSlider products={products.slice(0, 12)} />}
        />
      </div>

      {/* Módulo iFrame Personalizado (si está activo en configuración) */}
      {siteConfig?.enableCustomIframe && (
        <CustomIframeSection
          title={siteConfig.customIframeTitle}
          iframeHtml={siteConfig.customIframeHtml}
        />
      )}

      {/* Secciones Combinadas en 2 Columnas Paralelas (Instagram & Trustpilot) */}
      <SocialAndReviewsSection
        enableReviews={siteConfig?.enableReviewsSection !== false}
        reviewsTitle={locale === 'en' ? undefined : siteConfig?.reviewsTitle}
        ratingScore={locale === 'en' ? undefined : siteConfig?.reviewsRatingScore}
        countText={locale === 'en' ? undefined : siteConfig?.reviewsCountText}
        trustpilotWidgetHtml={siteConfig?.trustpilotWidgetHtml}
        enableSocialFeed={siteConfig?.enableSocialFeed !== false}
        socialTitle={siteConfig?.socialFeedTitle || "Síguenos en Instagram 📸"}
        embedHtml={siteConfig?.socialEmbedHtml}
        instagramUrl={siteConfig?.instagramUrl || "https://instagram.com"}
      />

      {/* Footer Oficial */}
      <Footer siteConfig={siteConfig} />
    </main>
  );
}
