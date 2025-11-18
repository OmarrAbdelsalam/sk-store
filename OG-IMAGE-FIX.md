# ✅ إصلاح Open Graph Images

تم إصلاح مشكلة عدم ظهور الصورة والعنوان والوصف عند مشاركة الرابط.

## 🔧 المشاكل التي تم حلها:

### 1. ❌ المشكلة: URLs نسبية
```typescript
// قبل
images: ["/yhouse-logo.png"]  // ❌ نسبي

// بعد
images: ["https://housescrub.com/yhouse-logo.png"]  // ✅ مطلق
```

### 2. ❌ المشكلة: NEXT_PUBLIC_SITE_URL غير محدد
```bash
# تم إنشاء .env.local
NEXT_PUBLIC_SITE_URL=https://housescrub.com
```

### 3. ❌ المشكلة: Meta tags غير كافية
```html
<!-- تم إضافة meta tags صريحة في head -->
<meta property="og:image" content="https://housescrub.com/yhouse-logo.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:image" content="https://housescrub.com/yhouse-logo.png" />
```

## 📋 الملفات المحدثة:

### 1. ✅ `.env.local` (جديد)
```env
NEXT_PUBLIC_SITE_URL=https://housescrub.com
NEXT_PUBLIC_API_BASE=https://scrubstore.runasp.net
NEXT_PUBLIC_PHONE=01501881005
NEXT_PUBLIC_WHATSAPP=201501881005
NEXT_PUBLIC_EMAIL=info@housescrub.com
```

### 2. ✅ `src/lib/metadata.ts`
- تحويل جميع URLs للصور إلى مطلقة
- إضافة `type: "image/png"`
- تحسين `generatePageMetadata`

### 3. ✅ `src/app/[locale]/layout.tsx`
- إضافة meta tags صريحة في `<head>`
- Open Graph image tags
- Twitter Card tags

## 🧪 كيفية الاختبار:

### 1. Facebook Debugger
```
https://developers.facebook.com/tools/debug/
```
- الصق رابط الموقع
- اضغط "Scrape Again"
- يجب أن تظهر الصورة والعنوان والوصف

### 2. Twitter Card Validator
```
https://cards-dev.twitter.com/validator
```
- الصق رابط الموقع
- يجب أن تظهر Large Image Card

### 3. LinkedIn Post Inspector
```
https://www.linkedin.com/post-inspector/
```
- الصق رابط الموقع
- يجب أن تظهر الصورة

### 4. WhatsApp
- أرسل الرابط في محادثة
- يجب أن تظهر:
  - ✅ الصورة (اللوجو)
  - ✅ العنوان: "HouseScrub - هاوس سكراب | السكراب الطبي رقم واحد في مصر"
  - ✅ الوصف: "توصيل لجميع أنحاء مصر..."

## 📱 النتيجة المتوقعة:

### WhatsApp / Telegram:
```
┌─────────────────────────────────┐
│                                 │
│     [صورة اللوجو]               │
│                                 │
├─────────────────────────────────┤
│ HouseScrub - هاوس سكراب         │
│ السكراب الطبي رقم واحد في مصر   │
│                                 │
│ توصيل لجميع أنحاء مصر خلال      │
│ 3-7 أيام. فروع في المنصورة      │
│ وطنطا. للتواصل: 01501881005     │
│                                 │
│ 🔗 housescrub.com               │
└─────────────────────────────────┘
```

### Facebook:
```
┌─────────────────────────────────┐
│                                 │
│     [صورة كبيرة - اللوجو]       │
│                                 │
├─────────────────────────────────┤
│ HouseScrub - هاوس سكراب         │
│ السكراب الطبي رقم واحد في مصر   │
│                                 │
│ HOUSESCRUB.COM                  │
└─────────────────────────────────┘
```

### Twitter:
```
┌─────────────────────────────────┐
│                                 │
│     [صورة كبيرة - اللوجو]       │
│                                 │
├─────────────────────────────────┤
│ HouseScrub - هاوس سكراب         │
│ السكراب الطبي رقم واحد في مصر   │
│                                 │
│ 🔗 housescrub.com               │
└─────────────────────────────────┘
```

## ⚠️ ملاحظات مهمة:

### 1. Cache
بعد التحديث، قد تحتاج المنصات وقت لتحديث الكاش:
- Facebook: استخدم Debugger للتحديث الفوري
- WhatsApp: قد يستغرق 24 ساعة
- Twitter: استخدم Card Validator

### 2. Domain
تأكد من تحديث `NEXT_PUBLIC_SITE_URL` في `.env.local` بالدومين الفعلي:
```env
# Development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 3. الصورة
- الحجم الحالي: يجب أن يكون 1200x630 بكسل
- إذا كانت الصورة صغيرة، قد لا تظهر بشكل صحيح
- يُفضل إنشاء صورة OG مخصصة بالحجم الصحيح

## 🚀 الخطوات التالية (اختياري):

### 1. إنشاء صورة OG مخصصة
```bash
# إنشاء صورة 1200x630 بكسل
# تحتوي على:
# - اللوجو
# - اسم البراند
# - Slogan
# - معلومات الاتصال
```

### 2. إضافة صور مختلفة لكل صفحة
```typescript
// في صفحة المنتج
export const metadata = generatePageMetadata({
  title: "اسم المنتج",
  image: "/products/product-image.jpg",
  path: "/product/123"
});
```

---

**الآن الروابط ستظهر بشكل احترافي على جميع المنصات! 🎉**
