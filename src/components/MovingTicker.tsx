import { marqueeService } from "@/services/marquee";
import { formatError } from "@/lib/retry";

const MovingTicker = async () => {
  let items;
  let settings;

  try {
    [items, settings] = await Promise.all([
      marqueeService.getActiveItems('features_ticker'),
      marqueeService.getSettings('features_ticker'),
    ]);
  } catch (error) {
    console.error("Error loading ticker:", formatError(error));
    return null;
  }

  if (!settings?.is_active || !items || items.length === 0) {
    return null;
  }

  return (
    <div
      className="py-3 overflow-hidden border-y border-white/10 select-none"
      style={{
        backgroundColor: settings.background_color || "#000000",
        color: settings.text_color || "#ffffff",
      }}
    >
      <div
        className="flex whitespace-nowrap w-max animate-ticker"
        style={{
          animationDuration: `${settings.scroll_speed || 40}s`,
        }}
      >
        {/* Set 1 */}
        <div className="flex items-center">
          {items.map((item) => (
            <div key={`set1-${item.id}`} className="flex items-center">
              <span className="text-xs md:text-sm font-medium tracking-[0.25em] uppercase px-14">
                {item.text}
              </span>
              <span className="opacity-30 text-base px-2">✦</span>
            </div>
          ))}
        </div>

        {/* Set 2 (Identical for seamless loop) */}
        <div className="flex items-center">
          {items.map((item) => (
            <div key={`set2-${item.id}`} className="flex items-center">
              <span className="text-xs md:text-sm font-medium tracking-[0.25em] uppercase px-14">
                {item.text}
              </span>
              <span className="opacity-30 text-base px-2">✦</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovingTicker;
