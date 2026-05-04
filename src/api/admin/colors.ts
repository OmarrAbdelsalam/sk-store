// Admin Colors API using comprehensive colors library
import { 
  getAllColors, 
  searchColors, 
  getColorById as getColorFromLibrary,
  getColorByHex,
  findClosestColor,
  type ColorData 
} from '@/lib/colors-library';

export interface Color {
  id: string;
  colorNameAr: string;
  colorNameEn: string;
  hexa: string;
  // Aliases for compatibility with different naming conventions
  hex_code?: string;
  name_ar?: string;
  name_en?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
}

// تحويل ColorData من المكتبة إلى Color للتوافق
function convertToColor(colorData: ColorData): Color {
  return {
    id: colorData.id,
    colorNameAr: colorData.nameAr,
    colorNameEn: colorData.nameEn,
    hexa: colorData.hex,
    hex_code: colorData.hex,
    name_ar: colorData.nameAr,
    name_en: colorData.nameEn,
    category: colorData.category,
    isActive: true,
  };
}

/**
 * الحصول على جميع الألوان
 */
export const getColors = async (): Promise<Color[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  const allColors = getAllColors();
  return allColors.map(convertToColor);
};

/**
 * البحث عن الألوان (عربي أو إنجليزي أو hex)
 */
export const searchColorsAPI = async (query: string): Promise<Color[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const results = searchColors(query);
  return results.map(convertToColor);
};

/**
 * الحصول على لون بواسطة المعرف
 */
export const getColorById = async (id: string): Promise<Color | null> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const color = getColorFromLibrary(id);
  return color ? convertToColor(color) : null;
};

/**
 * الحصول على لون بواسطة الكود السداسي
 */
export const getColorByHexCode = async (hex: string): Promise<Color | null> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const color = getColorByHex(hex);
  return color ? convertToColor(color) : null;
};

/**
 * إيجاد أقرب لون لكود سداسي معين
 */
export const findClosestColorAPI = async (hex: string): Promise<Color | null> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const color = findClosestColor(hex);
  return color ? convertToColor(color) : null;
};

// Note: Create, Update, Delete operations are not supported with the static library
// If you need these operations, consider using a state management solution or local storage

export const createColor = async (colorData: Omit<Color, 'id'>): Promise<Color> => {
  throw new Error('Create operation is not supported with static colors library. All colors are predefined.');
};

export const updateColor = async (id: string, colorData: Partial<Color>): Promise<Color | null> => {
  throw new Error('Update operation is not supported with static colors library. All colors are predefined.');
};

export const deleteColor = async (id: string): Promise<boolean> => {
  throw new Error('Delete operation is not supported with static colors library. All colors are predefined.');
};