import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * Static Hero fallback — renders instantly with default values.
 * No data fetching, no await. Used as Suspense fallback for the real Hero.
 */
export default function HeroFallback() {
  return (
    <section className="relative h-[calc(100svh-56px)] lg:h-[calc(100vh-64px)] w-full overflow-hidden bg-background">
      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden relative h-full w-full">
        <div className="absolute inset-0">
          <Image
            src="/hero.webp"
            alt="SK Bags - Premium Handmade Bags"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 container mx-auto px-5 h-full flex items-end justify-center pb-16 text-center">
          <Link href="/products">
            <Button
              className="min-h-[48px] px-8 py-3 bg-white/95 text-gray-900 hover:bg-white text-sm tracking-[0.2em] font-medium uppercase transition-all duration-300 shadow-lg rounded-full backdrop-blur-sm"
            >
              SHOP BAGS
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-px h-8 md:h-12 bg-white/50 relative">
            <div className="absolute top-0 w-px h-3 md:h-4 bg-white animate-pulse" />
          </div>
        </div>
      </div>

      {/* Desktop Split Layout */}
      <div className="hidden lg:flex h-full w-full items-center">
        <div className="w-[60%] h-full flex flex-col items-center justify-center text-center px-12 md:px-20 bg-background border-r border-gray-100">
          <div className="max-w-2xl space-y-8">
            <h1 className="font-playfair text-5xl md:text-7xl text-gray-900 leading-tight">
              Crafted for Every Moment
            </h1>
            <p className="text-gray-600 text-lg md:text-xl font-light tracking-wide max-w-lg mx-auto leading-relaxed">
              Discover our curated collection of handcrafted bags and accessories — where timeless elegance meets everyday luxury.
            </p>
            <div className="pt-6">
              <Link href="/products">
                <Button className="px-12 py-7 min-h-[54px] bg-black text-white hover:bg-gray-800 rounded-full tracking-[0.2em] uppercase text-sm transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                  SHOP NOW
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="w-[40%] h-full relative overflow-hidden">
          <Image
            src="/hero.webp"
            alt="SK Bags Collection"
            fill
            priority
            className="object-cover"
            style={{ objectPosition: "center -26px" }}
            sizes="40vw"
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>
      </div>
    </section>
  );
}
