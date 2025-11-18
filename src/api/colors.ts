// /src/api/colors.ts
const API_BASE = "https://scrubstore.runasp.net";

export type ColorOption = {
  id: number;
  colorNameAr: string;
  colorNameEn: string;
  hexa: string;
};

type ApiResponse<T> = {
  succeeded: boolean;
  message: string | null;
  data: T;
};

/** يجلب الألوان المتاحة من API */
export async function getColors(): Promise<ColorOption[]> {
  const url = `${API_BASE}/api/Color`;
  const res = await fetch(url, { 
    headers: { accept: "*/*" }, 
    cache: "no-store" 
  });
  
  if (!res.ok) throw new Error(`Failed to load colors: ${res.status}`);
  
  const json: ApiResponse<ColorOption[]> = await res.json();
  
  if (!json?.succeeded || !json?.data) {
    throw new Error("Invalid colors response");
  }
  
  return json.data;
}
