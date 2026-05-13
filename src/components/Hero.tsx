import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { heroService, HeroSettings, DEFAULT_HERO } from "@/services/hero";
import { mobileHeroService, MobileHero, DEFAULT_MOBILE_HERO } from "@/services/mobileHero";

export default async function Hero() {
  let hero: HeroSettings = { id: "default", ...DEFAULT_HERO };
  let mobileHero: MobileHero = { id: "default", ...DEFAULT_MOBILE_HERO };

  try {
    const [heroData, mobileData] = await Promise.all([
      heroService.getActive(),
      mobileHeroService.getActive(),
    ]);
    if (heroData) hero = heroData;
    if (mobileData) mobileHero = mobileData;
  } catch (error) {
    // keep defaults on error
  }

  // SSR: render with actual data immediately
  const desktopImage = hero.image_url || DEFAULT_HERO.image_url;
  const mobileMedia = mobileHero.media_url || DEFAULT_MOBILE_HERO.media_url;
  const mobileIsVideo = mobileHero.media_type === "video";
  const buttonText = hero.button_text || DEFAULT_HERO.button_text;
  const buttonLink = hero.button_link || DEFAULT_HERO.button_link;
  const mobileButtonText = mobileHero.button_text || DEFAULT_MOBILE_HERO.button_text;
  const mobileButtonLink = mobileHero.button_link || DEFAULT_MOBILE_HERO.button_link;

  return (
    <section className="relative h-[calc(100svh-80px)] lg:h-[90vh] w-full overflow-hidden bg-background">
      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden relative h-full w-full">
        {/* Background Media */}
        <div className="absolute inset-0">
          {mobileIsVideo ? (
            <video
              src={mobileMedia}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Image
              src={mobileMedia}
              alt="SK Bags - Premium Handmade Bags"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Content Overlay */}
        <div
          className="relative z-10 container mx-auto px-4 h-full flex items-end justify-center pb-12 text-center"
          style={{ color: mobileHero.text_color || "#ffffff" }}
        >
          <Link href={mobileButtonLink}>
            <Button
              variant="link"
              className="drop-shadow-md text-sm md:text-base tracking-[0.2em] font-medium uppercase hover:opacity-80 transition-colors underline-offset-4 decoration-1 hover:underline"
              style={{ color: mobileHero.text_color || "#ffffff" }}
            >
              {mobileButtonText}
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

      {/* Desktop Split Layout */}
      <div className="hidden lg:flex h-full w-full items-center">
        {/* Left: Text Content (60%) */}
        <div className="w-[60%] h-full flex flex-col items-center justify-center text-center px-12 md:px-20 bg-background border-r border-gray-100">
          <div className="max-w-2xl space-y-8">
            <h1 className="font-playfair text-5xl md:text-7xl text-gray-900 leading-tight">
              {hero.title || DEFAULT_HERO.title}
            </h1>
            <p className="text-gray-600 text-lg md:text-xl font-light tracking-wide max-w-lg mx-auto leading-relaxed">
              {hero.description || DEFAULT_HERO.description}
            </p>
            <div className="pt-6">
              <Link href={buttonLink}>
                <Button className="px-12 py-7 bg-black text-white hover:bg-gray-800 rounded-none tracking-[0.2em] uppercase text-sm transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                  {buttonText}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Image (40%) */}
        <div className="w-[40%] h-full relative overflow-hidden">
          <Image
            src={desktopImage}
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
