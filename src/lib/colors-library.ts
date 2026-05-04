// مكتبة شاملة للألوان مع الأسماء بالعربي والإنجليزي
export interface ColorData {
  id: string;
  nameEn: string;
  nameAr: string;
  hex: string;
  rgb?: { r: number; g: number; b: number };
  category?: string;
}

// قاعدة بيانات الألوان الشاملة
export const COLORS_DATABASE: ColorData[] = [
  // الألوان الأساسية
  { id: '1', nameEn: 'Red', nameAr: 'أحمر', hex: '#FF0000', category: 'basic' },
  { id: '2', nameEn: 'Blue', nameAr: 'أزرق', hex: '#0000FF', category: 'basic' },
  { id: '3', nameEn: 'Green', nameAr: 'أخضر', hex: '#00FF00', category: 'basic' },
  { id: '4', nameEn: 'Yellow', nameAr: 'أصفر', hex: '#FFFF00', category: 'basic' },
  { id: '5', nameEn: 'Black', nameAr: 'أسود', hex: '#000000', category: 'basic' },
  { id: '6', nameEn: 'White', nameAr: 'أبيض', hex: '#FFFFFF', category: 'basic' },
  { id: '7', nameEn: 'Gray', nameAr: 'رمادي', hex: '#808080', category: 'basic' },
  { id: '8', nameEn: 'Orange', nameAr: 'برتقالي', hex: '#FFA500', category: 'basic' },
  { id: '9', nameEn: 'Purple', nameAr: 'بنفسجي', hex: '#800080', category: 'basic' },
  { id: '10', nameEn: 'Pink', nameAr: 'وردي', hex: '#FFC0CB', category: 'basic' },
  
  // درجات الأحمر
  { id: '11', nameEn: 'Dark Red', nameAr: 'أحمر داكن', hex: '#8B0000', category: 'red' },
  { id: '12', nameEn: 'Crimson', nameAr: 'قرمزي', hex: '#DC143C', category: 'red' },
  { id: '13', nameEn: 'Maroon', nameAr: 'عنابي', hex: '#800000', category: 'red' },
  { id: '14', nameEn: 'Burgundy', nameAr: 'خمري', hex: '#800020', category: 'red' },
  { id: '15', nameEn: 'Coral', nameAr: 'مرجاني', hex: '#FF7F50', category: 'red' },
  { id: '16', nameEn: 'Salmon', nameAr: 'سلموني', hex: '#FA8072', category: 'red' },
  { id: '17', nameEn: 'Tomato', nameAr: 'طماطمي', hex: '#FF6347', category: 'red' },
  
  // درجات الأزرق
  { id: '18', nameEn: 'Navy Blue', nameAr: 'أزرق كحلي', hex: '#000080', category: 'blue' },
  { id: '19', nameEn: 'Sky Blue', nameAr: 'أزرق سماوي', hex: '#87CEEB', category: 'blue' },
  { id: '20', nameEn: 'Royal Blue', nameAr: 'أزرق ملكي', hex: '#4169E1', category: 'blue' },
  { id: '21', nameEn: 'Turquoise', nameAr: 'تركواز', hex: '#40E0D0', category: 'blue' },
  { id: '22', nameEn: 'Cyan', nameAr: 'سماوي فاتح', hex: '#00FFFF', category: 'blue' },
  { id: '23', nameEn: 'Teal', nameAr: 'أزرق مخضر', hex: '#008080', category: 'blue' },
  { id: '24', nameEn: 'Indigo', nameAr: 'نيلي', hex: '#4B0082', category: 'blue' },
  
  // درجات الأخضر
  { id: '25', nameEn: 'Dark Green', nameAr: 'أخضر داكن', hex: '#006400', category: 'green' },
  { id: '26', nameEn: 'Lime', nameAr: 'ليموني', hex: '#00FF00', category: 'green' },
  { id: '27', nameEn: 'Olive', nameAr: 'زيتوني', hex: '#808000', category: 'green' },
  { id: '28', nameEn: 'Mint', nameAr: 'نعناعي', hex: '#98FF98', category: 'green' },
  { id: '29', nameEn: 'Emerald', nameAr: 'زمردي', hex: '#50C878', category: 'green' },
  { id: '30', nameEn: 'Forest Green', nameAr: 'أخضر غابات', hex: '#228B22', category: 'green' },
  
  // درجات الأصفر والبرتقالي
  { id: '31', nameEn: 'Gold', nameAr: 'ذهبي', hex: '#FFD700', category: 'yellow' },
  { id: '32', nameEn: 'Lemon', nameAr: 'ليموني', hex: '#FFF44F', category: 'yellow' },
  { id: '33', nameEn: 'Mustard', nameAr: 'خردلي', hex: '#FFDB58', category: 'yellow' },
  { id: '34', nameEn: 'Amber', nameAr: 'كهرماني', hex: '#FFBF00', category: 'yellow' },
  { id: '35', nameEn: 'Peach', nameAr: 'خوخي', hex: '#FFE5B4', category: 'orange' },
  { id: '36', nameEn: 'Apricot', nameAr: 'مشمشي', hex: '#FBCEB1', category: 'orange' },
  
  // درجات البنفسجي والوردي
  { id: '37', nameEn: 'Violet', nameAr: 'بنفسجي فاتح', hex: '#EE82EE', category: 'purple' },
  { id: '38', nameEn: 'Lavender', nameAr: 'لافندر', hex: '#E6E6FA', category: 'purple' },
  { id: '39', nameEn: 'Magenta', nameAr: 'أرجواني', hex: '#FF00FF', category: 'purple' },
  { id: '40', nameEn: 'Plum', nameAr: 'برقوقي', hex: '#DDA0DD', category: 'purple' },
  { id: '41', nameEn: 'Hot Pink', nameAr: 'وردي ساخن', hex: '#FF69B4', category: 'pink' },
  { id: '42', nameEn: 'Rose', nameAr: 'وردي', hex: '#FF007F', category: 'pink' },
  { id: '43', nameEn: 'Fuchsia', nameAr: 'فوشيا', hex: '#FF00FF', category: 'pink' },
  
  // درجات البني
  { id: '44', nameEn: 'Brown', nameAr: 'بني', hex: '#A52A2A', category: 'brown' },
  { id: '45', nameEn: 'Chocolate', nameAr: 'شوكولاتي', hex: '#D2691E', category: 'brown' },
  { id: '46', nameEn: 'Tan', nameAr: 'بني فاتح', hex: '#D2B48C', category: 'brown' },
  { id: '47', nameEn: 'Beige', nameAr: 'بيج', hex: '#F5F5DC', category: 'brown' },
  { id: '48', nameEn: 'Khaki', nameAr: 'كاكي', hex: '#F0E68C', category: 'brown' },
  { id: '49', nameEn: 'Coffee', nameAr: 'قهوي', hex: '#6F4E37', category: 'brown' },
  
  // درجات الرمادي
  { id: '50', nameEn: 'Light Gray', nameAr: 'رمادي فاتح', hex: '#D3D3D3', category: 'gray' },
  { id: '51', nameEn: 'Dark Gray', nameAr: 'رمادي داكن', hex: '#A9A9A9', category: 'gray' },
  { id: '52', nameEn: 'Silver', nameAr: 'فضي', hex: '#C0C0C0', category: 'gray' },
  { id: '53', nameEn: 'Charcoal', nameAr: 'فحمي', hex: '#36454F', category: 'gray' },
  { id: '54', nameEn: 'Slate Gray', nameAr: 'رمادي أردوازي', hex: '#708090', category: 'gray' },
  
  // ألوان إضافية
  { id: '55', nameEn: 'Cream', nameAr: 'كريمي', hex: '#FFFDD0', category: 'neutral' },
  { id: '56', nameEn: 'Ivory', nameAr: 'عاجي', hex: '#FFFFF0', category: 'neutral' },
  { id: '57', nameEn: 'Pearl', nameAr: 'لؤلؤي', hex: '#EAE0C8', category: 'neutral' },
  { id: '58', nameEn: 'Champagne', nameAr: 'شامبانيا', hex: '#F7E7CE', category: 'neutral' },
  { id: '59', nameEn: 'Copper', nameAr: 'نحاسي', hex: '#B87333', category: 'metallic' },
  { id: '60', nameEn: 'Bronze', nameAr: 'برونزي', hex: '#CD7F32', category: 'metallic' },
];

