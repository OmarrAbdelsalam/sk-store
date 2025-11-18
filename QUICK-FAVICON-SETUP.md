# ⚡ إعداد Favicon السريع

## الوضع الحالي:
✅ اللوجو `yhouse-logo.png` يُستخدم مؤقتاً كـ favicon
⚠️ يجب إنشاء أيقونات محسّنة للأحجام المختلفة

## الخطوات (5 دقائق):

### 1️⃣ اذهب إلى الموقع:
🔗 **https://realfavicongenerator.net/**

### 2️⃣ ارفع اللوجو:
- اضغط "Select your Favicon image"
- اختر `public/yhouse-logo.png`

### 3️⃣ اختر الإعدادات:
- **Background color**: `#042d87` (الأزرق من اللوجو)
- **iOS**: نفس اللون
- **Android**: نفس اللون

### 4️⃣ حمّل الملفات:
- اضغط "Generate your Favicons"
- حمّل الملف المضغوط
- استخرج الملفات

### 5️⃣ ضع الملفات في `/public/`:
```
public/
├── favicon.ico          ← ضع هنا
├── favicon-16x16.png    ← ضع هنا
├── favicon-32x32.png    ← ضع هنا
├── apple-icon.png       ← أعد تسمية apple-touch-icon.png
├── icon-192.png         ← أعد تسمية android-chrome-192x192.png
└── icon-512.png         ← أعد تسمية android-chrome-512x512.png
```

### 6️⃣ حدّث الكود:

في `src/lib/metadata.ts`، استبدل:
```typescript
icons: {
  icon: [
    { url: "/favicon.ico", sizes: "any" },
    { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
  ],
  apple: [
    { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  ],
},
```

في `src/app/[locale]/layout.tsx`، استبدل:
```typescript
<head>
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
  <link rel="apple-touch-icon" href="/apple-icon.png" />
  <meta name="theme-color" content="#042d87" />
</head>
```

### 7️⃣ اختبر:
```bash
npm run dev
```
- افتح المتصفح
- يجب أن يظهر اللوجو في التبويب
- امسح الكاش إذا لم يظهر (Ctrl+Shift+R)

---

## ✅ بعد الانتهاء:
- احذف `public/GENERATE-ICONS-HERE.txt`
- احذف هذا الملف

**الوقت المتوقع: 5 دقائق فقط! ⏱️**
