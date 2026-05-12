import { Suspense } from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

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

// Lazy loaded components (Code Splitting)
const NewArrivals = dynamic(() => import("@/components/NewArrivals"));
const ClothingShowcase = dynamic(() => import("@/components/CategoryBanners").then(mod => mod.ClothingShowcase));
const ReelsShowcase = dynamic(() => import("@/components/ReelsShowcase").then(mod => mod.ReelsShowcase));
const ProductGrid = dynamic(() => import("@/components/ProductGrid"));
const DiscoverSection = dynamic(() => import("@/components/DiscoverSection"));
const MaisonClutchSection = dynamic(() => import("@/components/MaisonClutchSection"));
const HandbagsSection = dynamic(() => import("@/components/HandbagsSection"));
const ReviewsGallery = dynamic(() => import("@/components/ReviewsGallery"));
const BestSellers = dynamic(() => import("@/components/BestSellers"));
const FeaturesSection = dynamic(() => import("@/components/FeaturesSection"));
const MovingTicker = dynamic(() => import("@/components/MovingTicker"));



const Index = () => {
  return (
    <div className="min-h-screen">
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
            <li><a href="https://wa.me/201501881005" target="_blank" rel="noopener noreferrer">Contact Us on WhatsApp</a></li>
          </ul>
        </nav>
      </div>
      
      {/* Hero Section */}
      <Hero />
      
      {/* New Arrivals */}
      <NewArrivals />

      {/* Category Banners */}
      <ClothingShowcase />

      {/* Reels Showcase */}
      <ReelsShowcase />
      
      <Suspense fallback={
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <div className="h-8 w-48 bg-muted animate-pulse mx-auto mb-2 rounded" />
              <div className="w-24 h-[1px] bg-muted mx-auto mt-3" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-6 items-stretch">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2 md:space-y-4 animate-pulse">
                  <div className="aspect-[3/4] w-full rounded-lg bg-muted" />
                  <div className="space-y-1.5 md:space-y-2">
                    <div className="h-4 md:h-6 w-3/4 rounded bg-muted" />
                    <div className="h-3 md:h-4 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      }>
        <ProductGrid />
      </Suspense>

      <DiscoverSection />
      
      <MovingTicker />
      
      <MaisonClutchSection />
      
      <HandbagsSection />
      
      <ReviewsGallery />
      
      <BestSellers />
      
      <FeaturesSection />
    </div>
  );
};

export default Index;
