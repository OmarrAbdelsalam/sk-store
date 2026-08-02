import { Suspense } from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import HeroFallback from "@/components/HeroFallback";
import NewArrivals from "@/components/NewArrivals";
import MaisonClutchSection from "@/components/MaisonClutchSection";
import FeaturesSection from "@/components/FeaturesSection";
import MovingTicker from "@/components/MovingTicker";
import DiscoverSection from "@/components/DiscoverSection";
import { ClothingShowcase } from "@/components/CategoryBanners";
import ReviewsGallery from "@/components/ReviewsGallery";
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

// Lazy loaded client-only components
const ReelsShowcase = dynamic(() => import("@/components/ReelsShowcase").then(mod => mod.ReelsShowcase));
const ProductGrid = dynamic(() => import("@/components/ProductGrid"));
const HandbagsSection = dynamic(() => import("@/components/HandbagsSection"));
const BestSellers = dynamic(() => import("@/components/BestSellers"));

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

      {/* Sections with consistent spacing (48px mobile / 64px desktop) */}
      <div className="bg-white space-y-12 md:space-y-16 pt-12 md:pt-16 pb-12 md:pb-16">
        {/* New Arrivals - Server Component */}
        <Suspense fallback={null}>
          <NewArrivals />
        </Suspense>

        {/* Category Banners - Server fetches, Client handles interaction */}
        <Suspense fallback={null}>
          <ClothingShowcase />
        </Suspense>

        {/* Reels Showcase - Client (video/carousel) */}
        <ReelsShowcase />

        {/* Product Grid - Client (filters/pagination) */}
        <ProductGrid />

        {/* Discover Section - Server Component */}
        <Suspense fallback={null}>
          <DiscoverSection />
        </Suspense>

        {/* Moving Ticker - Server Component */}
        <Suspense fallback={null}>
          <MovingTicker />
        </Suspense>

        {/* Maison Clutch - Server Component */}
        <Suspense fallback={null}>
          <MaisonClutchSection />
        </Suspense>

        {/* Handbags - Client (carousel) */}
        <HandbagsSection />

        {/* Reviews - Server fetches, Client handles lightbox */}
        <Suspense fallback={null}>
          <ReviewsGallery />
        </Suspense>

        {/* Best Sellers - Client (carousel) */}
        <Suspense fallback={null}>
          <BestSellers />
        </Suspense>

        {/* Features - Server Component */}
        <Suspense fallback={null}>
          <FeaturesSection />
        </Suspense>
      </div>
    </div>
  );
}
