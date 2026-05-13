# تاسكات تطبيق معايير 2026 للتصميم (Airy Design & Accessibility)

## المرجع: دليل معايير E-commerce & Landing Pages 2026

---

## Phase 1: Design Tokens & CSS Variables (أساس كل حاجة)

### Task 1.1: إضافة Design Tokens جديدة في `globals.css`
- **الملف:** `src/app/globals.css`
- **المطلوب:**
  - أضف CSS variables جديدة في `:root` للمقاسات القياسية:
    ```css
    /* 2026 Spacing & Sizing Standards */
    --screen-padding: 16px;          /* الحد الأدنى */
    --screen-padding-premium: 20px;  /* للمتاجر الفاخرة */
    --section-gap: 48px;             /* المسافة بين الأقسام - موبايل */
    --section-gap-desktop: 64px;     /* المسافة بين الأقسام - ديسكتوب */
    --item-gap: 12px;                /* المسافة بين العناصر */
    --item-gap-lg: 16px;             /* المسافة بين العناصر - أكبر */
    
    /* Touch Targets */
    --btn-height-min: 48px;
    --btn-height-cta: 54px;
    --input-height: 48px;
    --header-height-mobile: 56px;
    --header-height-desktop: 64px;
    --bottom-nav-height: 64px;
    --ios-safe-area: 34px;
    
    /* Border Radius - Premium/Luxury */
    --radius-card: 4px;              /* كروت المنتجات */
    --radius-btn: 0px;               /* الأزرار - sharp luxury */
    --radius-input: 4px;             /* حقول الإدخال */
    
    /* Typography */
    --text-body: 14px;
    --text-body-lg: 16px;
    --text-muted-min: #4B5563;       /* أفتح لون مقروء - contrast safe */
    ```
  - حدّث `--radius` من `0.25rem` إلى `4px` (أوضح)
- **التأثير:** أساس موحد لكل التعديلات الجاية

---

### Task 1.2: إضافة Tailwind Custom Utilities
- **الملف:** `tailwind.config.ts` (أو `tailwind.config.js`)
- **المطلوب:**
  - أضف custom spacing values:
    ```js
    theme: {
      extend: {
        spacing: {
          'section': '48px',
          'section-lg': '64px',
          'section-xl': '80px',
          'screen-pad': '20px',
          'screen-pad-sm': '16px',
        },
        minHeight: {
          'touch': '48px',
          'cta': '54px',
        },
        borderRadius: {
          'card': '4px',
          'luxury': '0px',
        }
      }
    }
    ```
- **التأثير:** يسهّل استخدام المقاسات الجديدة في كل الـ components

---

## Phase 2: Header & Navigation (Touch Targets + Heights)

### Task 2.1: تحديث ارتفاع الـ Header
- **الملف:** `src/components/Navigation.tsx`
- **الحالة الحالية:** `px-4 py-3 md:py-4` (الارتفاع غير ثابت، يعتمد على الـ padding)
- **المطلوب:**
  - Mobile: اجعل الـ header ارتفاعه ثابت `h-14` (56px) أو `min-h-[56px]`
  - Desktop: `h-16` (64px) أو `min-h-[64px]`
  - تأكد إن الـ touch targets (أيقونات البحث، السلة، القائمة) كلها `min-w-[44px] min-h-[44px]`
  - غيّر `px-4` إلى `px-5` (20px) للـ premium feel
- **التأثير:** header متسق مع معايير 2026 + touch targets آمنة

---

### Task 2.2: تحديث الـ Top Banner
- **الملف:** `src/components/TopBanner.tsx`
- **الحالة الحالية:** `py-2.5` (حوالي 40px total) + `text-xs md:text-sm`
- **المطلوب:**
  - الارتفاع مظبوط تقريباً (32-40px) ✅
  - تأكد إن الـ font-size على الموبايل `text-xs` (12px) مع `font-medium` ✅
  - أضف `max-h-[40px]` كـ safety constraint
- **الحالة:** ✅ شبه مطابق — تعديل بسيط فقط

---

## Phase 3: Hero Section (Above the Fold)

### Task 3.1: تحديث Hero Height
- **الملف:** `src/components/Hero.tsx`
- **الحالة الحالية:** `h-[calc(100svh-80px)] lg:h-[90vh]`
- **المطلوب:**
  - Mobile: غيّر لـ `h-[calc(100svh-var(--header-height-mobile))]` أو `h-[calc(100svh-56px)]`
  - Desktop: خليه `h-[calc(100vh-64px)]` أو `min-h-[80vh]`
  - تأكد إن الـ CTA button واضح Above the fold
