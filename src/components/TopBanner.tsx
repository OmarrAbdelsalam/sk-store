import { marqueeService, MarqueeItem, MarqueeSettings } from "@/services/marquee";

export default async function TopBanner() {
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

  // Only animate if we have more than 1 item
  const shouldAnimate = items.length > 1;
  const bgColor = settings.background_color || "#000000";
  const textColor = settings.text_color || "#ffffff";

  return (
    <aside 
      aria-label="Announcement"
      className="relative overflow-hidden border-b border-white/10 select-none transition-colors duration-300 antialiased"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <div className="py-2 sm:py-2.5 flex items-center overflow-hidden min-h-[38px] sm:min-h-[40px]">
        {shouldAnimate ? (
          /* Two identical strips side-by-side, each scrolling left */
          <div className="flex shrink-0 animate-marquee" style={{ animationDuration: `${settings?.scroll_speed || 30}s` }}>
            {/* Strip 1 */}
            <div className="flex items-center shrink-0 text-[12px] sm:text-[13px] font-medium tracking-[0.16em] sm:tracking-[0.2em] uppercase">
              {items.map((item) => (
                <span key={item.id} className="flex items-center shrink-0">
                  <span className="mx-6 sm:mx-8 whitespace-nowrap">{item.text}</span>
                  <span className="opacity-30 text-[11px]">✦</span>
                </span>
              ))}
            </div>
            {/* Strip 2 (duplicate) */}
            <div className="flex items-center shrink-0 text-[12px] sm:text-[13px] font-medium tracking-[0.16em] sm:tracking-[0.2em] uppercase">
              {items.map((item) => (
                <span key={`d-${item.id}`} className="flex items-center shrink-0">
                  <span className="mx-6 sm:mx-8 whitespace-nowrap">{item.text}</span>
                  <span className="opacity-30 text-[11px]">✦</span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full text-[12px] sm:text-[13px] font-medium tracking-[0.16em] sm:tracking-[0.2em] uppercase text-center px-4">
            <span className="whitespace-nowrap truncate max-w-full">
              {items[0]?.text || ""}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}


