"use client";

import { useEffect, useState } from "react";
import { marqueeService, MarqueeItem, MarqueeSettings } from "@/services/marquee";

const TopBanner = () => {
  const [items, setItems] = useState<MarqueeItem[]>([]);
  const [settings, setSettings] = useState<MarqueeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [itemsData, settingsData] = await Promise.all([
          marqueeService.getActiveItems('top_banner'),
          marqueeService.getSettings('top_banner')
        ]);
        setItems(itemsData);
        setSettings(settingsData);
      } catch (error) {
        console.error("Error loading top banner:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Don't render if loading, inactive, or no items
  if (isLoading || !settings?.is_active || items.length === 0) {
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
      <div className="py-2.5 flex items-center justify-center relative overflow-hidden">
        <div 
            className={`whitespace-nowrap font-medium text-xs md:text-sm tracking-widest uppercase ${shouldAnimate ? 'animate-marquee' : ''}`}
            style={{ 
                animationDuration: shouldAnimate ? `${settings.scroll_speed || 30}s` : undefined
            }}
        >
          {items.map((item, idx) => (
            <span key={item.id} className="mx-8">
              {item.text}
              {shouldAnimate && idx < items.length - 1 && <span className="mx-4 opacity-50">•</span>}
            </span>
          ))}
          {/* Duplicate for seamless loop - only if animating */}
          {shouldAnimate && items.map((item, idx) => (
            <span key={`dup-${item.id}`} className="mx-8">
              {item.text}
              {idx < items.length - 1 && <span className="mx-4 opacity-50">•</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
