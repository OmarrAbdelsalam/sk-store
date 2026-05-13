# Landing Page Performance Tasks

## المرجع: مراجعة أداء الـ Landing Page

---

## Phase 1: Server Components Conversion (أولوية عالية)

### Task 1.1: تحويل `FeaturesSection` لـ Server Component
- **الملف:** `src/components/FeaturesSection.tsx`
- **المشكلة:** الـ component ده 100% static (أيقونات + translated text) ومفيش أي سبب يبقى client.
- **المطلوب:**
  - شيل `"use client"`
  - استبدل `useTranslations` بـ `getTranslations` من `next-intl/server`
  - شيل أي state أو effects (مفيش أصلاً)
- **التأثير:** يقلل JS bundle + يتحمل أسرع

---

### Task 1.2: تحويل `DiscoverSection` لـ Server Component
- **الملف:** `src/components/DiscoverSection.tsx`
- **المشكلة:** بيعمل `useEffect` fetch client-side لداتا ثابتة تقريباً.
- **المطلوب:**
  - شيل `"use client"`
  - حوّل لـ `async` function
  - اجلب الداتا server-side باستخدام `moreToDiscoverService.getActiveItems()` مباشرة
  - شيل `useState`, `useEffect`, `mounted` pattern, `localStorage` cache
  - استبدل `useTranslations` بـ `getTranslations`
  - خلي الـ `Image` components زي ما هي
- **التأثير:** يشيل client JS + يمنع flash of skeleton + SEO أحسن

---

### Task 1.3: تحويل `ReviewsGallery` لـ Server + Client split
- **الملف:** `src/components/ReviewsGallery.tsx`
- **المشكلة:** بيجيب الـ reviews client-side + فيه lightbox modal (interactive).
- **المطلوب:**
  - اعمل `ReviewsGalleryServer.tsx` (async server component) يجيب الداتا
  - اعمل `ReviewsGalleryClient.tsx` (client component) يستقبل الداتا كـ props ويتعامل مع الـ lightbox
  - الـ server component يعمل `customerLoveService.getActiveItems()` ويبعت النتيجة للـ client
  - شيل `localStorage` cache و `mounted` pattern من الـ flow
- **التأثير:** الداتا تتحمل server-side + الـ interactivity تفضل شغالة

---

### Task 1.4: تحويل `MovingTicker` لـ Server Component
- **الملف:** `src/components/MovingTicker.tsx`
- **المشكلة:** بيجيب text items + settings client-side. الـ animation CSS-only.
- **المطلوب:**
  - شيل `"use client"`
  - حوّل لـ `async` function
  - اجلب `marqueeService.getActiveItems()` و `marqueeService.getSettings()` server-side
  - شيل `useState`, `useEffect`, `localStorage` cache
  - الـ CSS animation (`animate-ticker`) هتفضل شغالة بدون JS
- **التأثير:** zero JS لـ section كامل

---

### Task 1.5: تحويل `CategoryBanners (ClothingShowcase)` لـ Server + Client split
- **الملف:** `src/components/CategoryBanners.tsx`
- **المشكلة:** بيستخدم `useCategories()` (SWR) + `useRouter()` للـ navigation.
- **المطلوب:**
  - اعمل `CategoryBannersServer.tsx` يجيب الـ categories server-side
  - الـ client part يستقبل الـ categories كـ props ويتعامل مع الـ click/navigation
  - شيل `useCategories` hook dependency من الـ landing page flow
  - شيل `mounted` pattern و `localStorage`
- **التأثير:** الـ categories تظهر فوراً بدون skeleton

---

## Phase 2: Data Fetching Optimization (أولوية عالية)

### Task 2.1: Centralized Products Fetch في الـ Page Level
- **الملف:** `src/app/[locale]/page.tsx`
- **المشكلة:** `ProductGrid` + `BestSellers` + `HandbagsSection` كلهم بيستخدموا `useProducts()` اللي بيعمل `fetchProducts(1, 100)` — 3 مرات نفس الـ call.
- **المطلوب:**
  - اجلب الـ products مرة واحدة في الـ page (server-side)
  - ابعت الـ products كـ props لـ `ProductGrid`, `BestSellers`, `HandbagsSection`
  - أو: اعمل shared context/provider يجيب الداتا مرة واحدة ويوزعها
  - شيل `useProducts()` من الـ 3 components دول واستبدله بـ props
- **التأثير:** بدل 3+ API calls → call واحد. أسرع بكتير.

---

