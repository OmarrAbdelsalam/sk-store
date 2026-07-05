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

  // Slide 1: Summer Edition
  const slide1 = {
    title: "Summer Edition",
    description: "Discover our vibrant new summer collection of handcrafted bags.",
    desktopImage: "/hero.png", // Using hero.png for desktop as well to match
    mobileMedia: "/hero.png",
    mobileIsVideo: false,
    buttonText: "SHOP SUMMER",
    buttonLink: `/products?category=summer-collection`,
    mobileButtonLink: `/products?category=summer-collection`,
  };

  // Slide 2: Current Hero
  const slide2 = {
    title: hero.title || "New Collection",
    description: hero.description || "Discover our premium handmade bags",
    desktopImage: hero.image_url || DEFAULT_HERO.image_url,
    mobileMedia: mobileHero.media_url || DEFAULT_MOBILE_HERO.media_url,
    mobileIsVideo: mobileHero.media_type === "video",
    buttonText: hero.button_text || DEFAULT_HERO.button_text,
    buttonLink: hero.button_link || DEFAULT_HERO.button_link,
    mobileButtonLink: mobileHero.button_link || DEFAULT_MOBILE_HERO.button_link,
  };

  return (
    <section className="w-full bg-white">
      <HeroCarousel slides={[slide1, slide2]} />
    </section>
  );
}
