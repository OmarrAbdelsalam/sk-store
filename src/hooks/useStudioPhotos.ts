"use client";

import { useEffect, useState } from "react";

/**
 * Detects "studio" product shots — the cut-out photos on a plain white
 * background — so the product page can hide them when real (lifestyle)
 * photos exist.
 *
 * How: load a 64px copy through Next's image optimizer (same origin, so the
 * canvas can be read), then look at the outer 3px ring. A studio shot has an
 * almost entirely near-white, colourless border.
 */

const cache = new Map<string, boolean>(); // url → isStudio
const inflight = new Map<string, Promise<boolean>>();

function thumbUrl(url: string) {
  return `/_next/image?url=${encodeURIComponent(url)}&w=64&q=75`;
}

function classify(url: string): Promise<boolean> {
  if (cache.has(url)) return Promise.resolve(cache.get(url)!);
  const existing = inflight.get(url);
  if (existing) return existing;

  const p = new Promise<boolean>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      try {
        const size = 64;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(false);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let border = 0;
        let white = 0;
        const ring = 3;
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            if (x >= ring && x < size - ring && y >= ring && y < size - ring) continue;
            const i = (y * size + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2];
            border++;
            const min = Math.min(r, g, b);
            const max = Math.max(r, g, b);
            if (min >= 232 && max - min <= 14) white++;
          }
        }
        resolve(border > 0 && white / border >= 0.92);
      } catch {
        resolve(false);
      }
    };
    img.onerror = () => resolve(false);
    img.src = thumbUrl(url);
  }).then((isStudio) => {
    cache.set(url, isStudio);
    inflight.delete(url);
    return isStudio;
  });

  inflight.set(url, p);
  return p;
}

/**
 * Returns `{ studio, ready }`: `studio[url]` is true for white-background
 * shots; `ready` turns true when every url is classified (or after a short
 * timeout, so a slow image never blocks the gallery — unknown = not studio).
 */
export function useStudioPhotos(urls: string[], timeoutMs = 2500) {
  const key = urls.join("|");
  const [studio, setStudio] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(urls.filter((u) => cache.has(u)).map((u) => [u, cache.get(u)!]))
  );
  const [ready, setReady] = useState(() => urls.every((u) => cache.has(u)));

  useEffect(() => {
    let alive = true;
    if (urls.length === 0) {
      setReady(true);
      return;
    }
    if (urls.every((u) => cache.has(u))) {
      setStudio(Object.fromEntries(urls.map((u) => [u, cache.get(u)!])));
      setReady(true);
      return;
    }
    setReady(false);
    const timer = window.setTimeout(() => alive && setReady(true), timeoutMs);
    Promise.all(urls.map((u) => classify(u).then((v) => [u, v] as const))).then((pairs) => {
      if (!alive) return;
      setStudio(Object.fromEntries(pairs));
      setReady(true);
      window.clearTimeout(timer);
    });
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return { studio, ready };
}