- **التأثير:** الـ Hero يملأ الشاشة بشكل صحيح بعد تعديل الـ header

---

### Task 3.2: تحديث CTA Button في الـ Hero
- **الملف:** `src/components/Hero.tsx`
- **الحالة الحالية:**
  - Mobile: `variant="link"` (صغير جداً، مش واضح)
  - Desktop: `px-12 py-7` (كويس)
- **المطلوب:**
  - Mobile CTA: غيّره من `variant="link"` لـ button حقيقي بارتفاع `h-[54px]` أو `py-4`
  - اجعله واضح ومرئي فوراً (Above the fold) بدون scroll
  - أضف `min-h-[48px]` كـ accessibility requirement
  - Desktop: خلي `py-7` (56px) ✅ — مطابق
- **التأثير:** الـ CTA يبقى واضح ومتوافق مع معايير الـ accessibility

---

### Task 3.3: إضافة `preload="none"` للـ Hero Video (Mobile)
- **الملف:** `src/components/Hero.tsx`
- **الحالة الحالية:** `preload="metadata"` + `autoPlay`
- **المطلوب:**
  - لو الفيديو مش أول حاجة visible (بسبب الـ banner + header)، خلي `preload="metadata"` ✅
  - أضف `fetchPriority="high"` على الـ video tag عشان يبدأ يحمل بسرعة
  - تأكد إن الـ `<Image priority>` موجود على الـ mobile image fallback ✅
- **الحالة:** ✅ شبه مطابق — تعديل بسيط

---

## Phase 4: Product Cards (Aspect Ratio + Border Radius + Spacing)

### Task 4.1: تحديث Aspect Ratio لكروت المنتجات
- **الملف:** `src/components/product/ProductCard.tsx`
- **الحالة الحالية:** `aspect-[3/4]` (0.75 ratio)
- **المطلوب:**
  - غيّر لـ `aspect-[4/5]` (0.8 ratio) — أفضل لمنتجات الحقائب والأزياء
  - النسبة 4:5 تبرز تفاصيل المنتج بشكل طولي أفضل على الموبايل
- **التأثير:** صور أطول قليلاً تعرض المنتج بشكل أفضل

---

### Task 4.2: تحديث Border Radius لكروت المنتجات
- **الملف:** `src/components/product/ProductCard.tsx`
- **الحالة الحالية:** `rounded-xl` (12px) — كبير جداً لمتجر فاخر
- **المطلوب:**
  - غيّر `rounded-xl` إلى `rounded` (4px) أو `rounded-sm` (2px)
  - المتاجر الـ Premium تستخدم sharp edges أو انحناء بسيط جداً (4-8px)
  - الـ `rounded-xl` مناسب أكتر لتطبيقات الأطفال/المرحة
- **التأثير:** مظهر أكثر فخامة واحترافية

---

### Task 4.3: تحديث Grid Spacing في ProductGrid
- **الملف:** `src/components/ProductGrid.tsx`
- **المطلوب:**
  - تأكد إن الـ gap بين الكروت `gap-3` (12px) أو `gap-4` (16px)
  - الـ screen padding (container) يكون `px-5` (20px) على الموبايل
  - على الموبايل: 2 columns مع gap-3
  - على التابلت: 3 columns مع gap-4
  - على الديسكتوب: 4 columns مع gap-4
- **التأثير:** تنفس بصري أفضل بين المنتجات

---

### Task 4.4: تحديث Typography في ProductCard
- **الملف:** `src/components/product/ProductCard.tsx`
- **الحالة الحالية:** `text-sm` للاسم + `text-sm font-bold` للسعر
- **المطلوب:**
  - اسم المنتج: `text-sm` (14px) ✅
  - السعر: `text-sm font-semibold` (14px)
  - تأكد إن لون النص `text-gray-900` (مش رمادي فاتح) ✅
  - الـ `mb-4` بين الصورة والتفاصيل → غيّرها لـ `mb-3` (12px)
- **التأثير:** typography متسق مع المعايير

---

## Phase 5: Sections Spacing (التنفس البصري)

### Task 5.1: توحيد المسافات بين الأقسام في الـ Homepage
- **الملف:** `src/app/[locale]/page.tsx`
- **الحالة الحالية:** مفيش spacing موحد بين الـ sections
- **المطلوب:**
  - أضف wrapper `<div className="space-y-12 md:space-y-16 lg:space-y-20">` حول الأقسام
  - أو: أضف `mt-12 md:mt-16` (48px / 64px) على كل section
  - الـ Hero مش محتاج margin-top (هو أول حاجة)
  - بعد الـ Hero: `mt-12` (48px) للقسم اللي بعده
