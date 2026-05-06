import { Suspense } from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/Hero";

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
        <h1>House Scrub - Premium Medical Scrubs and Healthcare Uniforms | ملابس طبية فاخرة</h1>
        <p>
          Shop high-quality medical scrubs, healthcare uniforms, and professional medical wear. 
          Free shipping across Egypt. تسوق ملابس طبية عالية الجودة مع شحن مجاني في مصر.
        </p>
        <nav aria-label="Quick Links">
          <ul>
            <li><a href="#products">Browse Products</a></li>
            <li><a href="/cart">Shopping Cart</a></li>
            <li><a href="/my-orders">Track Orders</a></li>
            <li><a href="https://wa.me/+201501881005" target="_blank" rel="noopener noreferrer">Contact Us on WhatsApp</a></li>
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