### Task 2.2: إصلاح `ReelsShowcase` waterfall requests
- **الملف:** `src/components/ReelsShowcase.tsx`
- **المشكلة:** بيعمل `getFeaturedSocialProofs()` وبعدين `getProductById()` لكل فيديو واحد واحد (waterfall).
- **المطلوب:**
  - عدّل الـ `getFeaturedSocialProofs` query عشان يعمل JOIN مع الـ products table ويجيب الـ price مباشرة
  - أو: اعمل `Promise.all` batch fetch لكل الـ product IDs مرة واحدة (ده موجود بس الـ individual calls بتعمل waterfall)
  - الأفضل: حوّل لـ server component يجيب كل الداتا مرة واحدة
- **التأثير:** بدل N+1 queries → query واحد أو اتنين

---

### Task 2.3: إزالة `NewArrivals` duplicate fetch
- **الملف:** `src/components/NewArrivals.tsx`
- **المشكلة:** بيعمل `fetchProducts(1, 4)` منفصل عن الـ main products fetch.
- **المطلوب:**
  - لو نفذت Task 2.1، خد أول 4 products من الـ centralized fetch وابعتهم لـ `NewArrivals`
  - أو: استخدم Next.js fetch deduplication (same request gets cached automatically)
- **التأثير:** يقلل API call واحد

---

## Phase 3: Image & Media Optimization (أولوية متوسطة)

### Task 3.1: Hero Image — استخدم `<Image priority>` بدل CSS background
- **الملف:** `src/components/Hero.tsx`
- **المشكلة:** الـ desktop image بيستخدم `background-image` CSS — مفيش preload, مفيش Next.js optimization.
- **المطلوب:**
  - استبدل `style={{ backgroundImage }}` بـ `<Image>` component مع `priority` و `fill`
  - للـ mobile: لو الـ media صورة، استخدم `<Image priority>` برضو
  - الـ video يفضل زي ما هو بس أضف `preload="metadata"`
- **التأثير:** LCP أسرع بكتير (الـ hero هو أول حاجة الـ user بيشوفها)

---

### Task 3.2: Lazy load الـ video في `MaisonClutchClient`
- **الملف:** `src/components/MaisonClutchClient.tsx`
- **المشكلة:** الـ video بيعمل `autoPlay` — بيحمل الفيديو كامل حتى لو الـ section مش visible.
- **المطلوب:**
  - أضف `preload="none"` على الـ `<video>` tag
  - استخدم Intersection Observer: لما الـ section تبقى visible، غيّر `preload` لـ `"auto"` وابدأ play
  - أو: استخدم `loading="lazy"` pattern
- **التأثير:** يوفر bandwidth كبير على الـ initial load

---

### Task 3.3: Lazy load thumbnails في `ReelsShowcase`
- **الملف:** `src/components/ReelsShowcase.tsx`
- **المشكلة:** كل الـ thumbnails بتتحمل مرة واحدة.
- **المطلوب:**
  - أضف `loading="lazy"` على الـ `<Image>` components اللي مش في الـ viewport
  - أو استخدم `sizes` prop صح عشان يحمل الـ size المناسب
- **التأثير:** يقلل initial image downloads

---

## Phase 4: Code Splitting & Suspense (أولوية متوسطة)

### Task 4.1: أضف `<Suspense>` wrappers للـ `dynamic()` components
- **الملف:** `src/app/[locale]/page.tsx`
- **المشكلة:** `ClothingShowcase`, `ReelsShowcase`, `DiscoverSection`, `HandbagsSection`, `ReviewsGallery`, `BestSellers`, `FeaturesSection`, `MovingTicker` — كلهم `dynamic()` بدون Suspense fallback.
- **المطلوب:**
  - لف كل `dynamic()` component بـ `<Suspense fallback={<skeleton/>}>`
  - أو: استخدم `dynamic(() => import(...), { loading: () => <Skeleton/> })`
  - اعمل skeleton مناسب لكل section
- **التأثير:** الـ user يشوف loading state بدل فراغ

---

### Task 4.2: شيل `dynamic()` من الـ components اللي اتحولت Server
- **الملف:** `src/app/[locale]/page.tsx`
- **المشكلة:** بعد ما تحوّل components لـ server (Phase 1)، مش محتاج `dynamic()` عليهم.
- **المطلوب:**
  - بعد تنفيذ Phase 1، استبدل `dynamic(() => import(...))` بـ `import` عادي للـ server components
  - خلي `dynamic()` بس للـ client components التقيلة (embla carousel, framer-motion)
