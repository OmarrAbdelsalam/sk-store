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
    eyebrow: "Handmade in Egypt",
    title: "Crochet bags, made by hand",
    description: "Discover our vibrant new summer collection of handcrafted bags.",
    // Product-led photos where the bag is the subject (hero.png 1080×1920,
    // discover2.webp 965×1280) — split on desktop, the sand shot on phones.
    desktopImage: "/hero.png",
    desktopImage2: "/discover2.webp",
    desktopPositions: ["50% 22%", "50% 78%"] as [string, string],
    mobileMedia: "/hero.png",
    mobileIsVideo: false,
    buttonText: "Shop the collection",
    buttonLink: `/products`,
    mobileButtonLink: `/products`,
  };

  return (
    // Pulled up under the transparent header (home page only).
    <section className="w-full overflow-hidden bg-background -mt-header-mobile lg:-mt-header-desktop">
      <HeroCarousel slides={[slide1]} />
    </section>
  );
}
