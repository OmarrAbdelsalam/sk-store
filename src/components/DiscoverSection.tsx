"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { moreToDiscoverService, MoreToDiscoverItem } from "@/services/moreToDiscover";

const DiscoverSection = () => {
  const t = useTranslations("DiscoverSection");
  const [items, setItems] = useState<MoreToDiscoverItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('more_to_discover_cache');
        if (local) return JSON.parse(local);
      } catch (e) {}
    }
    return [];
  });
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    moreToDiscoverService.getActiveItems()
      .then(data => {
        setItems(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('more_to_discover_cache', JSON.stringify(data));
        }
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (!mounted || (loading && items.length === 0)) {
    return (
      <section className="py-16 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="h-8 w-48 bg-muted animate-pulse mx-auto mb-2 rounded" />
            <div className="w-24 h-[1px] bg-muted mx-auto mt-3" />
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            <div className="relative aspect-[3/4] lg:aspect-square lg:max-h-[80vh] bg-muted animate-pulse rounded-xl" />
            <div className="relative aspect-[3/4] lg:aspect-square lg:max-h-[80vh] bg-muted animate-pulse rounded-xl" />
          </div>
        </div>
      </section>
    );
  }

  // Fallback to static images if no backend data
  const fallbackItems: MoreToDiscoverItem[] = [
    { id: "1", image_url: "/discover1.webp", link: "/products", display_order: 1, is_active: true },
    { id: "2", image_url: "/discover2.webp", link: "/products", display_order: 2, is_active: true },
  ];

  const displayItems = items.length >= 2 ? items.slice(0, 2) : fallbackItems;

  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-playfair text-3xl md:text-4xl text-gray-900 mb-2">
            {t("title")}
          </h2>
          <div className="w-24 h-[1px] bg-black mx-auto mt-3"></div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-6">
          {displayItems.map((item) => (
            <Link key={item.id} href={item.link || "/products"}>
              <div className="relative aspect-[3/4] lg:aspect-square lg:max-h-[80vh] overflow-hidden group cursor-pointer shadow-md md:shadow-lg rounded-xl">
                <Image
                  src={item.image_url}
                  alt={item.title || "Discover"}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 50vw"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-500" />
                {item.title && (
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-white font-playfair text-lg drop-shadow-md">{item.title}</span>
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
