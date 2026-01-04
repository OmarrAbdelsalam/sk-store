// /lib/api/cart.ts
const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://scrubstore.runasp.net";

/** قراءة السلة كاملة من السيرفر */
export async function getCart(sessionId: string) {
  const url = new URL(`${BASE}/api/Cart/SessionId`);
  url.searchParams.set("SessionId", sessionId);
  const res = await fetch(url.toString(), { cache: "no-store" });
  
  if (!res.ok) {
    // If cart is empty or not found, return empty cart
    if (res.status === 400 || res.status === 404) {
      return { items: [], totalItems: 0, totalPrice: 0 };
    }
    throw new Error(`GET /Cart/SessionId ${res.status}`);
  }
  
  const response = await res.json();
  return response.data || { items: [], totalItems: 0, totalPrice: 0 }; // Returns cart with items array
}

/** إضافة منتج للسلة */
export async function addToCart(params: {
  sessionId: string;
  productId: number;
  colorId?: number; // 0 لو مش موجود
  sizeId?: number;  // 0 لو مش موجود
  quantity: number;
}) {
  const payload = {
    sessionId: params.sessionId,
    productId: params.productId,
    colorId: params.colorId ?? 0,
    sizeId: params.sizeId ?? 0,
    quantity: params.quantity,
  };
  
  console.log('POST /api/Cart payload:', payload);
  
  const res = await fetch(`${BASE}/api/Cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  
  console.log('POST /api/Cart response status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('POST /api/Cart error:', errorText);
    throw new Error(`POST /api/Cart ${res.status}: ${errorText}`);
  }
  
  return true; // 200 بدون body
}

/** تعديل كمية عنصر داخل السلة */
export async function updateItemQuantity(params: {
  sessionId: string;
  itemId: number;
  quantity: number;
}): Promise<{ success: boolean; stockError?: boolean; message?: string }> {
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
    try {
      const errorData = await res.json();
      // Check if it's a stock error
      if (errorData.message?.toLowerCase().includes('stock') || 
          errorData.message?.toLowerCase().includes('quantity')) {
        return { success: false, stockError: true, message: errorData.message };
      }
      return { success: false, message: errorData.message };
    } catch {
      return { success: false, message: `Error ${res.status}` };
    }
  }
  return { success: true };
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
  
  if (!res.ok) {
    // Try to get error message
    try {
      const errorData = await res.json();
      console.warn('Clear cart warning:', errorData.message || res.status);
      
      // If cart is already empty, it's not really an error
      if (res.status === 400 || errorData.message?.includes('empty') || errorData.message?.includes('not found')) {
        return true;
      }
    } catch {
      // If can't parse response, check status
      if (res.status === 400) {
        return true; // Cart already empty
      }
    }
    
    throw new Error(`DELETE /Cart/Cart ${res.status}`);
  }
  
  return true;
}

/** قراءة عدد العناصر (يرجّع رقم سواء Text أو JSON) */
export async function getItemsNumber(sessionId: string): Promise<number> {
  const url = new URL(`${BASE}/api/Cart/Items/Number`);
  url.searchParams.set("SessionId", sessionId);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /Cart/Items/Number ${res.status}`);

  // السيرفر ممكن يرجع "12" كنص أو { "value": 12 } أو 12 كـ JSON أو { "data": 12 }
  const text = await res.text();
  console.log('Cart Items Number API response:', text);
  
  // جرّب تحويله لرقم مباشرة
  const asNum = Number(text);
  if (!Number.isNaN(asNum)) return asNum;

  // fallback: حاول JSON
  try {
    const json = JSON.parse(text);
    if (typeof json === "number") return json;
    if (typeof json?.value === "number") return json.value;
    if (typeof json?.data === "number") return json.data; // Support { "data": 13 } format
  } catch {}
  
  // If all fails, return 0 instead of throwing
  console.warn('Unexpected response for /Items/Number, returning 0:', text);
  return 0;
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

/** حذف كوبون الخصم من السلة */
export async function deleteDiscount(sessionId: string) {
  const url = new URL(`${BASE}/api/Cart/Discount`);
  url.searchParams.set("sessionid", sessionId);

  const res = await fetch(url.toString(), { 
    method: "DELETE", 
    cache: "no-store" 
  });
  
  if (!res.ok) {
    throw new Error(`DELETE /Cart/Discount ${res.status}`);
  }
  
  return true;
}


