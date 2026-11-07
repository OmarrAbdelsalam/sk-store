import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * Static Hero fallback — renders instantly with default values.
 * No data fetching, no await. Used as Suspense fallback for the real Hero.
 * Must match HeroCarousel's geometry exactly so nothing jumps on swap.
 */
export default function HeroFallback() {
  return (
    <section className="relative w-full overflow-hidden bg-beige -mt-header-mobile lg:-mt-header-desktop h-[88svh] min-h-[520px] lg:h-screen lg:min-h-[640px]">
      <Image
        src="/hero.png"
        alt="SK Bags - Premium Handmade Bags"
        fill
        priority
        className="object-cover object-center lg:hidden"
        sizes="100vw"
      />
<div className="absolute inset-0 hidden grid-cols-2 gap-tile lg:grid">
        <div className="relative h-full overflow-hidden">
          <Image src="/hero.png" alt="SK Bags Collection" fill priority className="object-cover" style={{ objectPosition: "50% 22%" }} sizes="50vw" />
        </div>
        <div className="relative h-full overflow-hidden">
          <Image src="/discover2.webp" alt="" fill priority className="object-cover" style={{ objectPosition: "50% 78%" }} sizes="50vw" />
        </div>
      </div>
      <div className="absolute inset-0 bg-scrim" aria-hidden />
      <div className="absolute inset-0 bg-scrim-center" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-[190px] bg-scrim-top" aria-hidden />
      
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-gutter text-center">
        <p className="ds-label ds-on-image mb-3">Handmade in Egypt</p>
        <h1 className="ds-display-lg ds-on-image mb-8 max-w-3xl">Crochet bags, made by hand</h1>
        <Button asChild variant="overlay" className="h-button-overlay">
          <Link href="/products">Shop the collection</Link>
        </Button>
      </div>
    </section>
  );
}
