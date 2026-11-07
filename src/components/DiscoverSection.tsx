import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { moreToDiscoverService, MoreToDiscoverItem } from "@/services/moreToDiscover";

const DiscoverSection = async () => {
  const t = await getTranslations("DiscoverSection");
  const tBanners = await getTranslations("Banners");

  let items: MoreToDiscoverItem[] = [];
  try {
    items = await moreToDiscoverService.getActiveItems();
  } catch (error) {
    // Fall through to fallback
  }

  // Fallback to static images if no backend data
  const fallbackItems: MoreToDiscoverItem[] = [
    { id: "1", image_url: "/discover1.webp", link: "/products", display_order: 1, is_active: true },
    { id: "2", image_url: "/discover2.webp", link: "/products", display_order: 2, is_active: true },
  ];

  const displayItems = items.length >= 2 ? items.slice(0, 2) : fallbackItems;

  return (
    <section className="bg-background" aria-labelledby="discover-title">
      <h2 id="discover-title" className="sr-only">{t("title")}</h2>

      {/* Full-bleed two-up editorial tiles */}
      <div className="grid grid-cols-1 gap-tile md:grid-cols-2">
        {displayItems.map((item) => (
          <Link key={item.id} href={item.link || "/products"} className="group block">
            <div className="relative aspect-tile overflow-hidden bg-beige">
              <Image
                src={item.image_url}
                alt={item.title || t("title")}
                fill
                className="object-cover transition-transform duration-700 ease-brand group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-scrim" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-6 px-gutter pb-10 text-center lg:pb-12">
                {item.title && (
                  <h3 className="ds-display-lg ds-on-image">{item.title}</h3>
                )}
                <span className="ds-btn-overlay">{tBanners("shopNow")}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default DiscoverSection;
