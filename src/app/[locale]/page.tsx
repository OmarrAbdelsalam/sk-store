import { Suspense } from "react";
import Hero from "@/components/Hero";
import HeroFallback from "@/components/HeroFallback";
import NewArrivals from "@/components/NewArrivals";
import MaisonClutchSection from "@/components/MaisonClutchSection";
import DiscoverSection from "@/components/DiscoverSection";
import dynamic from "next/dynamic";
import ProductsCacheSeeder from "@/components/ProductsCacheSeeder";
import { fetchProducts } from "@/api/products";
import { generatePageMetadata } from "@/lib/metadata";
import { withRetry } from "@/lib/retry";
import { CONTACT_INFO } from "@/lib/constants";
import type { Metadata } from "next";

// Revalidate homepage every 60 seconds to pick up admin changes
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return generatePageMetadata({
    title: isAr ? "SK Bags | شنط هاند ميد بريميم" : "SK Bags | Premium Handmade Bags",
    description: isAr
      ? "اكتشفي شنط SK Bags الهاند ميد البريميم بتصميمات أنيقة وخامات عالية الجودة وتوصيل لكل أنحاء مصر."
      : "Shop premium handmade bags by SK Bags, crafted with elegant designs and high-quality materials, with delivery across Egypt.",
    path: "",
    locale,
  });
}


/**
 * Async component that fetches products and seeds the client cache.
 * Wrapped in Suspense so it doesn't block Hero/NewArrivals from rendering.
 */
async function ProductsLoader({ locale }: { locale: string }) {
  let allProducts: any[] = [];
  try {
    const result = await withRetry(() => fetchProducts(1, 100), { label: "ProductsLoader" });
    allProducts = result.items;
  } catch (error) {
    // Client components will fetch on their own if this fails
  }

  if (allProducts.length === 0) return null;

  return <ProductsCacheSeeder products={allProducts} locale={locale} />;
}

// Lazy loaded client-only components
const ReelsShowcase = dynamic(() => import("@/components/ReelsShowcase").then(mod => mod.ReelsShowcase));
const BestSellers = dynamic(() => import("@/components/BestSellers"));

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen">
      {/* Products cache seeder — doesn't block page render */}
      <Suspense fallback={null}>
        <ProductsLoader locale={locale} />
      </Suspense>

      {/* SEO Content - Hidden visually but accessible for SEO */}
      <div className="sr-only">
        <h1>SK Bags - شنط هاند ميد بريميم بتوصيل لكل أنحاء مصر</h1>
        <p>
          Shop premium handmade bags by SK Bags, crafted with elegant designs and high-quality materials.
          تسوقي شنط هاند ميد بريميم من SK Bags مع توصيل لكل أنحاء مصر.
        </p>
        <nav aria-label="Quick Links">
          <ul>
            <li><a href="#products">Browse Products</a></li>
            <li><a href="/cart">Shopping Cart</a></li>
            <li><a href="/my-orders">Track Orders</a></li>
            <li><a href={CONTACT_INFO.whatsappLink} target="_blank" rel="noopener noreferrer">Contact Us on WhatsApp</a></li>
          </ul>
        </nav>
      </div>

      {/* Hero Section - Shows instantly with defaults, swaps to real data when ready */}
      <Suspense fallback={<HeroFallback />}>
        <Hero />
      </Suspense>

      {/* Home: hero → New Arrivals → Maison Clutch → More to Discover →
          Best Sellers → Reels. (The old category tiles, "Our collections" grid
          and customer-photo gallery were removed with the re-theme.) */}
      <div className="flex flex-col gap-tile bg-background pt-tile">

        <div className="ds-grid-page py-section">
          <Suspense fallback={null}>
            <NewArrivals />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <MaisonClutchSection />
        </Suspense>

        {/* More to Discover — two editorial tiles */}
        <Suspense fallback={null}>
          <DiscoverSection />
        </Suspense>
      </div>

      {/* Best sellers, reels */}
      <div className="ds-grid-page">
        <Suspense fallback={null}>
          <BestSellers />
        </Suspense>
      </div>

      <ReelsShowcase />

    </div>
  );
}
