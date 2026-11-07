"use client";

import { useEffect, useState } from "react";

/**
 * Parfois-style promo bar content: one message at a time, the next slides up
 * every few seconds. A single message just sits still. Respects reduced motion.
 */
export default function AnnouncementTicker({
  items,
  intervalMs = 4000,
}: {
  items: string[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % items.length), intervalMs);
    return () => window.clearInterval(id);
  }, [items.length, intervalMs]);

  return (
    <div className="relative h-announcement overflow-hidden" aria-live="polite">
      <ul
        className="transition-transform duration-500 ease-brand"
        style={{ transform: `translateY(calc(-${index} * var(--ds-announcement-h)))` }}
      >
        {items.map((text, i) => (
          <li
            key={i}
            aria-hidden={i !== index}
            className="ds-announce flex h-announcement items-center justify-center truncate px-gutter text-center"
          >
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