- **التأثير:** فصل واضح بين الأقسام — airy design

---

### Task 5.2: تحديث الـ Screen Padding (Container)
- **الملف:** `src/components/CommonLayout.tsx` + كل الـ sections
- **الحالة الحالية:** `container mx-auto px-4` (16px)
- **المطلوب:**
  - غيّر `px-4` إلى `px-5` (20px) في كل الـ sections الرئيسية
  - أو: عدّل الـ container في Tailwind config ليكون padding `20px` by default
  - ده يدي إحساس بالفخامة والنظافة (Premium feel)
- **التأثير:** مساحة تنفس أكبر على الجوانب

---

### Task 5.3: تحديث الـ Footer Padding
- **الملف:** `src/components/CommonLayout.tsx`
- **الحالة الحالية:** `pb-16 md:pb-24` على الـ main
- **المطلوب:**
  - Mobile: `pb-20` (80px) — يكفي للـ bottom nav + safe area
  - Desktop: `pb-16` (64px) — كافي
  - لو فيه bottom navigation bar: أضف `pb-[calc(64px+34px)]` = `pb-[98px]` للـ iOS safe area
- **التأثير:** المحتوى مش هيتغطى بالـ bottom nav

---

## Phase 6: Buttons & Input Fields (Accessibility)

### Task 6.1: تحديث ارتفاع الأزرار الرئيسية
- **الملفات:** كل الـ CTA buttons في المشروع
- **المطلوب:**
  - Primary buttons (Add to Cart, Shop Now, Checkout): `min-h-[48px]` أو `h-[54px]`
  - Secondary buttons: `min-h-[44px]`
  - أضف في `src/components/ui/button.tsx`:
    ```
    default: "min-h-[48px] ..."
    ```
  - تأكد إن الـ padding كافي: `px-6 py-3` كحد أدنى
- **التأثير:** أزرار سهلة اللمس على الموبايل — لا نقرات خاطئة

---

### Task 6.2: تحديث ارتفاع حقول الإدخال
- **الملفات:** `src/components/ui/input.tsx` + أي form fields
- **المطلوب:**
  - أضف `min-h-[48px]` أو `h-12` (48px) على كل input fields
  - تأكد إن الـ font-size `text-base` (16px) على الموبايل (يمنع iOS zoom)
  - الـ border-radius: `rounded` (4px)
- **التأثير:** حقول إدخال مريحة + لا zoom على iOS

---