/**
 * البحث عن الألوان بالاسم (عربي أو إنجليزي) أو بالكود السداسي
 */
export function searchColors(query: string): ColorData[] {
  if (!query || query.trim() === '') {
    return COLORS_DATABASE;
  }

  const searchTerm = query.toLowerCase().trim();
  
  return COLORS_DATABASE.filter(color => {
    const matchesEnglish = color.nameEn.toLowerCase().includes(searchTerm);
    const matchesArabic = color.nameAr.includes(query.trim());
    const matchesHex = color.hex.toLowerCase().includes(searchTerm);
    
    return matchesEnglish || matchesArabic || matchesHex;
  });
}

/**
 * الحصول على لون بواسطة الكود السداسي
 */
export function getColorByHex(hex: string): ColorData | undefined {
  const normalizedHex = hex.toUpperCase().startsWith('#') ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
  return COLORS_DATABASE.find(color => color.hex.toUpperCase() === normalizedHex);
}

/**
 * الحصول على لون بواسطة المعرف
 */
export function getColorById(id: string): ColorData | undefined {
  return COLORS_DATABASE.find(color => color.id === id);
}

/**
 * الحصول على جميع الألوان
 */
export function getAllColors(): ColorData[] {
  return COLORS_DATABASE;
}

/**
 * الحصول على الألوان حسب الفئة
 */
export function getColorsByCategory(category: string): ColorData[] {
  return COLORS_DATABASE.filter(color => color.category === category);
}

/**
 * تحويل HEX إلى RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * إيجاد أقرب لون من المكتبة لكود سداسي معين
 */
export function findClosestColor(hex: string): ColorData | null {
  const targetRgb = hexToRgb(hex);
  if (!targetRgb) return null;

  let closestColor: ColorData | null = null;
  let minDistance = Infinity;

  COLORS_DATABASE.forEach(color => {
    const colorRgb = hexToRgb(color.hex);
    if (!colorRgb) return;

    const distance = Math.sqrt(
      Math.pow(targetRgb.r - colorRgb.r, 2) +
      Math.pow(targetRgb.g - colorRgb.g, 2) +
      Math.pow(targetRgb.b - colorRgb.b, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  });

  return closestColor;
}
