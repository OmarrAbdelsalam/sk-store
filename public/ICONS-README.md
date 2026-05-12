# إنشاء الأيقونات (Icons & Favicon)

## الملفات المطلوبة:

يجب إنشاء الأيقونات التالية من `SK_Logo.svg`:

### 1. Favicon
- **favicon.ico** (16x16, 32x32, 48x48)
- يظهر في تبويب المتصفح

### 2. PWA Icons
- **icon-192.png** (192x192)
- **icon-512.png** (512x512)
- للتطبيق التقدمي (PWA)

### 3. Apple Touch Icon
- **apple-icon.png** (180x180)
- لأجهزة iOS عند إضافة الموقع للشاشة الرئيسية

## طرق الإنشاء:

### الطريقة 1: أدوات أونلاين (الأسهل)
1. اذهب إلى: https://realfavicongenerator.net/
2. ارفع ملف `SK_Logo.svg`
3. اختر الإعدادات المناسبة
4. حمّل الملفات وضعها في مجلد `/public/`

### الطريقة 2: باستخدام Sharp (محلياً)
```bash
npm install sharp
node scripts/generate-icons.js
```

### الطريقة 3: باستخدام ImageMagick
```bash
# Icon 192x192
magick SK_Logo.svg -resize 192x192 icon-192.png

# Icon 512x512
magick SK_Logo.svg -resize 512x512 icon-512.png

# Apple Icon 180x180
magick SK_Logo.svg -resize 180x180 apple-icon.png

# Favicon (يحتاج أداة خاصة)
```

## ملاحظات:
- تأكد من أن الخلفية شفافة أو بيضاء
- استخدم PNG للأيقونات الملونة
- Favicon.ico يجب أن يحتوي على أحجام متعددة (16, 32, 48)