### Task 6.3: تحديث Text Contrast
- **الملفات:** كل الـ components اللي فيها نصوص رمادية
- **المطلوب:**
  - ابحث عن `text-gray-400`, `text-gray-300` واستبدلهم بـ `text-gray-500` كحد أدنى
  - الـ muted text يكون `text-gray-600` (#4B5563) أو أغمق
  - تأكد إن الـ contrast ratio ≥ 4.5:1 (WCAG AA)
  - حدّث `--muted-foreground` في globals.css من `40%` إلى `35%` (أغمق)
- **التأثير:** نصوص مقروءة لكل المستخدمين

---

## Phase 7: Category & Discover Sections

### Task 7.1: تحديث كروت التصنيفات
- **الملف:** `src/components/CategoryBanners.tsx`
- **المطلوب:**
  - Image aspect ratio: `aspect-[4/5]` للتصنيفات
  - Border radius: `rounded` (4px) بدل أي `rounded-lg` أو `rounded-xl`
  - Gap بين الكروت: `gap-3` (12px)
  - Screen padding: `px-5` (20px)
- **التأثير:** تصنيفات متسقة مع باقي التصميم

---

### Task 7.2: تحديث DiscoverSection
- **الملف:** `src/components/DiscoverSection.tsx`
- **المطلوب:**
  - تأكد إن الـ section فيه `mt-12 md:mt-16` (48-64px) من القسم اللي قبله
  - الصور: `aspect-[4/5]` أو `aspect-square` حسب التصميم
  - Border radius: `rounded` (4px)
  - Gap: `gap-4` (16px)
- **التأثير:** تناسق بصري

---

## Phase 8: Mobile-Specific Optimizations

### Task 8.1: إضافة iOS Safe Area Support
- **الملف:** `src/app/globals.css`
- **المطلوب:**
  - أضف في الـ `<html>` أو `<body>`:
    ```css
    body {
      padding-bottom: env(safe-area-inset-bottom);
    }
    ```
  - أو أضف على الـ bottom navigation:
    ```css
    .bottom-nav {
      padding-bottom: calc(16px + env(safe-area-inset-bottom));
    }
    ```
  - أضف `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` في الـ layout
- **التأثير:** المحتوى مش هيتقطع على أجهزة iOS الحديثة

---

### Task 8.2: تحسين الـ Scroll Behavior
- **الملف:** `src/app/globals.css`
- **المطلوب:**
  - أضف `scroll-behavior: smooth` على `html`
  - أضف `-webkit-overflow-scrolling: touch` للـ scrollable containers
  - أضف `overscroll-behavior-y: contain` على الـ modals/drawers
- **التأثير:** scrolling أنعم على الموبايل

---

## Phase 9: Typography System

### Task 9.1: توحيد الـ Typography Scale
- **الملف:** `src/app/globals.css` أو Tailwind config
- **المطلوب:**
  - Body text: `14px` (mobile) / `16px` (desktop)
  - Section headings: `24px` (mobile) / `32px` (desktop)
  - Card titles: `14px`
  - Prices: `14px font-semibold`
  - Small/caption: `12px` (minimum readable)
  - تأكد إن مفيش text أصغر من `12px` في أي مكان
- **التأثير:** hierarchy واضح ومقروء

---

### Task 9.2: تحديث Line Heights
- **المطلوب:**
  - Body text: `leading-relaxed` (1.625) أو `leading-6` (24px)
  - Headings: `leading-tight` (1.25)
  - Cards: `leading-snug` (1.375)
  - تجنب `leading-none` إلا في الأرقام الكبيرة
- **التأثير:** قراءة أسهل خصوصاً للنص العربي

---

## Phase 10: Micro-interactions & Polish

### Task 10.1: إضافة Hover/Active States متسقة
- **الملفات:** كل الـ interactive elements
- **المطلوب:**
  - Buttons: `active:scale-[0.98] transition-transform duration-150`
  - Cards: `hover:shadow-md transition-shadow duration-300` (desktop only)
  - Links: `hover:opacity-80 transition-opacity`
  - تأكد إن كل الـ hover effects معطلة على touch devices (موجود جزئياً ✅)
- **التأثير:** feedback بصري سريع للمستخدم

---

### Task 10.2: تحسين Loading States
- **المطلوب:**
  - Skeleton loaders بنفس أبعاد المحتوى الحقيقي
  - استخدم `animate-pulse` مع `bg-gray-100` (مش `bg-gray-200` — أخف)
  - الـ skeleton يطابق الـ aspect ratio الجديد `4:5`
- **التأثير:** perceived performance أفضل

---

## ملخص الأولويات

| الأولوية | الـ Tasks | التأثير المتوقع | الحالة |
|----------|----------|----------------|--------|
| 🔴 عالية | 1.1, 2.1, 3.2, 4.1, 4.2, 5.1, 6.1, 6.3 | أكبر تأثير بصري + accessibility | ✅ Done |
| 🟡 متوسطة | 1.2, 3.1, 4.3, 5.2, 6.2, 7.1, 8.1, 9.1 | تحسين ملحوظ | ✅ Done |
| 🟢 منخفضة | 2.2, 3.3, 4.4, 5.3, 7.2, 8.2, 9.2, 10.1, 10.2 | polish & consistency | ✅ Done |

---

## ترتيب التنفيذ المقترح

1. **Task 1.1** — Design Tokens (أساس كل حاجة)
2. **Task 1.2** — Tailwind utilities
3. **Task 4.2** — Border Radius (أسرع تغيير بصري)
4. **Task 4.1** — Aspect Ratio (4:5)
5. **Task 6.3** — Text Contrast (accessibility)
6. **Task 2.1** — Header height
7. **Task 3.2** — Hero CTA button
8. **Task 5.1** — Sections spacing
9. **Task 5.2** — Screen padding (20px)
10. **Task 6.1** — Button heights
11. **Task 6.2** — Input heights
12. **Task 8.1** — iOS Safe Area
13. باقي الـ tasks بالترتيب

---

## ملاحظات مهمة

- **لا تكسر الـ responsive design الحالي** — كل تعديل يتم تدريجياً
- **اختبر على 390px و 430px** — المقاسات القياسية للموبايل 2026
- **الـ breakpoint الأساسي 768px** — للتفرقة بين موبايل وتابلت
- **الـ dark mode** — تأكد إن التعديلات تشتغل في الـ dark mode كمان
- **RTL Support** — المشروع يدعم العربية، تأكد إن الـ paddings متماثلة (px مش pl/pr)
