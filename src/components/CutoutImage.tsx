"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { cutoutSrc } from "@/lib/cutout";

type Props = Omit<ImageProps, "src" | "loader" | "unoptimized"> & {
  src: string | null | undefined;
  /** Pixel width to request (≈ rendered width × device pixel ratio). */
  requestWidth?: number;
};

/**
 * A product photo whose white studio background is turned into the tile
 * gray on the server (see src/lib/cutout.ts). If that fails for any reason
 * the original photo is shown instead, so a card is never left empty.
 */
export default function CutoutImage({ src, requestWidth = 828, onError, ...rest }: Props) {
  const [useOriginal, setUseOriginal] = useState(false);
  useEffect(() => setUseOriginal(false), [src]);

  const original = src || "/SK_Logo.svg";
  const finalSrc = useOriginal ? original : cutoutSrc(original, requestWidth) || original;

  return (
    <Image
      {...rest}
      src={finalSrc}
      unoptimized
      onError={(e) => {
        if (!useOriginal) setUseOriginal(true);
        else onError?.(e);
      }}
    />
  );
}
