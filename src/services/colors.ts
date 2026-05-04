// استخدام مكتبة الألوان الشاملة بدلاً من قاعدة البيانات
import { 
  getAllColors, 
  searchColors, 
  getColorById as getColorFromLibrary,
  getColorByHex,
  type ColorData 
} from "@/lib/colors-library";

export type Color = {
  id: string;
  name_en: string;
  name_ar: string;
  hex_code: string;
  created_at?: string;
};

export type ColorInput = {
  name_en: string;
  hex_code: string;
};

// تحويل ColorData من المكتبة إلى Color
function convertToColor(colorData: ColorData): Color {
  return {
    id: colorData.id,
    name_en: colorData.nameEn,
    name_ar: colorData.nameAr,
    hex_code: colorData.hex,
  };
}

export const colorService = {
  /**
   * الحصول على جميع الألوان من المكتبة
   */
  async getAll() {
    const colors = getAllColors();
    return colors.map(convertToColor);
  },

  /**
   * البحث عن الألوان (عربي أو إنجليزي)
   */
  async search(query: string) {
    const results = searchColors(query);
    return results.map(convertToColor);
  },

  /**
   * الحصول على لون بواسطة المعرف
   */
  async getById(id: string) {
    const color = getColorFromLibrary(id);
    return color ? convertToColor(color) : null;
  },

  /**
   * الحصول على لون بواسطة الكود السداسي
   */
  async getByHex(hex: string) {
    const color = getColorByHex(hex);
    return color ? convertToColor(color) : null;
  },

  // ملاحظة: العمليات التالية غير مدعومة مع المكتبة الثابتة
  async create(input: ColorInput) {
    throw new Error('Create operation is not supported with static colors library');
  },

  async update(id: string, input: Partial<ColorInput>) {
    throw new Error('Update operation is not supported with static colors library');
  },

  async delete(id: string) {
    throw new Error('Delete operation is not supported with static colors library');
  }
};
