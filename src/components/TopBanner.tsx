import { marqueeService, MarqueeItem, MarqueeSettings } from "@/services/marquee";
import { Sparkles } from "lucide-react";
import { Boogaloo } from 'next/font/google';

const boogaloo = Boogaloo({
  weight: '400',
  subsets: ['latin'],
});

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
        className={`relative overflow-hidden border-b border-[#2D2A26]/10 bg-black text-white transition-colors duration-300 ${boogaloo.className}`}
      >
        <div className="py-2 flex items-center overflow-hidden">
          {shouldAnimate ? (
            /* Two identical strips side-by-side, each scrolling left */
            <div className="flex shrink-0 animate-marquee" style={{ animationDuration: `${settings?.scroll_speed || 30}s` }}>
              {/* Strip 1 */}
              <div className="flex items-center shrink-0 text-xs md:text-sm tracking-widest text-white pt-1">
                {items.map((item) => (
                  <span key={item.id} className="flex items-center shrink-0">
                    <Sparkles className="w-3 h-3 text-yellow-500 mr-2" />
                    <span className="mx-4 md:mx-6 whitespace-nowrap">{item.text}</span>
                    <span className="opacity-30 ml-4 md:ml-6 md:opacity-50">•</span>
                  </span>
                ))}
              </div>
              {/* Strip 2 (duplicate) */}
              <div className="flex items-center shrink-0 text-xs md:text-sm tracking-widest text-white pt-1">
                {items.map((item) => (
                  <span key={`d-${item.id}`} className="flex items-center shrink-0">
                    <Sparkles className="w-3 h-3 text-yellow-500 mr-2" />
                    <span className="mx-4 md:mx-6 whitespace-nowrap">{item.text}</span>
                    <span className="opacity-30 ml-4 md:ml-6 md:opacity-50">•</span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full text-xs md:text-sm tracking-widest text-white pt-1">
              <span className="mx-6 md:mx-8 whitespace-nowrap flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-yellow-500" />
                {items[0]?.text || "Mix & match any 3 × 50ml or 100ml — get 10% off"}
              </span>
            </div>
          )}
        </div>
      </div>
  );
};


