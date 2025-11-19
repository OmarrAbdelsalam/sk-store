# تثبيت Vercel Analytics

تم إضافة Vercel Analytics للموقع. لتفعيله، اتبع الخطوات التالية:

## 1. تثبيت المكتبة

```bash
npm install @vercel/analytics
```

أو

```bash
yarn add @vercel/analytics
```

أو

```bash
pnpm add @vercel/analytics
```

## 2. التفعيل في Vercel Dashboard

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر المشروع الخاص بك
3. اذهب إلى **Analytics** من القائمة الجانبية
4. اضغط على **Enable Analytics**

## 3. التحقق من التثبيت

بعد التثبيت والنشر، ستبدأ في رؤية البيانات في:
- **Vercel Dashboard → Analytics**

## ما تم إضافته

تم إضافة `<Analytics />` component في:
- `src/app/[locale]/layout.tsx`

```typescript
import { Analytics } from '@vercel/analytics/next';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics /> {/* ✅ تم الإضافة */}
      </body>
    </html>
  );
}
```

## الميزات

✅ **تتبع الزيارات**: عدد الزوار والصفحات المشاهدة
✅ **الأداء**: Core Web Vitals (LCP, FID, CLS)
✅ **المصادر**: من أين يأتي الزوار
✅ **الأجهزة**: Desktop vs Mobile
✅ **المواقع الجغرافية**: البلدان والمدن
✅ **خفيف جداً**: لا يؤثر على الأداء

## ملاحظات

- Analytics مجاني في Vercel
- لا يحتاج إعدادات إضافية
- يعمل تلقائياً بعد التثبيت والنشر
- متوافق مع GDPR (لا يستخدم cookies)
