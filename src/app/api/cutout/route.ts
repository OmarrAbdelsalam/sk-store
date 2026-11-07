import { NextRequest } from "next/server";
import sharp from "sharp";
import { cutoutWidth } from "@/lib/cutout";

/**
 * GET /api/cutout?u=<image url>&w=<width>[&mode=plain]
 *
 * Returns the product photo resized and with its near-white studio
 * background turned into exactly the tile gray (#F5F5F5), as WebP. This is
 * the same maths the old CSS did — contrast(1.08) → brightness(1.08) →
 * multiply by #F5F5F5 — but baked into the pixels, so iPhone Safari (which
 * applied the CSS differently) shows the same thing as every other browser.
 *
 * Only our own images are accepted (same origin, Supabase storage, Dropbox),
 * so this can't be used as an open image proxy. Responses are cached for a
 * year at the CDN: the output for a given url + width never changes.
 */

export const runtime = "nodejs";

const ALLOWED_HOSTS = [/\.supabase\.co$/i, /(^|\.)dropboxusercontent\.com$/i, /^www\.dropbox\.com$/i];

// contrast(1.08) then brightness(1.08), as one linear map: p·1.1664 − 11.016
const PUSH_A = 1.08 * 1.08;
const PUSH_B = 255 * 0.5 * (1 - 1.08) * 1.08;
// multiply by the tile colour #F5F5F5. WebP's colour conversion lifts this
// flat gray by one step (244 decodes as 245, 245 as 246), so aim at 244 to
// land on exactly #F5F5F5 after encoding.
const TILE_TONE = 244 / 255;

const CACHE = "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable";

export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u");
  const w = cutoutWidth(Number(req.nextUrl.searchParams.get("w")) || 828);
  // "plain" = resize + WebP only (lifestyle photos); default = melt the white.
  const plain = req.nextUrl.searchParams.get("mode") === "plain";
  if (!u) return new Response("Missing u", { status: 400 });

  let target: URL;
  try {
    target = new URL(u, req.nextUrl.origin);
  } catch {
    return new Response("Bad url", { status: 400 });
  }
  const sameOrigin = target.origin === req.nextUrl.origin;
  if (!sameOrigin && !(target.protocol === "https:" && ALLOWED_HOSTS.some((r) => r.test(target.hostname)))) {
    return new Response("Host not allowed", { status: 400 });
  }

  let input: Buffer;
  try {
    const res = await fetch(target, { cache: "force-cache" });
    if (!res.ok) return new Response("Upstream error", { status: 502 });
    input = Buffer.from(await res.arrayBuffer());
  } catch {
    return new Response("Upstream unreachable", { status: 502 });
  }

  try {
    if (plain) {
      const out = await sharp(input)
        .rotate()
        .resize({ width: w, withoutEnlargement: true })
        // q72: real photos come out ~25–30% smaller than the original JPEGs
        // with no visible loss at the sizes they're shown.
        .webp({ quality: 72 })
        .toBuffer();
      return new Response(new Uint8Array(out), {
        headers: { "Content-Type": "image/webp", "Cache-Control": CACHE },
      });
    }

    // 1) orient, resize, transparent → white, push near-white to pure white
    //    (8-bit output clamps at 255, just like the CSS filter steps did)
    const { data, info } = await sharp(input)
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .removeAlpha()
      .toColourspace("srgb")
      .linear(PUSH_A, PUSH_B)
      .raw()
      .toBuffer({ resolveWithObject: true });

    // 2) multiply by the tile gray: white → #F5F5F5 exactly
    const out = await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
      .linear(TILE_TONE, 0)
      .webp({ quality: 82 })
      .toBuffer();

    return new Response(new Uint8Array(out), {
      headers: { "Content-Type": "image/webp", "Cache-Control": CACHE },
    });
  } catch {
    // Not an image sharp can read — send the original rather than nothing.
    return Response.redirect(target.toString(), 302);
  }
}
