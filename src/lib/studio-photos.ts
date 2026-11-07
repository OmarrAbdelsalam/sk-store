import "server-only";
import sharp from "sharp";
import { unstable_cache } from "next/cache";

/**
 * Server-side twin of hooks/useStudioPhotos: is this photo a cut-out shot
 * on a plain white background? Decided by the outer 3px ring of a 64×64
 * copy being ≥92% near-white and colourless.
 *
 * Done on the server so the product gallery can render immediately instead
 * of loading every photo in the browser first and waiting (up to 2.5s) to
 * know which ones to hide. Each photo is checked once, then cached forever
 * (a photo URL never changes content).
 */

async function classify(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return false;
    const input = Buffer.from(await res.arrayBuffer());
    const size = 64;
    const { data, info } = await sharp(input)
      .resize(size, size, { fit: "fill" })
      .flatten({ background: "#ffffff" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const ch = info.channels;
    const ring = 3;
    let border = 0;
    let white = 0;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (x >= ring && x < size - ring && y >= ring && y < size - ring) continue;
        const i = (y * size + x) * ch;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        border++;
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        if (min >= 232 && max - min <= 14) white++;
      }
    }
    return border > 0 && white / border >= 0.92;
  } catch {
    // Unknown → treat as a real photo (it stays visible).
    return false;
  }
}

const classifyCached = unstable_cache(classify, ["studio-photo-v1"], { revalidate: false });

/** { [url]: isStudio } for the given photo URLs. */
export async function getStudioMap(urls: string[]): Promise<Record<string, boolean>> {
  const unique = [...new Set(urls.filter(Boolean))];
  const pairs = await Promise.all(unique.map(async (u) => [u, await classifyCached(u)] as const));
  return Object.fromEntries(pairs);
}
