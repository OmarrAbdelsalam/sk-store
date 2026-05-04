import { Suspense } from "react";
import Image from "next/image";
import ProductGrid from "@/components/ProductGrid";
import Hero from "@/components/Hero";
import NewArrivals from "@/components/NewArrivals";
import { ClothingShowcase } from "@/components/CategoryBanners";
import { ReelsShowcase } from "@/components/ReelsShowcase";
import DiscoverSection from "@/components/DiscoverSection";
import MaisonClutchSection from "@/components/MaisonClutchSection";
import HandbagsSection from "@/components/HandbagsSection";
import ReviewsGallery from "@/components/ReviewsGallery";
import BestSellers from "@/components/BestSellers";
import FeaturesSection from "@/components/FeaturesSection";
import MovingTicker from "@/components/MovingTicker";

// Loading skeleton component
const ProductGridSkeleton = () => (
  <div className="container mx-auto px-4 py-12">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-10 items-stretch">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2 animate-pulse">
          <div className="aspect-[3/4] w-full rounded-lg bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
      ))}
    </div>
  </div>
);

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
      
      <Suspense fallback={<ProductGridSkeleton />}>
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
