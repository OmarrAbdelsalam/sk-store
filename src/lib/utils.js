import { clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge has to be told about the design-system scale
 * (src/design-system/tokens.ts). Without this it reads `text-label` as a
 * text *color*, so `cn("text-label", "text-white")` would silently drop the
 * font size.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "caption",
            "label",
            "button",
            "fine",
            "announce",
            "title-sm",
            "body",
            "price",
            "title-md",
            "display-sm",
            "display-md",
            "display-lg",
          ],
        },
      ],
      tracking: [{ tracking: ["caption", "label", "button", "cta", "display"] }],
      rounded: [{ rounded: ["ds", "tag", "pill", "card", "luxury"] }],
      aspect: [{ aspect: ["product", "tile", "tile-wide"] }],
      "font-family": [{ font: ["display", "arabic", "cairo"] }],
    },
  },
})

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const getCourseSpecId = () => {
  const id = localStorage.getItem("courseSpecId");
  if (!id) throw new Error("courseSpecId not found in localStorage");
  return parseInt(id, 10);
};

export const getCourseKey = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("courseKey"); // ❌ ما نرميش Error
};
