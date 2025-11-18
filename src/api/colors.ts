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

let _colorsCache: ColorOption[] | null = null;

/** يجلب الألوان المتاحة من API */
export async function getColors(): Promise<ColorOption[]> {
  if (_colorsCache) return _colorsCache;
  
  const url = `${API_BASE}/api/Color`;
  const res = await fetch(url, { 
    headers: { accept: "*/*" }, 
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  
  if (!res.ok) throw new Error(`Failed to load colors: ${res.status}`);
  
  const json: ApiResponse<ColorOption[]> = await res.json();
  
  if (!json?.succeeded || !json?.data) {
    throw new Error("Invalid colors response");
  }
  
  _colorsCache = json.data;
  return _colorsCache;
}
