# مكتبة الألوان الشاملة

## نظرة عامة
مكتبة شاملة تحتوي على 60+ لون مع الأسماء بالعربي والإنجليزي، بدون الحاجة لقاعدة بيانات.

## المميزات
- ✅ 60+ لون محدد مسبقاً
- ✅ أسماء بالعربي والإنجليزي
- ✅ البحث بالعربي أو الإنجليزي أو الكود السداسي
- ✅ تصنيف الألوان حسب الفئات
- ✅ إيجاد أقرب لون لكود سداسي معين
- ✅ تحويل HEX إلى RGB

## الاستخدام

### استيراد المكتبة
```typescript
import { 
  getAllColors, 
  searchColors, 
  getColorById,
  getColorByHex,
  findClosestColor,
  type ColorData 
} from '@/lib/colors-library';
```

### الحصول على جميع الألوان
```typescript
const colors = getAllColors();
// يرجع: ColorData[]
```

### البحث عن الألوان
```typescript
// البحث بالعربي
const results = searchColors('أحمر');

// البحث بالإنجليزي
const results = searchColors('red');

// البحث بالكود السداسي
const results = searchColors('#FF0000');
```

### الحصول على لون بواسطة المعرف
```typescript
const color = getColorById('1');
// يرجع: ColorData | undefined
```

### الحصول على لون بواسطة الكود السداسي
```typescript
const color = getColorByHex('#FF0000');
// يرجع: ColorData | undefined
```

### إيجاد أقرب لون
```typescript
const closestColor = findClosestColor('#FF1234');
// يرجع أقرب لون من المكتبة
```

## هيكل البيانات

```typescript
interface ColorData {
  id: string;           // معرف فريد
  nameEn: string;       // الاسم بالإنجليزي
  nameAr: string;       // الاسم بالعربي
  hex: string;          // الكود السداسي
  category?: string;    // الفئة (basic, red, blue, etc.)
}
```

## الفئات المتاحة
- `basic` - الألوان الأساسية
- `red` - درجات الأحمر
- `blue` - درجات الأزرق
- `green` - درجات الأخضر
- `yellow` - درجات الأصفر
- `orange` - درجات البرتقالي
- `purple` - درجات البنفسجي
- `pink` - درجات الوردي
- `brown` - درجات البني
- `gray` - درجات الرمادي
- `neutral` - ألوان محايدة
- `metallic` - ألوان معدنية

## أمثلة الألوان المتاحة

### الألوان الأساسية
- أحمر / Red - #FF0000
- أزرق / Blue - #0000FF
- أخضر / Green - #00FF00
- أصفر / Yellow - #FFFF00
- أسود / Black - #000000
- أبيض / White - #FFFFFF

### درجات الأحمر
- قرمزي / Crimson - #DC143C
- عنابي / Maroon - #800000
- خمري / Burgundy - #800020
- مرجاني / Coral - #FF7F50

### درجات الأزرق
- أزرق كحلي / Navy Blue - #000080
- أزرق سماوي / Sky Blue - #87CEEB
- أزرق ملكي / Royal Blue - #4169E1
- تركواز / Turquoise - #40E0D0

### ألوان إضافية
- ذهبي / Gold - #FFD700
- فضي / Silver - #C0C0C0
- نحاسي / Copper - #B87333
- برونزي / Bronze - #CD7F32

## ملاحظات
- جميع الألوان محددة مسبقاً ولا يمكن إضافة أو تعديل أو حذف ألوان
- إذا كنت بحاجة لإضافة ألوان جديدة، قم بتعديل ملف `colors-library.ts`
- البحث يدعم العربي والإنجليزي والكود السداسي
- إذا لم يتم العثور على ترجمة عربية، يتم استخدام الاسم الإنجليزي فقط
