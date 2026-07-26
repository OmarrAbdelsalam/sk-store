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
              SHOP SUMMER
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-px h-8 md:h-12 bg-white/50 relative">
            <div className="absolute top-0 w-px h-3 md:h-4 bg-white animate-pulse" />
          </div>
        </div>
      </div>

      {/* Desktop Full-Width Layout */}
      <div className="hidden lg:block relative h-full w-full">
        <Image
          src="/heroo.jpeg"
          alt="SK Bags Collection"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        <div className="relative z-10 h-full flex flex-col items-start justify-end pb-16 px-16">
          <div className="max-w-xl space-y-6 text-left">
            <h1 className="font-sans font-bold text-5xl md:text-7xl text-white leading-tight drop-shadow-lg">
              Summer Edition
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-light tracking-wide leading-relaxed drop-shadow-md">
              Discover our vibrant new summer collection of handcrafted bags.
            </p>
            <div className="pt-2">
              <Link href="/products">
                <Button className="px-10 py-5 min-h-[48px] bg-white text-gray-900 hover:bg-[#C2A878] hover:text-white rounded-full tracking-[0.2em] uppercase text-xs font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                  SHOP SUMMER
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
