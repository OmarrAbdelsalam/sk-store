import { siteBrand, siteUrl, siteContact } from "@/lib/site";

export type EmailOrderItem = {
  product_name?: string | null;
  product_name_ar?: string | null;
  product_image?: string | null;
  color_name?: string | null;
  size_name?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

/** A discount granted with the follow-up, already applied to the order. */
export type RecoveryDiscount = {
  percent: number;
  amount: number;
  previousTotal: number;
};

export type EmailOrder = {
  order_number: string;
  customer_name?: string | null;
  government?: string | null;
  city?: string | null;
  detailed_address?: string | null;
  phone_number?: string | null;
  subtotal: number;
  shipping_cost: number;
  discount_amount?: number | null;
  total: number;
  payment_plan?: string | null;
  deposit_amount?: number | null;
  remaining_amount?: number | null;
  easykash_voucher?: string | null;
  easykash_provider?: string | null;
  easykash_payment_method?: string | null;
  items?: EmailOrderItem[];
};

// ── Palette ────────────────────────────────────────────────────────────────

const INK = "#14100C";
const GOLD = "#A8834E";
const MUTED = "#7A736B";
const LINE = "#E7E1D8";
const CANVAS = "#F4F1EC";
const SOFT = "#FAF8F5";
const GREEN = "#1B7F4B";

const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const WHATSAPP_URL = `https://wa.me/${siteContact.whatsapp}`;

// ── Helpers ────────────────────────────────────────────────────────────────

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function money(amount: number | null | undefined): string {
  const value = Number(amount || 0);
  return `EGP ${value.toLocaleString("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Mail clients have no notion of the site's base URL, so a stored path like
 * `/images/bag.jpg` renders as a broken image. Only absolute URLs survive.
 */
function absoluteUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${siteUrl}${path}`;
  return null;
}

function firstName(fullName: string | null | undefined): string {
  return String(fullName || "").trim().split(/\s+/)[0] || "";
}

// ── Layout ─────────────────────────────────────────────────────────────────

type Pill = { label: string; tone: "positive" | "pending" };

type LayoutInput = {
  preheader: string;
  pill: Pill;
  heading: string;
  intro: string;
  cta?: { label: string; url: string; note?: string };
  bodyHtml: string;
  footerNote?: string;
};

/**
 * Table-based layout with every style inlined. Outlook ignores <style> blocks,
 * flexbox and grid alike, so anything that has to survive there is expressed as
 * nested tables and presentational attributes.
 */
function layout({
  preheader,
  pill,
  heading,
  intro,
  cta,
  bodyHtml,
  footerNote,
}: LayoutInput): string {
  const pillColor = pill.tone === "positive" ? GREEN : GOLD;
  const pillBg = pill.tone === "positive" ? "#EAF5EE" : "#F6EFE4";

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;width:100%;background:${CANVAS};font-family:${SANS};-webkit-font-smoothing:antialiased;">
<!-- Inbox preview line: shown beside the subject, never inside the message. -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CANVAS};">
  <tr>
    <td align="center" style="padding:32px 12px;">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#FFFFFF;border:1px solid ${LINE};border-radius:16px;">

        <!-- Masthead -->
        <tr>
          <td align="center" style="padding:36px 32px 0 32px;">
            <!-- Wordmark as live text, not an image: every client blocks remote
                 images by default, and a masthead nobody sees until they click
                 "display images" is a masthead that isn't there. -->
            <a href="${siteUrl}" style="display:inline-block;text-decoration:none;font-family:${SERIF};font-size:34px;line-height:1.1;letter-spacing:0.08em;color:${INK};">${escapeHtml(siteBrand)}</a>
            <div style="margin-top:14px;font-family:${SANS};font-size:10px;letter-spacing:0.34em;text-transform:uppercase;color:${MUTED};">Handmade in Egypt</div>
          </td>
        </tr>

        <tr>
          <td style="padding:26px 32px 0 32px;">
            <div style="height:1px;background:${LINE};line-height:1px;font-size:0;">&nbsp;</div>
          </td>
        </tr>

        <!-- Headline -->
        <tr>
          <td style="padding:28px 32px 0 32px;">
            <span style="display:inline-block;background:${pillBg};color:${pillColor};font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;padding:7px 13px;border-radius:100px;">${escapeHtml(pill.label)}</span>
            <h1 style="margin:16px 0 0 0;font-family:${SERIF};font-size:29px;line-height:1.28;color:${INK};font-weight:400;">${escapeHtml(heading)}</h1>
            <p style="margin:12px 0 0 0;font-family:${SANS};font-size:15px;line-height:1.72;color:${MUTED};">${escapeHtml(intro)}</p>
          </td>
        </tr>

        ${
          cta
            ? `<!-- Primary action.
                 Sized to its own text and centred, not stretched to the card's
                 full width — a 536px-wide bar reads as a banner, and a banner is
                 something people look at rather than click.
                 The fill is declared twice, as a bgcolor attribute and as inline
                 CSS, because clients strip one or the other; the border repeats
                 it a third time so the shape still reads as a button even where
                 both are dropped and the label would otherwise sit bare on white. -->
        <tr>
          <td align="center" style="padding:28px 32px 0 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
              <tr>
                <td align="center" bgcolor="${INK}" style="background-color:${INK};border:1px solid ${INK};border-radius:100px;mso-padding-alt:17px 42px;">
                  <a href="${cta.url}" style="display:inline-block;padding:17px 42px;font-family:${SANS};font-size:16px;font-weight:700;letter-spacing:0.03em;color:#FFFFFF !important;text-decoration:none !important;border-radius:100px;mso-text-raise:2px;">${escapeHtml(cta.label)}&nbsp;&rarr;</a>
                </td>
              </tr>
            </table>
            ${
              cta.note
                ? `<p style="margin:12px 0 0 0;text-align:center;font-family:${SANS};font-size:12px;line-height:1.6;color:${MUTED};">${escapeHtml(cta.note)}</p>`
                : ""
            }
          </td>
        </tr>`
            : ""
        }

        <!-- Body -->
        <tr>
          <td style="padding:30px 32px 4px 32px;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:28px 32px 34px 32px;">
            <div style="height:1px;background:${LINE};line-height:1px;font-size:0;margin-bottom:22px;">&nbsp;</div>
            ${
              footerNote
                ? `<p style="margin:0 0 18px 0;font-family:${SANS};font-size:13px;line-height:1.7;color:${MUTED};">${escapeHtml(footerNote)}</p>`
                : ""
            }
            <!-- WhatsApp only. The From address is a send-only mailbox, so
                 offering a reply would route customers into a void. -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:${SANS};font-size:13px;line-height:1.7;color:${MUTED};padding-bottom:10px;">
                  <div style="color:${INK};font-weight:700;">Need a hand?</div>
                  <div>We're on WhatsApp, every day.</div>
                </td>
              </tr>
              <tr>
                <td bgcolor="#FFFFFF" style="border:1px solid ${LINE};border-radius:100px;">
                  <a href="${WHATSAPP_URL}" style="display:block;padding:11px 22px;font-family:${SANS};font-size:14px;font-weight:700;color:${INK};text-decoration:none;" dir="ltr">WhatsApp ${escapeHtml(siteContact.phoneInternational)}</a>
                </td>
              </tr>
            </table>
            <p style="margin:22px 0 0 0;font-family:${SANS};font-size:11px;line-height:1.7;color:#A79F95;">
              ${escapeHtml(siteBrand)} — premium handmade bags, delivered across Egypt.<br>
              This mailbox isn't monitored, so replies won't reach us — message us on WhatsApp instead.<br>
              You received this email because you placed an order at
              <a href="${siteUrl}" style="color:#A79F95;text-decoration:underline;">${escapeHtml(siteUrl.replace(/^https?:\/\//, ""))}</a>.
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
</body>
</html>`;
}

// ── Reusable blocks ────────────────────────────────────────────────────────

function eyebrow(text: string): string {
  return `<div style="font-family:${SANS};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};font-weight:700;">${escapeHtml(text)}</div>`;
}

function card(inner: string, background = SOFT): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;background:${background};border:1px solid ${LINE};border-radius:12px;">
    <tr><td style="padding:18px 20px;">${inner}</td></tr>
  </table>`;
}

/**
 * How long the customer waits. Stated in the email itself rather than left to
 * the order page, because the email is the thing they still have in a week when
 * they start wondering where the bag is.
 */
export const DELIVERY_WINDOW = "7–10 days";

/**
 * Nothing ships from a shelf here — each bag is cut and stitched for the order
 * that paid for it, which is the whole reason the wait is longer than the
 * next-day delivery people are used to. An unexplained ten-day gap reads as a
 * late order; the same ten days explained reads as the point.
 */
function deliveryBlock(): string {
  return card(
    `${eyebrow("Delivery")}
    <p style="margin:9px 0 0 0;font-family:${SANS};font-size:15px;line-height:1.65;color:${INK};font-weight:700;">Arrives within ${DELIVERY_WINDOW}.</p>
    <p style="margin:7px 0 0 0;font-family:${SANS};font-size:13px;line-height:1.7;color:${MUTED};">Your bag is made to order — cut and stitched by hand for you, not picked off a shelf. That is what the wait is for.</p>`
  );
}

function itemsBlock(order: EmailOrder): string {
  const items = order.items || [];
  if (!items.length) return "";

  const rows = items
    .map((item, index) => {
      const image = absoluteUrl(item.product_image);
      const variant = [item.color_name, item.size_name].filter(Boolean).join("  ·  ");
      const name = item.product_name || item.product_name_ar || "Item";

      return `
      <tr>
        <td style="padding:${index === 0 ? "0" : "14px"} 0 14px 0;${index === 0 ? "" : `border-top:1px solid ${LINE};`}">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              ${
                image
                  ? // Width only, height auto: object-fit is unsupported in
                    // most mail clients, so a fixed square would stretch every
                    // product shot that isn't already square.
                    `<td width="72" valign="top" style="padding-right:14px;">
                <img src="${escapeHtml(image)}" width="72" alt=""
                     style="display:block;border:1px solid ${LINE};border-radius:10px;width:72px;height:auto;background:${CANVAS};">
              </td>`
                  : ""
              }
              <td valign="top" style="font-family:${SANS};">
                <div style="font-family:${SERIF};font-size:16px;line-height:1.4;color:${INK};">${escapeHtml(name)}</div>
                ${variant ? `<div style="font-size:12px;color:${MUTED};margin-top:5px;">${escapeHtml(variant)}</div>` : ""}
                <div style="font-size:12px;color:${MUTED};margin-top:5px;">Qty ${item.quantity} &times; ${escapeHtml(money(item.unit_price))}</div>
              </td>
              <td valign="top" align="right" style="font-family:${SANS};font-size:15px;font-weight:700;color:${INK};white-space:nowrap;padding-left:10px;">
                ${escapeHtml(money(item.total_price))}
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">${rows}</table>`;
}

function totalsBlock(order: EmailOrder, extraDiscount?: RecoveryDiscount): string {
  const discount = Number(order.discount_amount || 0);

  const row = (label: string, value: string, accent = false) => `
    <tr>
      <td align="left" style="padding:5px 0;font-family:${SANS};font-size:14px;color:${accent ? GOLD : MUTED};${accent ? "font-weight:700;" : ""}">${escapeHtml(label)}</td>
      <td align="right" style="padding:5px 0;font-family:${SANS};font-size:14px;color:${accent ? GOLD : INK};font-weight:${accent ? "800" : "600"};white-space:nowrap;">${escapeHtml(value)}</td>
    </tr>`;

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;border-top:1px solid ${LINE};padding-top:6px;">
    ${row("Subtotal", money(order.subtotal))}
    ${row("Shipping", money(order.shipping_cost))}
    ${discount > 0 ? row("Discount", `- ${money(discount)}`) : ""}
    ${
      extraDiscount
        ? row(
            `${extraDiscount.percent}% welcome-back discount`,
            `- ${money(extraDiscount.amount)}`,
            true
          )
        : ""
    }
    <tr>
      <td align="left" style="padding:12px 0 0 0;border-top:1px solid ${LINE};font-family:${SERIF};font-size:17px;color:${INK};">Total</td>
      <td align="right" style="padding:12px 0 0 0;border-top:1px solid ${LINE};font-family:${SANS};font-size:18px;font-weight:800;color:${INK};white-space:nowrap;">${escapeHtml(money(order.total))}</td>
    </tr>
  </table>`;
}

function addressBlock(order: EmailOrder): string {
  const parts = [order.detailed_address, order.city, order.government].filter(Boolean);
  if (!parts.length) return "";

  return card(`
    ${eyebrow("Delivery address")}
    <div style="margin-top:8px;font-family:${SANS};font-size:14px;line-height:1.7;color:${INK};">${escapeHtml(parts.join(", "))}</div>
    ${
      order.phone_number
        ? `<div style="margin-top:6px;font-family:${SANS};font-size:13px;color:${MUTED};" dir="ltr">${escapeHtml(order.phone_number)}</div>`
        : ""
    }
  `);
}

function orderHeader(order: EmailOrder): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="left">${eyebrow("Order")}</td>
      <td align="right" style="font-family:${SANS};font-size:13px;font-weight:700;letter-spacing:0.04em;color:${INK};">${escapeHtml(order.order_number)}</td>
    </tr>
  </table>`;
}

// ── 1. Order confirmation (payment verified) ───────────────────────────────

export function orderConfirmationEmail(
  order: EmailOrder,
  trackUrl: string
): { subject: string; html: string; text: string } {
  const name = firstName(order.customer_name);

  // A deposit order is only half settled, and even a full one leaves shipping
  // for the courier. Saying "paid" without naming what is still owed is how a
  // customer ends up surprised at the door.
  const remaining = Number(order.remaining_amount || 0);
  // deposit_amount holds what was charged online under either plan; the
  // subtraction is a fallback for rows written before that was stored.
  const paidOnline = Number.isFinite(Number(order.deposit_amount))
    ? Number(order.deposit_amount)
    : Number(order.total) - remaining;

  const paymentCard = card(
    `
    ${eyebrow("Payment")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
      <tr>
        <td align="left" style="font-family:${SANS};font-size:14px;color:${MUTED};padding:4px 0;">Paid online</td>
        <td align="right" style="font-family:${SANS};font-size:15px;font-weight:700;color:${GREEN};padding:4px 0;white-space:nowrap;">${escapeHtml(money(paidOnline))}</td>
      </tr>
      ${
        remaining > 0
          ? `<tr>
        <td align="left" style="font-family:${SANS};font-size:14px;color:${MUTED};padding:4px 0;">Due on delivery</td>
        <td align="right" style="font-family:${SANS};font-size:15px;font-weight:700;color:${INK};padding:4px 0;white-space:nowrap;">${escapeHtml(money(remaining))}</td>
      </tr>`
          : ""
      }
    </table>
    ${
      remaining > 0
        ? `<p style="margin:12px 0 0 0;font-family:${SANS};font-size:12px;line-height:1.65;color:${MUTED};">Please have this amount ready in cash for the courier.</p>`
        : ""
    }
  `,
    "#FFFFFF"
  );

  const bodyHtml = `
    ${orderHeader(order)}
    ${itemsBlock(order)}
    ${totalsBlock(order)}
    ${paymentCard}
    ${deliveryBlock()}
    ${addressBlock(order)}
  `;

  const html = layout({
    preheader: `Payment received — order ${order.order_number} arrives within ${DELIVERY_WINDOW}.`,
    pill: { label: "Payment confirmed", tone: "positive" },
    heading: name ? `Thank you, ${name}.` : "Thank you for your order.",
    intro:
      `We've received your payment and started making your order by hand. Because every bag is made to order, it reaches you within ${DELIVERY_WINDOW} — we'll email you the moment it ships.`,
    cta: { label: "View your order", url: trackUrl },
    bodyHtml,
    footerNote:
      "Need to change the address, or anything else? Send us a WhatsApp message with your order number and we'll sort it.",
  });

  const text = [
    `Thank you${name ? `, ${name}` : ""}.`,
    `Your order ${order.order_number} is confirmed. Total ${money(order.total)}.`,
    remaining > 0 ? `Paid online: ${money(paidOnline)}. Due on delivery: ${money(remaining)}.` : "",
    `Arrives within ${DELIVERY_WINDOW} — every bag is made to order and stitched by hand for you.`,
    `View your order: ${trackUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Order ${order.order_number} confirmed — ${siteBrand}`,
    html,
    text,
  };
}

// ── 2. Complete your order (still unpaid after 15 minutes) ─────────────────

export function orderRecoveryEmail(
  order: EmailOrder,
  payUrl: string,
  discount?: RecoveryDiscount
): { subject: string; html: string; text: string } {
  const name = firstName(order.customer_name);

  // The discount is the reason this email gets opened, so it sits above
  // everything else — old price struck through, new price beside it.
  const discountBanner = discount
    ? `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;background:#FBF6EE;border:1px solid #E7D6BC;border-radius:12px;">
    <tr>
      <td align="center" style="padding:20px;">
        <div style="font-family:${SANS};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${GOLD};font-weight:700;">${discount.percent}% off, just for you</div>
        <div style="margin-top:10px;font-family:${SANS};font-size:15px;color:${MUTED};" dir="ltr">
          <span style="text-decoration:line-through;">${escapeHtml(money(discount.previousTotal))}</span>
          <span style="color:${MUTED};">&nbsp;&rarr;&nbsp;</span>
          <span style="font-family:${SERIF};font-size:26px;color:${INK};font-weight:700;">${escapeHtml(money(order.total))}</span>
        </div>
        <div style="margin-top:10px;font-family:${SANS};font-size:12px;line-height:1.6;color:${MUTED};">Already applied to this order — nothing to type in.</div>
      </td>
    </tr>
  </table>`
    : "";

  const bodyHtml = `
    ${discountBanner}
    ${orderHeader(order)}
    ${itemsBlock(order)}
    ${totalsBlock(order, discount)}
    ${deliveryBlock()}
    ${addressBlock(order)}
  `;

  // ── Copy ─────────────────────────────────────────────────────────────────
  // Two situations, two sets of words. What earns the open is the same in
  // both: the thing they wanted is still theirs and finishing is one tap —
  // never "you forgot something", which reads as a scolding.
  //
  // When there's a discount, the offer leads. It goes in the subject line as
  // an action plus a reward ("finish … and take 5% off") rather than a bare
  // percentage, because the subject has to say what to do, not just what's on
  // offer — and the saving in real pounds follows in the preview line, since
  // "5%" means nothing until it's money.
  const thing = (order.items?.length || 0) > 1 ? "your order" : "your bag";
  const greet = name ? `${name}, ` : "";

  const copy = discount
    ? {
        subject: `Finish your order and take ${discount.percent}% off`,
        preheader: `${money(order.total)} instead of ${money(discount.previousTotal)} — one tap, nothing to type in.`,
        pill: `${discount.percent}% off applied`,
        heading: `${greet}we kept ${thing} — and took ${discount.percent}% off.`,
        intro: `It hasn't gone anywhere. The ${discount.percent}% is already on the order, so there's no code to enter and nothing to remember — just finish when you're ready.`,
      }
    : {
        subject: `${thing.charAt(0).toUpperCase()}${thing.slice(1)} is still waiting for you`,
        preheader: `Order ${order.order_number} is reserved — one tap to finish.`,
        pill: "Reserved for you",
        heading: `${greet}we kept ${thing} for you.`,
        intro:
          "The payment didn't come through, so nothing has shipped — but we've held it aside. One tap and it goes into the workshop.",
      };

  const html = layout({
    preheader: copy.preheader,
    pill: { label: copy.pill, tone: "pending" },
    heading: copy.heading,
    intro: copy.intro,
    cta: {
      // The amount on the button is doing work: it answers "how much?" before
      // the click, which is the question that stops people.
      label: discount
        ? `Pay ${money(order.total)} now`
        : `Pay ${money(order.total)} and finish`,
      url: payUrl,
      note: "Secure payment page for this order only. Card, wallet, Fawry or Aman.",
    },
    bodyHtml,
    footerNote:
      "Already paid, or changed your mind? Nothing to do — this is the only reminder we send.",
  });

  const text = [
    copy.heading,
    copy.intro,
    "",
    discount
      ? `${discount.percent}% off: ${money(discount.previousTotal)} → ${money(order.total)}.`
      : "",
    `Order ${order.order_number} — ${money(order.total)}.`,
    `Made to order and stitched by hand, so it arrives within ${DELIVERY_WINDOW} once payment goes through.`,
    `Finish your payment: ${payUrl}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { subject: copy.subject, html, text };
}

// ── 3. Cart reminder (no order was ever placed) ────────────────────────────

/** A cart snapshot as stored by /api/track/cart — not an order. */
export type EmailCartItem = {
  productId?: string;
  name?: string;
  color?: string;
  quantity?: number;
  price?: number;
  image?: string;
};

export type EmailCart = {
  customer_name?: string | null;
  items?: EmailCartItem[];
  subtotal?: number | null;
};

/** A single-use code minted for one cart, since there is no order to discount. */
export type CartDiscount = {
  percent: number;
  code: string;
  expiresInDays: number;
  /** The basket the code was offered for — stated so it can't surprise anyone. */
  minOrder?: number;
};

function cartItemsBlock(items: EmailCartItem[]): string {
  if (!items.length) return "";

  const rows = items
    .map((item, index) => {
      const image = absoluteUrl(item.image);
      const quantity = Number(item.quantity) || 1;
      const price = Number(item.price) || 0;

      return `
      <tr>
        <td style="padding:${index === 0 ? "0" : "14px"} 0 14px 0;${index === 0 ? "" : `border-top:1px solid ${LINE};`}">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              ${
                image
                  ? `<td width="72" valign="top" style="padding-right:14px;">
                <img src="${escapeHtml(image)}" width="72" alt=""
                     style="display:block;border:1px solid ${LINE};border-radius:10px;width:72px;height:auto;background:${CANVAS};">
              </td>`
                  : ""
              }
              <td valign="top" style="font-family:${SANS};">
                <div style="font-family:${SERIF};font-size:16px;line-height:1.4;color:${INK};">${escapeHtml(item.name || "Item")}</div>
                ${item.color ? `<div style="font-size:12px;color:${MUTED};margin-top:5px;">${escapeHtml(item.color)}</div>` : ""}
                <div style="font-size:12px;color:${MUTED};margin-top:5px;">Qty ${quantity} &times; ${escapeHtml(money(price))}</div>
              </td>
              <td valign="top" align="right" style="font-family:${SANS};font-size:15px;font-weight:700;color:${INK};white-space:nowrap;padding-left:10px;">
                ${escapeHtml(money(price * quantity))}
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">${rows}</table>`;
}

/**
 * The reminder for someone who filled a cart and left before ordering.
 *
 * Nothing is reserved and no price is fixed — saying otherwise would be a lie
 * the checkout then contradicts. So the copy promises only what is true: the
 * cart is still here, and here is a code if they want one.
 */
export function cartRecoveryEmail(
  cart: EmailCart,
  cartUrl: string,
  discount?: CartDiscount
): { subject: string; html: string; text: string } {
  const name = firstName(cart.customer_name);
  const items = cart.items || [];
  const thing = items.length > 1 ? "your picks" : "it";
  const greet = name ? `${name}, ` : "";
  const subtotal = Number(cart.subtotal || 0);

  const codeCard = discount
    ? `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;background:#FBF6EE;border:1px solid #E7D6BC;border-radius:12px;">
    <tr>
      <td align="center" style="padding:22px 20px;">
        <div style="font-family:${SANS};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${GOLD};font-weight:700;">${discount.percent}% off, yours alone</div>
        <div style="margin-top:12px;font-family:${SANS};font-size:26px;font-weight:800;letter-spacing:0.12em;color:${INK};" dir="ltr">${escapeHtml(discount.code)}</div>
        <div style="margin-top:10px;font-family:${SANS};font-size:12px;line-height:1.6;color:${MUTED};">
          Enter it at checkout. Works once, and only for you — good for ${discount.expiresInDays} days.
          ${
            discount.minOrder
              ? `<br>Applies to orders of ${escapeHtml(money(discount.minOrder))} or more.`
              : ""
          }
        </div>
      </td>
    </tr>
  </table>`
    : "";

  const totalRow = subtotal
    ? `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;border-top:1px solid ${LINE};padding-top:10px;">
    <tr>
      <td align="left" style="font-family:${SERIF};font-size:16px;color:${INK};padding-top:8px;">Cart total</td>
      <td align="right" style="font-family:${SANS};font-size:17px;font-weight:800;color:${INK};white-space:nowrap;padding-top:8px;">${escapeHtml(money(subtotal))}</td>
    </tr>
  </table>
  <p style="margin:10px 0 0 0;font-family:${SANS};font-size:11px;line-height:1.6;color:#A79F95;">
    Before shipping${discount ? " and before your code" : ""}. Final prices are confirmed at checkout.
  </p>`
    : "";

  const copy = discount
    ? {
        subject: `Still thinking it over? Here's ${discount.percent}% off`,
        preheader: `Your cart is where you left it — code ${discount.code} inside.`,
        pill: `${discount.percent}% off inside`,
        heading: `${greet}your cart is still here.`,
        intro: `We kept ${thing} exactly as you left ${items.length > 1 ? "them" : "it"}. Here's ${discount.percent}% off if it helps you decide — no pressure either way.`,
      }
    : {
        subject: "Your cart is still where you left it",
        preheader: "Everything you picked is still saved — pick up where you stopped.",
        pill: "Cart saved",
        heading: `${greet}your cart is still here.`,
        intro: `We kept ${thing} exactly as you left ${items.length > 1 ? "them" : "it"}. Pick up whenever you're ready.`,
      };

  const html = layout({
    preheader: copy.preheader,
    pill: { label: copy.pill, tone: "pending" },
    heading: copy.heading,
    intro: copy.intro,
    cta: { label: "Back to your cart", url: cartUrl },
    bodyHtml: `
      ${codeCard}
      ${eyebrow("In your cart")}
      ${cartItemsBlock(items)}
      ${totalRow}
    `,
    footerNote:
      "Changed your mind? No need to do anything — this is the only reminder we send.",
  });

  const text = [
    copy.heading,
    copy.intro,
    "",
    discount ? `Your code: ${discount.code} (${discount.percent}% off, ${discount.expiresInDays} days)` : "",
    subtotal ? `Cart total: ${money(subtotal)}` : "",
    `Back to your cart: ${cartUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject: copy.subject, html, text };
}