- **التأثير:** يقلل overhead الـ dynamic loading للحاجات اللي مش محتاجاه

---

## Phase 5: إزالة Anti-Patterns (أولوية منخفضة)

### Task 5.1: شيل `mounted` state pattern من الـ Server Components
- **الملفات:** كل الـ components اللي اتحولت server في Phase 1
- **المشكلة:** الـ `mounted` pattern بيخلي الـ component يعرض skeleton لحد ما الـ JS يشتغل — ده ملوش لازمة في server components.
- **المطلوب:**
  - بعد التحويل لـ server، شيل `useState(false)` + `useEffect(() => setMounted(true))`
  - الـ server component هيرندر الـ HTML مباشرة
- **التأثير:** مفيش flash of skeleton

---

### Task 5.2: شيل `localStorage` caching من الـ Server Components
- **الملفات:** `DiscoverSection`, `ReviewsGallery`, `MovingTicker`, `ReelsShowcase`
- **المشكلة:** الـ localStorage cache بيسبب stale data + مش محتاجه لو الداتا بتيجي server-side.
- **المطلوب:**
  - شيل كل `localStorage.getItem` / `localStorage.setItem` من الـ components اللي اتحولت server
  - استخدم Next.js built-in caching (fetch cache / `unstable_cache` / revalidate)
- **التأثير:** داتا fresh دايماً + كود أنضف

---

### Task 5.3: شيل `console.log` statements من Production code
- **الملفات:** `ReelsShowcase.tsx` (فيه `console.log` statements)
- **المطلوب:**
  - شيل `console.log('Product fetched for video:...')` و `console.log('Videos with prices:...')`
  - خلي بس `console.error` للـ actual errors
- **التأثير:** كود أنضف + مفيش noise في الـ console

---

## Phase 6: Page Structure Optimization (أولوية منخفضة)

### Task 6.1: إعادة ترتيب الـ Sections
- **الملف:** `src/app/[locale]/page.tsx`
- **المشكلة:** `ProductGrid` (كل المنتجات) بييجي قبل `DiscoverSection` و `BestSellers` — الصفحة طويلة.
- **المطلوب:**
  - راجع الترتيب: Hero → NewArrivals → Categories → Reels → **BestSellers** → Discover → Clutch → **ProductGrid** (أو شيله من الـ homepage خالص)
  - الـ ProductGrid الكامل ممكن يبقى في `/products` page بس
- **التأثير:** perceived performance أحسن + الـ user يشوف الـ highlights الأول

---

### Task 6.2: حوّل الـ Page لـ `async` مع centralized data fetching
- **الملف:** `src/app/[locale]/page.tsx`
- **المشكلة:** الـ page مش `async` — مش بيستفيد من server-side data fetching.
- **المطلوب:**
  - حوّل `const Index = ()` لـ `export default async function Page()`
  - اجلب الـ products + categories + أي داتا تانية server-side
  - ابعت الداتا كـ props للـ children
  - لف الـ async children بـ `<Suspense>`
- **التأثير:** أساس لكل التحسينات التانية

---

## ملخص الأولويات

| الأولوية | الـ Tasks | التأثير المتوقع | الحالة |
|----------|----------|----------------|--------|
| 🔴 عالية | 1.1, 1.2, 1.4, 2.1, 3.1, 6.2 | أكبر تحسين في السرعة | ✅ Done (except 2.1) |
| 🟡 متوسطة | 1.3, 1.5, 2.2, 3.2, 4.1 | تحسين ملحوظ | ✅ Done |
| 🟢 منخفضة | 2.3, 3.3, 4.2, 5.1, 5.2, 5.3, 6.1 | polish + cleanup | ✅ 3.3, 4.2, 5.1, 5.2, 5.3 Done |

---

## ترتيب التنفيذ المقترح

1. **Task 6.2** — حوّل الـ Page لـ async (أساس لكل حاجة)
2. **Task 2.1** — Centralized products fetch
3. **Task 1.1** — FeaturesSection (أسهل واحد)
4. **Task 1.4** — MovingTicker
5. **Task 1.2** — DiscoverSection
6. **Task 3.1** — Hero Image optimization
7. **Task 1.3** — ReviewsGallery split
8. **Task 1.5** — CategoryBanners split
9. **Task 2.2** — ReelsShowcase fix
10. **Task 4.1** — Suspense wrappers
11. **Task 3.2** — Video lazy load
12. باقي الـ tasks
