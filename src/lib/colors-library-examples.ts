/**
 * أمثلة على استخدام مكتبة الألوان
 * Examples of using the colors library
 */

import { 
  getAllColors, 
  searchColors, 
  getColorById,
  getColorByHex,
  getColorsByCategory,
  findClosestColor,
  hexToRgb
} from './colors-library';

// مثال 1: الحصول على جميع الألوان
export function example1_getAllColors() {
  const allColors = getAllColors();
  console.log(`Total colors: ${allColors.length}`);
  console.log('First 5 colors:', allColors.slice(0, 5));
}

// مثال 2: البحث بالعربي
export function example2_searchArabic() {
  const results = searchColors('أحمر');
  console.log('Search results for "أحمر":', results);
  // النتيجة: جميع الألوان التي تحتوي على كلمة "أحمر"
}

// مثال 3: البحث بالإنجليزي
export function example3_searchEnglish() {
  const results = searchColors('blue');
  console.log('Search results for "blue":', results);
  // النتيجة: جميع الألوان التي تحتوي على كلمة "blue"
}

// مثال 4: البحث بالكود السداسي
export function example4_searchByHex() {
  const results = searchColors('#FF0000');
  console.log('Search results for "#FF0000":', results);
}

// مثال 5: الحصول على لون بواسطة المعرف
export function example5_getById() {
  const color = getColorById('1');
  console.log('Color with ID 1:', color);
  // النتيجة: { id: '1', nameEn: 'Red', nameAr: 'أحمر', hex: '#FF0000', ... }
}

// مثال 6: الحصول على لون بواسطة الكود السداسي
export function example6_getByHex() {
  const color = getColorByHex('#0000FF');
  console.log('Color with hex #0000FF:', color);
  // النتيجة: { id: '2', nameEn: 'Blue', nameAr: 'أزرق', hex: '#0000FF', ... }
}

// مثال 7: الحصول على الألوان حسب الفئة
export function example7_getByCategory() {
  const redColors = getColorsByCategory('red');
  console.log('Red category colors:', redColors);
  
  const blueColors = getColorsByCategory('blue');
  console.log('Blue category colors:', blueColors);
}

// مثال 8: إيجاد أقرب لون
export function example8_findClosest() {
  // لنفترض أن لدينا لون مخصص
  const customColor = '#FF1234';
  const closestColor = findClosestColor(customColor);
  console.log(`Closest color to ${customColor}:`, closestColor);
}

// مثال 9: تحويل HEX إلى RGB
export function example9_hexToRgb() {
  const rgb = hexToRgb('#FF0000');
  console.log('RGB for #FF0000:', rgb);
  // النتيجة: { r: 255, g: 0, b: 0 }
}

// مثال 10: استخدام في مكون React
export function example10_reactComponent() {
  return `
import { searchColors } from '@/lib/colors-library';
import { useState, useEffect } from 'react';

function ColorPicker() {
  const [query, setQuery] = useState('');
  const [colors, setColors] = useState([]);

  useEffect(() => {
    const results = searchColors(query);
    setColors(results);
  }, [query]);

  return (
    <div>
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث عن لون..."
      />
      <div>
        {colors.map(color => (
          <div key={color.id}>
            <div style={{ backgroundColor: color.hex }} />
            <span>{color.nameAr} / {color.nameEn}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
  `;
}

// مثال 11: استخدام في API
export async function example11_apiUsage() {
  return `
// في ملف API route
import { searchColors, getColorById } from '@/lib/colors-library';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (query) {
    const results = searchColors(query);
    return Response.json(results);
  }
  
  const allColors = getAllColors();
  return Response.json(allColors);
}
  `;
}

// مثال 12: فلترة الألوان حسب معايير مخصصة
export function example12_customFilter() {
  const allColors = getAllColors();
  
  // الألوان الداكنة فقط (مثال بسيط)
  const darkColors = allColors.filter(color => {
    const rgb = hexToRgb(color.hex);
    if (!rgb) return false;
    const brightness = (rgb.r + rgb.g + rgb.b) / 3;
    return brightness < 128;
  });
  
  console.log('Dark colors:', darkColors);
}
