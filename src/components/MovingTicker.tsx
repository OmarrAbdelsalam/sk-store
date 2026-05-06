"use client";

import { useEffect, useState } from "react";
import { marqueeService, MarqueeItem, MarqueeSettings } from "@/services/marquee";

const MovingTicker = () => {
  const [items, setItems] = useState<MarqueeItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('ticker_items_cache');
        if (local) return JSON.parse(local);
      } catch (e) {}
    }
    return [];
  });
  const [settings, setSettings] = useState<MarqueeSettings | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('ticker_settings_cache');
        if (local) return JSON.parse(local);
      } catch (e) {}
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(!items.length);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [itemsData, settingsData] = await Promise.all([
          marqueeService.getActiveItems('features_ticker'),
          marqueeService.getSettings('features_ticker')
        ]);
        setItems(itemsData);
        setSettings(settingsData);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('ticker_items_cache', JSON.stringify(itemsData));
          localStorage.setItem('ticker_settings_cache', JSON.stringify(settingsData));
        }
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
