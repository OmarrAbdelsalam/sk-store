// /lib/api/cart.ts
const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://scrubstore.runasp.net";

/** اختياري: تأكيد/تهيئة الجلسة في السيرفر (200 OK بدون body) */
export async function ensureCartSession(sessionId: string) {
  const url = new URL(`${BASE}/api/Cart/SessionId`);
  url.searchParams.set("SessionId", sessionId);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /Cart/SessionId ${res.status}`);
  return true;
}

/** إضافة منتج للسلة */
export async function addToCart(params: {
  sessionId: string;
  productId: number;
  colorId?: number; // 0 لو مش موجود
  sizeId?: number;  // 0 لو مش موجود
  quantity: number;
}) {
  const res = await fetch(`${BASE}/api/Cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      sessionId: params.sessionId,
      productId: params.productId,
      colorId: params.colorId ?? 0,
      sizeId: params.sizeId ?? 0,
      quantity: params.quantity,
    }),
  });
  if (!res.ok) throw new Error(`POST /api/Cart ${res.status}`);
  return true; // 200 بدون body
}

/** تعديل كمية عنصر داخل السلة */
export async function updateItemQuantity(params: {
  sessionId: string;
  itemId: number;
  quantity: number;
}) {
  const url = new URL(`${BASE}/api/Cart/Items/Quantity`);
  url.searchParams.set("SessionId", params.sessionId);
  url.searchParams.set("itemId", String(params.itemId));
  url.searchParams.set("Quantity", String(params.quantity));

  const res = await fetch(url.toString(), { 
    method: "PUT", 
    cache: "no-store",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`PUT /Cart/Items/Quantity ${res.status}: ${errorText}`);
  }
  return true;
}

/** حذف عنصر واحد */
export async function deleteItem(params: { sessionId: string; itemId: number }) {
  const res = await fetch(`${BASE}/api/Cart/Item/${params.itemId}/${params.sessionId}`, {
    method: "DELETE",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`DELETE /Cart/Item ${res.status}`);
  return true;
}

/** تفريغ السلة بالكامل */
export async function clearCart(sessionId: string) {
  const res = await fetch(`${BASE}/api/Cart/Cart/${sessionId}`, {
    method: "DELETE",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`DELETE /Cart/Cart ${res.status}`);
  return true;
}

/** قراءة عدد العناصر (يرجّع رقم سواء Text أو JSON) */
export async function getItemsNumber(sessionId: string): Promise<number> {
  const url = new URL(`${BASE}/api/Cart/Items/Number`);
  url.searchParams.set("SessionId", sessionId);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /Cart/Items/Number ${res.status}`);

  // السيرفر ممكن يرجع "12" كنص أو { "value": 12 } أو 12 كـ JSON
  const text = await res.text();
  // جرّب تحويله لرقم مباشرة
  const asNum = Number(text);
  if (!Number.isNaN(asNum)) return asNum;

  // fallback: حاول JSON
  try {
    const json = JSON.parse(text);
    if (typeof json === "number") return json;
    if (typeof json?.value === "number") return json.value;
  } catch {}
  throw new Error("Unexpected response for /Items/Number");
}

/** قراءة إجمالي السعر (نفس فكرة التنسيق) */
export async function getItemsPrice(sessionId: string): Promise<number> {
  const url = new URL(`${BASE}/api/Cart/Items/Price`);
  url.searchParams.set("SessionId", sessionId);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /Cart/Items/Price ${res.status}`);

  const text = await res.text();
  const asNum = Number(text);
  if (!Number.isNaN(asNum)) return asNum;

  try {
    const json = JSON.parse(text);
    if (typeof json === "number") return json;
    if (typeof json?.value === "number") return json.value;
  } catch {}
  throw new Error("Unexpected response for /Items/Price");
}

/** تطبيق كوبون خصم */
export async function applyDiscount(params: { sessionId: string; code: string }) {
  const url = new URL(`${BASE}/api/Cart/Discount`);
  url.searchParams.set("sessionid", params.sessionId);
  url.searchParams.set("discountcode", params.code);

  const res = await fetch(url.toString(), { method: "POST", cache: "no-store" });
  if (!res.ok) throw new Error(`POST /Cart/Discount ${res.status}`);
  return true;
}


