import AnnouncementTicker from "@/components/AnnouncementTicker";
import { getLocale } from "next-intl/server";
import { marqueeService, MarqueeItem, MarqueeSettings } from "@/services/marquee";

export default async function TopBanner() {
  const locale = await getLocale();
  let items: MarqueeItem[] = [];
  let settings: MarqueeSettings | null = null;

  try {
    const [itemsData, settingsData] = await Promise.all([
      marqueeService.getActiveItems('top_banner').catch(() => []),
      marqueeService.getSettings('top_banner').catch(() => null)
    ]);
    items = itemsData || [];
    settings = settingsData || null;
  } catch (error) {
    // Silently fail - banner is non-critical
    return null;
  }

  // Don't render if inactive or no items
  if (!settings?.is_active || items.length === 0) {
    return null;
  }

  // Theme: Parfois-style promo bar — light gray (`bg-announcement`), ink
  // text, 13px semibold, one message at a time sliding up
  // (DESIGN_SYSTEM.md › Page anatomy). Admin colour settings are ignored so a
  // stored default can't break the theme.
  return (
    <aside aria-label={locale === "ar" ? "إعلانات" : "Announcements"} className="relative select-none bg-announcement text-ink">
      <AnnouncementTicker items={items.map((item) => item.text)} />
    </aside>
  );
}
