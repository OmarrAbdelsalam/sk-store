"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scroll to the top on page changes only. (It used to also fire on every
 * query-string change, which threw the shopper back to the top each time a
 * filter or colour was ticked on the products page — and reading the query
 * here forced every page to render on the client.)
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };

    // Immediate
    scrollToTop();

    // After animation frame (DOM render)
    const rafId = requestAnimationFrame(scrollToTop);

    // Short timeout for async mounted pages
    const timerId = setTimeout(scrollToTop, 50);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [pathname]);

  return null;
}
