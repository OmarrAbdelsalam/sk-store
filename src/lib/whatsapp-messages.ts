/**
 * Ready-to-send WhatsApp messages for the recovery flows.
 *
 * WhatsApp is not email with a smaller layout. It is a personal channel on the
 * customer's own phone, read in a second, and a message that arrives looking
 * like a newsletter gets ignored or reported. So: Arabic, short lines, one
 * idea per line, the number said out loud, and exactly one thing to tap.
 *
 * The email is the formal record — the itemised receipt with images. This is
 * the nudge. They should never read like the same message twice.
 */

import { siteUrl } from "@/lib/site";

const money = (amount: number) =>
  `${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} ج.م`;

function firstName(fullName: string | null | undefined): string {
  return String(fullName || "").trim().split(/\s+/)[0] || "";
}

/** Up to three product names — enough to be recognised, short enough to scan. */
function nameList(names: (string | null | undefined)[]): string {
  const clean = names.filter(Boolean).slice(0, 3) as string[];
  if (!clean.length) return "";
  return clean.join("، ");
}

export type WhatsAppMessage = { text: string; url: string };

function link(phone: string | null | undefined, text: string): WhatsAppMessage {
  const digits = String(phone || "").replace(/\D/g, "");
  return { text, url: `https://wa.me/${digits}?text=${encodeURIComponent(text)}` };
}

/**
 * An order that reached the payment page and stopped.
 *
 * The amount and the payment link do the work — this person already decided;
 * they just didn't finish. Anything longer is friction.
 */
export function buildOrderWhatsAppMessage(input: {
  customerName?: string | null;
  phone?: string | null;
  orderNumber: string;
  total: number;
  productNames?: (string | null | undefined)[];
  payUrl: string;
  discountPercent?: number;
  previousTotal?: number;
}): WhatsAppMessage {
  const name = firstName(input.customerName);
  const products = nameList(input.productNames || []);
  const hasDiscount = Boolean(input.discountPercent && input.previousTotal);

  const lines = [
    name ? `أهلاً ${name} 👋` : "أهلاً 👋",
    "",
    `طلبك رقم ${input.orderNumber} لسه محجوز عندنا${products ? ` — ${products}` : ""}.`,
  ];

  if (hasDiscount) {
    lines.push(
      "",
      `عشان تكمّله، نزّلنالك ${input.discountPercent}٪ على الطلب:`,
      `~${money(input.previousTotal as number)}~  ←  *${money(input.total)}*`,
      "الخصم متطبّق على الطلب خلاص، مش محتاج تكتب أي كود."
    );
  } else {
    lines.push("", `الإجمالي: *${money(input.total)}*`);
  }

  lines.push(
    "",
    "تقدر تكمّل الدفع من هنا 👇",
    input.payUrl,
    "",
    "وأي سؤال إحنا معاك."
  );

  return link(input.phone, lines.join("\n"));
}

/**
 * A cart that never became an order.
 *
 * Nothing is reserved and no price is promised, so the message says only what
 * is true. The link goes to the cart — on WhatsApp they are almost always on
 * the same phone that built it.
 */
export function buildCartWhatsAppMessage(input: {
  customerName?: string | null;
  phone?: string | null;
  subtotal?: number | null;
  productNames?: (string | null | undefined)[];
  cartUrl?: string;
  discountPercent?: number;
  promoCode?: string | null;
  minOrder?: number;
}): WhatsAppMessage {
  const name = firstName(input.customerName);
  const products = nameList(input.productNames || []);
  const url = input.cartUrl || `${siteUrl}/cart`;

  const lines = [
    name ? `أهلاً ${name} 👋` : "أهلاً 👋",
    "",
    products
      ? `سلتك لسه محفوظة عندنا — ${products}.`
      : "سلتك لسه محفوظة عندنا.",
  ];

  if (input.subtotal) {
    lines.push(`الإجمالي: *${money(input.subtotal)}*`);
  }

  if (input.promoCode && input.discountPercent) {
    lines.push(
      "",
      `وعشان خاطرك، ده كود خصم *${input.discountPercent}٪*:`,
      `*${input.promoCode}*`,
      input.minOrder
        ? `اكتبه عند الدفع — صالح مرة واحدة على طلب من ${money(input.minOrder)} فأكتر.`
        : "اكتبه عند الدفع — صالح مرة واحدة."
    );
  }

  lines.push("", "تكمّل من هنا 👇", url, "", "وأي سؤال إحنا معاك.");

  return link(input.phone, lines.join("\n"));
}
