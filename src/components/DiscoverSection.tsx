import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { moreToDiscoverService, MoreToDiscoverItem } from "@/services/moreToDiscover";

const DiscoverSection = async () => {
  const t = await getTranslations("DiscoverSection");

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
    <section className="bg-white overflow-hidden">
      <div className="container mx-auto px-5">
        <div className="text-center mb-10">
          <h2 className="font-sans font-normal text-3xl md:text-4xl text-gray-800 mb-2">
            {t("title")}
          </h2>
          <div className="w-24 h-[2px] bg-[#C2A878] mx-auto mt-3 rounded-full"></div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {displayItems.map((item) => (
            <Link key={item.id} href={item.link || "/products"}>
              <div className="relative aspect-[4/5] lg:aspect-square lg:max-h-[80vh] overflow-hidden group cursor-pointer shadow-md md:shadow-lg rounded">
                <Image
                  src={item.image_url}
                  alt={item.title || "Discover"}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 50vw"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/15 transition-colors duration-500" />
                {item.title && (
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-white font-sans font-bold text-lg drop-shadow-md">{item.title}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiscoverSection;
