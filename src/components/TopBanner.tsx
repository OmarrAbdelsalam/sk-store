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

  return (
    <div 
      className="relative overflow-hidden"
      style={{ 
        backgroundColor: settings.background_color || "#000000",
        color: settings.text_color || "#ffffff" 
      }}
    >
      <div className="py-2.5 flex items-center overflow-hidden">
        {shouldAnimate ? (
          /* Two identical strips side-by-side, each scrolling left */
          <div className="flex shrink-0 animate-marquee" style={{ animationDuration: `${settings.scroll_speed || 30}s` }}>
            {/* Strip 1 */}
            <div className="flex items-center shrink-0 font-medium text-xs md:text-sm tracking-widest uppercase">
              {items.map((item) => (
                <span key={item.id} className="flex items-center shrink-0">
                  <span className="mx-6 md:mx-8 whitespace-nowrap">{item.text}</span>
                  <span className="opacity-50">•</span>
                </span>
              ))}
            </div>
            {/* Strip 2 (duplicate) */}
            <div className="flex items-center shrink-0 font-medium text-xs md:text-sm tracking-widest uppercase">
              {items.map((item) => (
                <span key={`d-${item.id}`} className="flex items-center shrink-0">
                  <span className="mx-6 md:mx-8 whitespace-nowrap">{item.text}</span>
                  <span className="opacity-50">•</span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full font-medium text-xs md:text-sm tracking-widest uppercase">
            <span className="mx-6 md:mx-8 whitespace-nowrap">{items[0]?.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};


