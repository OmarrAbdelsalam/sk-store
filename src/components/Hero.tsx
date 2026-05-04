import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { Link } from "@/i18n/navigation";

const Hero = () => {
  const t = useTranslations();
  return (
    <section className="relative h-[70vh] lg:h-[90vh] w-full overflow-hidden bg-background">
      {/* Mobile/Tablet Layout (Existing logic, but limited to <lg) */}
      <div className="lg:hidden relative h-full w-full">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/hero.webp')` }}
        >
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-end justify-center pb-12 text-center">
          <Link href="/products">
            <Button 
              variant="link"
              className="text-white drop-shadow-md text-sm md:text-base tracking-[0.2em] font-medium uppercase hover:text-white/80 transition-colors underline-offset-4 decoration-1 hover:underline"
            >
              {t('Hero.shopBags')}
            </Button>
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-px h-8 md:h-12 bg-white/50 relative">
            <div className="absolute top-0 w-px h-3 md:h-4 bg-white animate-pulse" />
          </div>
        </div>
      </div>

      {/* Desktop Split Layout (Visible only on >=lg) */}
      <div className="hidden lg:flex h-full w-full items-center">
        {/* Left: Text Content (60%) */}
        <div className="w-[60%] h-full flex flex-col items-center justify-center text-center px-12 md:px-20 bg-background border-r border-gray-100">
          <div className="max-w-2xl space-y-8">
            <h1 className="font-playfair text-5xl md:text-7xl text-gray-900 leading-tight">
              {t('Hero.title') || "Artistry in Every Stitch"}
            </h1>
            <p className="text-gray-600 text-lg md:text-xl font-light tracking-wide max-w-lg mx-auto leading-relaxed">
              {t('Hero.description') || "Experience the perfect blend of traditional craftsmanship and modern design. Our handmade collection defines new standards of luxury."}
            </p>
            <div className="pt-6">
              <Link href="/products">
                <Button 
                  className="px-12 py-7 bg-black text-white hover:bg-gray-800 rounded-none tracking-[0.2em] uppercase text-sm transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  {t('Hero.shopBags')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Image (40%) */}
        <div className="w-[40%] h-full relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-no-repeat"
            style={{ 
              backgroundImage: `url('/hero.webp')`,
              backgroundPosition: 'center -26px'
            }}
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>
      </div>
    </section>
  );
};

export default Hero;