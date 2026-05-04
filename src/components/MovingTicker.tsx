"use client";

import { useEffect, useState } from "react";
import { marqueeService, MarqueeItem, MarqueeSettings } from "@/services/marquee";

const MovingTicker = () => {
  const [items, setItems] = useState<MarqueeItem[]>([]);
  const [settings, setSettings] = useState<MarqueeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [itemsData, settingsData] = await Promise.all([
          marqueeService.getActiveItems('features_ticker'),
          marqueeService.getSettings('features_ticker')
        ]);
        setItems(itemsData);
        setSettings(settingsData);
      } catch (error) {
        console.error("Error loading ticker:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading || !settings?.is_active || items.length === 0) {
    return null;
  }

  return (
    <div 
      className="py-3 overflow-hidden border-y border-white/10 select-none"
      style={{ 
        backgroundColor: settings.background_color || "#000000",
        color: settings.text_color || "#ffffff" 
      }}
    >
      <div 
        className="flex whitespace-nowrap w-max animate-ticker"
        style={{ 
            animationDuration: `${settings.scroll_speed || 40}s`
        }}
      >
        {/* Set 1 */}
        <div className="flex items-center">
          {items.map((item) => (
            <div key={`set1-${item.id}`} className="flex items-center">
              <span className="text-[10px] md:text-xs font-medium tracking-[0.3em] uppercase px-12">
                {item.text}
              </span>
              <span className="opacity-30 text-xs">•</span>
            </div>
          ))}
        </div>
        
        {/* Set 2 (Identical for seamless loop) */}
        <div className="flex items-center">
          {items.map((item) => (
            <div key={`set2-${item.id}`} className="flex items-center">
              <span className="text-[10px] md:text-xs font-medium tracking-[0.3em] uppercase px-12">
                {item.text}
              </span>
              <span className="opacity-30 text-xs">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovingTicker;
