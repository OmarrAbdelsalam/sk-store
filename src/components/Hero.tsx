import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { heroService, HeroSettings, DEFAULT_HERO } from "@/services/hero";
import { mobileHeroService, MobileHero, DEFAULT_MOBILE_HERO } from "@/services/mobileHero";
import HeroCarousel from "./HeroCarousel";

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

  const getValidUrl = (url: string | null | undefined, fallback: string) => {
    if (!url || url === '/hero.webp') return fallback;
    return url;
  };

  // Summer Edition slide only
  const slide1 = {
    title: "Summer Edition",
    description: "Discover our vibrant new summer collection of handcrafted bags.",
    desktopImage: "/heroo.jpeg",
    mobileMedia: "/e.webp",
    mobileIsVideo: false,
    buttonText: "SHOP SUMMER",
    buttonLink: `/products?category=summer-collection`,
    mobileButtonLink: `/products?category=summer-collection`,
  };

  return (
    <section className="w-full bg-white overflow-hidden">
      <HeroCarousel slides={[slide1]} />
    </section>
  );
}
