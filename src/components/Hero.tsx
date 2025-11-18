import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';

const Hero = () => {
  const t = useTranslations();
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/hero-medical.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-center text-center">
        <div className="max-w-4xl animate-hero-text">
          <p className="text-sm md:text-base text-white/90 font-medium tracking-wider uppercase mb-4">
            {t('Hero.specialists')}
          </p>
          <h1 className="font-luxury text-4xl md:text-6xl lg:text-7xl text-white font-medium mb-8 leading-tight">
            {t('Hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('Hero.desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary backdrop-blur-sm min-w-[180px]"
            >
              {t('Hero.shop')}
            </Button>
          </div>
        </div>
      </div>
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-px h-12 bg-white/50 relative">
          <div className="absolute top-0 w-px h-4 bg-white animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;