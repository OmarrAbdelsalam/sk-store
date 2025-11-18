# دليل إعداد SEO و Open Graph

تم إعداد الموقع بالكامل لتحسين محركات البحث (SEO) ومشاركة الروابط على وسائل التواصل الاجتماعي.

## ✅ ما تم إنجازه:

### 1. Metadata الأساسية
- ✅ Title و Description لكل صفحة
- ✅ Keywords متعددة اللغات
- ✅ Canonical URLs
- ✅ Language alternates (ar/en)

### 2. Open Graph (Facebook, LinkedIn, WhatsApp)
- ✅ og:title, og:description, og:image
- ✅ og:type, og:locale, og:site_name
- ✅ صورة مخصصة 1200x630 بكسل

### 3. Twitter Cards
- ✅ twitter:card, twitter:title, twitter:description
- ✅ twitter:image
- ✅ Large image summary

### 4. Icons & Favicon
- ✅ Favicon ديناميكي (icon.tsx)
- ✅ Apple Touch Icon (apple-icon.tsx)
- ✅ PWA Icons (192x192, 512x512)
- ✅ Manifest.json للتطبيق التقدمي

### 5. Structured Data (JSON-LD)
- ✅ Organization Schema
- ✅ Website Schema
- ✅ Product Schema (جاهز للاستخدام)
- ✅ Breadcrumb Schema (جاهز للاستخدام)

### 6. SEO Files
- ✅ robots.txt
- ✅ sitemap.xml (ديناميكي)
- ✅ manifest.json

### 7. Performance
- ✅ Image optimization
- ✅ Lazy loading
- ✅ Code splitting

## 📋 خطوات إضافية مطلوبة:

### 1. تحديث متغيرات البيئة
أضف في ملف `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. إنشاء الأيقونات من اللوجو
اختر إحدى الطرق:

#### الطريقة الأولى: أدوات أونلاين (موصى بها)
1. اذهب إلى: https://realfavicongenerator.net/
2. ارفع `public/yhouse-logo.png`
3. حمّل الملفات وضعها في `/public/`

#### الطريقة الثانية: باستخدام Sharp
```bash
npm install sharp
node scripts/generate-icons.js
```

### 3. تحديث معلومات Google Search Console
في `src/lib/metadata.ts`:
```typescript
verification: {
  google: "your-google-verification-code",
}
```

### 4. إضافة روابط وسائل التواصل
في `src/components/StructuredData.tsx`:
```typescript
sameAs: [
  "https://facebook.com/yourpage",
  "https://instagram.com/yourpage",
  "https://twitter.com/yourpage",
]
```

### 5. تحديث Twitter Handle
في `src/lib/metadata.ts`:
```typescript
twitter: {
  creator: "@your_twitter_handle",
}
```

## 🧪 اختبار SEO:

### أدوات الاختبار:
1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
3. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
4. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
5. **PageSpeed Insights**: https://pagespeed.web.dev/

### اختبار محلي:
```bash
# بناء المشروع
npm run build

# تشغيل production
npm start

# فحص الروابط
curl -I http://localhost:3000
```

## 📱 اختبار مشاركة الروابط:

### WhatsApp
1. أرسل رابط الموقع في محادثة
2. يجب أن يظهر: اللوجو + العنوان + الوصف

### Facebook
1. الصق الرابط في منشور جديد
2. يجب أن يظهر: صورة كبيرة + عنوان + وصف

### Twitter
1. غرّد بالرابط
2. يجب أن يظهر: Twitter Card مع صورة كبيرة

## 🎯 نصائح إضافية:

### لتحسين SEO:
1. أضف محتوى نصي غني بالكلمات المفتاحية
2. استخدم عناوين H1, H2, H3 بشكل صحيح
3. أضف alt text لجميع الصور
4. حسّن سرعة التحميل
5. استخدم HTTPS

### لتحسين مشاركة الروابط:
1. استخدم صور عالية الجودة (1200x630)
2. اكتب عناوين جذابة (50-60 حرف)
3. اكتب أوصاف واضحة (150-160 حرف)
4. اختبر على جميع المنصات

## 📊 مراقبة الأداء:

### Google Analytics
أضف في `src/app/[locale]/layout.tsx`:
```typescript
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
```

### Google Search Console
1. سجّل الموقع في: https://search.google.com/search-console
2. أضف sitemap: `https://yourdomain.com/sitemap.xml`
3. راقب الأداء والأخطاء

## ✨ الملفات المهمة:

```
src/
├── lib/
│   └── metadata.ts          # إعدادات SEO الرئيسية
├── components/
│   └── StructuredData.tsx   # JSON-LD Schemas
├── app/
│   ├── sitemap.ts          # Sitemap ديناميكي
│   ├── icon.tsx            # Favicon
│   ├── apple-icon.tsx      # Apple Touch Icon
│   ├── opengraph-image.tsx # OG Image
│   └── twitter-image.tsx   # Twitter Card Image
public/
├── manifest.json           # PWA Manifest
├── robots.txt             # Robots file
└── yhouse-logo.png        # اللوجو الأساسي
```

## 🚀 النشر:

بعد النشر:
1. اختبر جميع الروابط
2. تحقق من ظهور الصور في المشاركات
3. راجع Google Search Console
4. راقب سرعة التحميل

---

**ملاحظة**: تأكد من تحديث `NEXT_PUBLIC_SITE_URL` قبل النشر!
