# خطة الأنالتكس الكاملة — SK Bags

> الهدف: نظام تحليلات بمستوى Shopify Analytics **مفصّل على الموقع ده بالذات**.
> كل حاجة في الملف ده هنستخدمها فعلاً. اللي مش هنستخدمه متكتوب في آخر الملف مع سبب الاستبعاد.

---

## 0. الوضع الحالي (الحقيقة من الكود)

### اللي شغال فعلاً
| الحاجة | الحالة |
|---|---|
| `<Analytics />` من `@vercel/analytics` | شغال — [layout.tsx:93](src/app/[locale]/layout.tsx:93) — page views بس، وبيشتغل كمان على صفحات الأدمن (ضياع) |
| صفحة `/admin/analytics` | 4 كروت + عمودين بيانات 14 يوم + top products/governments/recent orders |
| صفحة `/admin` (Dashboard) | 4 كروت + Realtime subscription على `orders` (INSERT) بصوت وتوست |

### المشاكل الحرجة في اللي موجود
1. **أرقام مزيّفة معروضة للأدمن**: `conversion_rate: 2.1` مكتوبة بالإيد في [Dashboard.tsx:99](src/components/admin/pages/Dashboard.tsx:99)، وكل نِسَب النمو (`revenue_growth: 12.5`, `orders_growth: 8.3`, `change: 5.2`, `change: -1.3`) ثوابت مكتوبة بالإيد مش محسوبة.
2. **هينكسر بصمت عند 1000 أوردر**: كل دوال [analytics.ts](src/services/analytics.ts) بتنزّل الجداول كاملة للمتصفح وتجمّع في JS. PostgREST بيقص عند 1000 صف افتراضياً → كل الأرقام هتبقى غلط من غير أي رسالة خطأ.
3. **الأوردرات الملغية محسوبة في الإيراد** — مفيش أي فلتر على `status` في `getDashboardStats` / `getDailyRevenue` / `getTopSellingProducts`.
4. **التجميع اليومي بتوقيت UTC** — `toISOString().split("T")[0]`. أي أوردر بعد 10 مساءً بتوقيت القاهرة بيتحسب على اليوم اللي بعده.
5. **الإيراد المعروض = أوردرات اتعملت، مش أوردرات اتدفعت.** ده أخطر بند. النموذج هنا prepay عن طريق EasyKash، يعني الأوردر بيتكتب في الداتابيز بـ `payment_status = 'unpaid'` **قبل** ما العميل يدفع. الرقم المعروض دلوقتي بيشمل كل حد فتح صفحة الدفع وهرب.
6. **الجداول التحليلية كلها فاضية**: `page_views`, `product_views`, `sessions`, `search_queries`, `carts`, `cart_items`, `audit_logs` — موجودة في الـ schema ومفيش سطر واحد في الكود بيكتب فيها.
7. **صفر بيانات إسناد (attribution)**: مفيش UTM، مفيش referrer، مفيش أي عمود بيقول الأوردر ده جه منين.
8. **صفر بكسلات**: لا Meta Pixel، لا TikTok، لا GA4، لا Conversions API. ده أكبر ثقب لمتجر شنط في مصر بيعتمد على إعلانات فيسبوك/تيك توك.
9. **معرّفين جلسة متعارضين**: `scrub_session_id` (UUID) في [session.ts:2](src/lib/session.ts:2) للأوردرات، و `session_id` (`session_<ts>_<rand>`) في [localStorage.ts:73](src/lib/localStorage.ts:73) للكارت. الاتنين مش بيتقابلوا أبداً → مستحيل نربط الكارت بالأوردر.
10. **مفيش تكلفة منتج (`cost_price`)** → مستحيل نحسب ربح.
11. **الويشليست في الـ localStorage بس** ([localStorage.ts:428](src/lib/localStorage.ts:428)) → أقوى إشارة نية عندنا وإحنا مش شايفينها.
12. **زرار الواتساب برقم وهمي وغير متتبّع**: `wa.me/201234567890` في [AddToCartSection.tsx:151](src/components/product/AddToCartSection.tsx:151).

### الأصول اللي هنبني عليها
- الأوردر بيتعمل **سيرفر-سايد** في [api/orders/route.ts](src/app/api/orders/route.ts) بـ service-role → نقطة تتبع نظيفة ومضمونة.
- التسعير بيتحسب من جديد سيرفر-سايد في [server-pricing.ts](src/lib/server-pricing.ts) → أرقام الإيراد موثوقة.
- **الـ webhook متحقق بـ HMAC-SHA512** في [callback/route.ts:79](src/app/api/payments/easykash/callback/route.ts:79) → لحظة "purchase" مؤكدة 100%، وده اللي هيدّي Conversions API دقة أعلى من أي بكسل.
- `orders.phone_number` موجود على كل أوردر → المفتاح الطبيعي الوحيد للعميل (مفيش حسابات مستخدمين).
- `orders.government` موجود → تحليل جغرافي على مستوى المحافظة جاهز.
- `easykash_payment_method` بيتكتب من الـ callback → توزيع وسائل الدفع الحقيقية.
- `payment_plan` (full/deposit) + `remaining_amount` → مقاييس مستحقات مفيش في شوبيفاي أصلاً.
- Supabase Realtime مستخدم بالفعل → Live View شبه مجاني.
- `recharts@2.12.7` متثبّت وغير مستخدم → رسوم بيانية جاهزة.

---

## 1. الأساس — طبقة البيانات

### 1.1 معرّف جلسة موحّد (كوكي، مقروء من السيرفر)

نلغي الازدواج ونستخدم **كوكي واحدة** بدل الـ localStorage، عشان الـ middleware والـ API routes يقدروا يقروها.

```
sk_sid   → UUID، انتهاء سنة، SameSite=Lax  (معرّف الزائر/الجهاز)
sk_ses   → UUID، انتهاء 30 دقيقة متجددة    (معرّف الجلسة)
```

- تتولد في `middleware.ts` لو مش موجودة → متاحة سيرفر-سايد من أول request.
- `src/lib/session.ts` يبقى المصدر الوحيد؛ `localStorage.ts` يقرأ منه بدل ما يولّد واحد تاني.
- ترحيل: أول تحميل بعد النشر، ناخد `scrub_session_id` القديم من الـ localStorage ونحطه في الكوكي عشان `my-orders` ما يضيعش تاريخ العملاء الحاليين.

### 1.2 جداول جديدة

```sql
-- ============ الجلسات ============
CREATE TABLE analytics_sessions (
  session_id      TEXT PRIMARY KEY,
  visitor_id      TEXT NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- الجهاز والمكان (من Vercel geo headers — مجاني)
  device_type     TEXT CHECK (device_type IN ('desktop','mobile','tablet')),
  browser         TEXT,
  os              TEXT,
  country         TEXT,
  city            TEXT,
  locale          TEXT,

  -- الاكتساب: first-touch (بيتكتب مرة واحدة) + last-touch (بيتحدّث)
  first_utm_source   TEXT, first_utm_medium TEXT, first_utm_campaign TEXT,
  first_utm_content  TEXT, first_utm_term   TEXT,
  first_referrer     TEXT, first_landing_page TEXT,
  last_utm_source    TEXT, last_utm_medium  TEXT, last_utm_campaign TEXT,
  last_referrer      TEXT,
  channel            TEXT,   -- محسوب: facebook | instagram | tiktok | google | direct | referral

  -- معرّفات الإعلانات (لازمة للـ Conversions API)
  fbclid TEXT, fbp TEXT, fbc TEXT, ttclid TEXT, ttp TEXT, gclid TEXT,

  -- تجميعات
  page_view_count INT DEFAULT 0,
  is_bot          BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_asess_started  ON analytics_sessions (started_at DESC);
CREATE INDEX idx_asess_visitor  ON analytics_sessions (visitor_id);
CREATE INDEX idx_asess_channel  ON analytics_sessions (channel, started_at DESC);

-- ============ الأحداث ============
CREATE TABLE analytics_events (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id   TEXT NOT NULL,
  visitor_id   TEXT,
  event_name   TEXT NOT NULL,
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  page_type    TEXT,
  page_url     TEXT,
  product_id   UUID,
  variant_id   UUID,
  color_id     UUID,
  quantity     INT,
  value        NUMERIC(10,2),
  order_id     UUID,
  props        JSONB NOT NULL DEFAULT '{}'::JSONB
);
CREATE INDEX idx_aev_time     ON analytics_events (occurred_at DESC);
CREATE INDEX idx_aev_name     ON analytics_events (event_name, occurred_at DESC);
CREATE INDEX idx_aev_session  ON analytics_events (session_id, occurred_at);
CREATE INDEX idx_aev_product  ON analytics_events (product_id, occurred_at DESC)
  WHERE product_id IS NOT NULL;

-- ============ السلات المتروكة (الجدول المحوري) ============
CREATE TABLE abandoned_carts (
  session_id       TEXT PRIMARY KEY,
  visitor_id       TEXT,

  -- محتوى السلة (لقطة حيّة)
  items            JSONB NOT NULL DEFAULT '[]'::JSONB,  -- [{product_id, name, color, qty, price, image}]
  item_count       INT DEFAULT 0,
  subtotal         NUMERIC(10,2),

  -- البيانات الجزئية: اللي كتبه العميل من غير ما يبعت الأوردر
  customer_name    TEXT,
  phone            TEXT,
  phone_norm       TEXT,
  email            TEXT,
  government       TEXT,
  city             TEXT,
  address          TEXT,
  promo_code_tried TEXT,

  -- أبعد خطوة وصلها
  furthest_stage   TEXT CHECK (furthest_stage IN
    ('cart','checkout_viewed','contact_entered','address_entered','order_submitted','payment_started')),
  has_contact      BOOLEAN GENERATED ALWAYS AS
    (phone_norm IS NOT NULL OR email IS NOT NULL) STORED,

  -- الحالة والاسترداد
  status           TEXT DEFAULT 'active'
    CHECK (status IN ('active','abandoned','contacted','recovered','converted')),
  order_id         UUID,
  contacted_at     TIMESTAMPTZ,
  contact_count    INT DEFAULT 0,
  recovered_at     TIMESTAMPTZ,

  -- إسناد
  channel          TEXT,
  utm_source       TEXT,
  utm_campaign     TEXT,
  device_type      TEXT,

  first_seen_at    TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_abandoned_active ON abandoned_carts (last_activity_at DESC)
  WHERE status IN ('active','abandoned');
CREATE INDEX idx_abandoned_contact ON abandoned_carts (has_contact, subtotal DESC)
  WHERE status IN ('abandoned','contacted');
CREATE INDEX idx_abandoned_phone ON abandoned_carts (phone_norm) WHERE phone_norm IS NOT NULL;
CREATE INDEX idx_abandoned_items ON abandoned_carts USING GIN (items);

-- الأوردر المسترد يشاور على السلة اللي جه منها — عشان نقيس عائد الاسترداد
ALTER TABLE orders ADD COLUMN IF NOT EXISTS recovered_from_cart TEXT;

-- ============ مصروف الإعلانات (إدخال يدوي من الأدمن) ============
CREATE TABLE ad_spend (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day      DATE NOT NULL,
  channel  TEXT NOT NULL,   -- facebook | instagram | tiktok | google | influencer
  campaign TEXT,
  amount   NUMERIC(10,2) NOT NULL,
  UNIQUE (day, channel, campaign)
);
```

**ملاحظة:** الجداول القديمة `page_views` / `product_views` / `search_queries` / `carts` / `cart_items` / `cart_sessions` **فاضية تماماً وميتة**. `analytics_events` بيغطيها كلها. نسيبها لحد ما نتأكد ونمسحها في Phase 6. جدول `sessions` القديم بيتستبدل بـ `analytics_sessions`.

### 1.3 أعمدة جديدة على الجداول الموجودة

```sql
-- إسناد على الأوردر (لقطة وقت الشراء — عشان ما نفقدش الإسناد لو الجلسة اتمسحت)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS utm_source     TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium     TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign   TEXT,
  ADD COLUMN IF NOT EXISTS channel        TEXT,
  ADD COLUMN IF NOT EXISTS landing_page   TEXT,
  ADD COLUMN IF NOT EXISTS device_type    TEXT,
  ADD COLUMN IF NOT EXISTS paid_at        TIMESTAMPTZ,      -- وقت الدفع الفعلي من الـ callback
  ADD COLUMN IF NOT EXISTS phone_norm     TEXT,             -- موحّد: 201XXXXXXXXX
  ADD COLUMN IF NOT EXISTS email          TEXT,             -- إجباري في الفورم (NOT NULL بعد backfill)
  ADD COLUMN IF NOT EXISTS is_first_order BOOLEAN;          -- محسوب وقت الإنشاء

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders (LOWER(email)) WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_phone_norm ON orders (phone_norm);
CREATE INDEX IF NOT EXISTS idx_orders_created    ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_paid_at    ON orders (paid_at DESC) WHERE paid_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_channel    ON orders (channel, created_at DESC);

-- التكلفة (شرط أساسي لأي تقرير ربحية)
ALTER TABLE products         ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2);
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2);
ALTER TABLE order_items      ADD COLUMN IF NOT EXISTS unit_cost  NUMERIC(10,2);  -- لقطة وقت البيع
```

`phone_norm`: كل الأرقام تتحوّل لصيغة واحدة `20XXXXXXXXXX` (إزالة المسافات، `+`، الصفر البادئ، `002`). ده المفتاح الوحيد للعميل — لازم يتعمل كمان **backfill** على الأوردرات القديمة.

### 1.4 الأمان (RLS)

- `analytics_events`, `analytics_sessions`, `cart_snapshots`: **مفيش INSERT من الـ anon key نهائياً**. الكتابة كلها عن طريق `/api/track` بالـ service role. لو سبناها مفتوحة، أي حد يقدر يزوّر مليون حدث ويفسد كل التقارير.
- القراءة: `SELECT` للأدمن بس، عن طريق RPC functions بـ `SECURITY DEFINER`.
- `ad_spend`: أدمن فقط.

---

## 2. طبقة التتبع

### 2.1 نقطة استقبال واحدة

`POST /api/track` — endpoint واحد، service role، بيعمل:
1. يقرا `sk_sid` / `sk_ses` من الكوكي (مش من الـ body — عشان ما يتزوّرش).
2. Upsert على `analytics_sessions` (first-touch يتكتب مرة واحدة بـ `COALESCE`، last-touch يتحدّث).
3. Insert في `analytics_events`.
4. فلترة البوتات بـ user-agent + تجاهل كل المسارات اللي فيها `/admin`.
5. Rate limit بسيط لكل جلسة.

على الكلاينت: `src/lib/track.ts` فيه `track(eventName, payload)` بيستخدم `navigator.sendBeacon` (ما يعطلش التنقل) مع `fetch keepalive` كـ fallback، وبيعمل batching كل ثانيتين.

### 2.2 قائمة الأحداث (نهائية — مش أكتر ولا أقل)

| الحدث | مكان الإطلاق | البيانات المهمة |
|---|---|---|
| `page_view` | كل تنقّل | `page_type`, `page_url` |
| `view_product` | [ProductDetailContent.tsx](src/components/product/ProductDetailContent.tsx) | `product_id`, `value` |
| `select_color` | اختيار لون في صفحة المنتج | `product_id`, `color_id` |
| `add_to_cart` | `useCart.addItem` | `product_id`, `variant_id`, `color_id`, `quantity`, `value` |
| `remove_from_cart` | `useCart.removeItem` | نفس البيانات |
| `view_cart` | `/cart` | `value`, `item_count` |
| `begin_checkout` | تحميل `/checkout` | `value`, `item_count` |
| `contact_info_entered` | أول تليفون/إيميل صالح يتكتب | `props.has_phone`, `props.has_email` ← **بوابة الاسترداد** |
| `add_shipping_info` | اختيار المحافظة | `props.government` |
| `promo_applied` / `promo_rejected` | [PromoCodeInput.tsx](src/components/checkout/PromoCodeInput.tsx) | `props.code`, `props.reason` |
| `submit_order` | نجاح `POST /api/orders` (سيرفر) | `order_id`, `value` |
| `payment_started` | قبل التحويل لـ EasyKash | `order_id`, `value` |
| `purchase` | **الـ callback المتحقق بس** | `order_id`, `value`, `props.method` |
| `payment_failed` | callback فشل / انتهاء صلاحية | `order_id`, `props.reason` |
| `search` | البحث | `props.query`, `props.results_count` |
| `search_no_results` | نتيجة = 0 | `props.query` ← ذهب خالص لتخطيط المنتجات |
| `search_click` | ضغط على نتيجة | `props.query`, `product_id` |
| `filter_apply` | فلاتر صفحة المنتجات | `props.filters` |

**قاعدة:** `submit_order`, `payment_started`, `purchase`, `payment_failed` **سيرفر-سايد فقط**. الأحداث دي هي أساس الإيراد ومينفعش تعتمد على متصفح ممكن يقفل أو يتحجب بـ ad blocker.

### 2.3 التقاط السلة والبيانات الجزئية

`POST /api/track/cart` → upsert في `abandoned_carts`. مصدرين للكتابة:

**أ) محتوى السلة** — `useCart` بيعمل debounce 3 ثواني ويبعت العناصر. الكارت دلوقتي في الـ localStorage بس، فده اللي بيخلّي الموضوع ممكن أصلاً.

**ب) بيانات الفورم قبل الإرسال** — [CheckoutForm.tsx:91](src/components/checkout/CheckoutForm.tsx:91) بيحفظ الفورم في `localStorage["checkout_form_data"]` بالفعل، فالسباكة موجودة؛ نخليه يبعت للسيرفر كمان.

قواعد الالتقاط (مهمة عشان الداتا ما تبقاش زبالة):
- **على `blur` مش على كل حرف** + debounce ثانيتين. الكتابة حرف بحرف = ضجيج وتكلفة من غير فايدة.
- **تحقق قبل التخزين**: الإيميل يتخزن بس لو عدّى regex صالح؛ التليفون بس لو ≥ 10 أرقام بعد التنظيف. من غير الشرط ده الجدول هيمتلي بـ `"ahm"` و `"010"` وتبقى القايمة غير قابلة للاستخدام.
- **flush أخير** على `visibilitychange` (hidden) و `pagehide` بـ `sendBeacon` — أهم لحظة، دي بالظبط لحظة الهروب.
- `furthest_stage` بيتحدّث للأمام بس، عمره ما يرجع لورا.
- **ممنوع نهائياً**: أي بيانات دفع. ومش مشكلة أصلاً — EasyKash مستضيفة صفحة الدفع، فمفيش حقول كارت في الموقع من الأساس.
- تجاهل الجلسات اللي `is_bot`.

**ملاحظة قانونية (مهمة):** تخزين تليفون/إيميل قبل ما العميل يضغط إرسال بيقع تحت قانون حماية البيانات الشخصية المصري ١٥١/٢٠٢٠. التخفيف بسيط ومعياري (شوبيفاي بيعمل نفس الحاجة): سطر واضح تحت الفورم — «بنحفظ بياناتك عشان نقدر نساعدك تكمل طلبك» — وبند في سياسة الخصوصية. مش حاجز، بس لازم تتعمل.

---

## 3. تعريفات المقاييس (Parity مع شوبيفاي + إضافات خاصة بينا)

كل الحسابات بتوقيت **`Africa/Cairo`**:
```sql
(created_at AT TIME ZONE 'Africa/Cairo')::DATE
```

### مقاييس الفلوس
| المقياس | التعريف |
|---|---|
| Gross sales | `SUM(subtotal)` |
| Discounts | `SUM(discount_amount)` |
| Net sales | Gross − Discounts |
| Shipping | `SUM(shipping_cost)` |
| **Total sales** | `SUM(total)` |
| **Placed revenue** | Total sales لكل الأوردرات (ناقص الملغية) |
| **Paid revenue** ⭐ | Total sales حيث `payment_status = 'paid'` |
| **Cash collected** ⭐ | `payment_plan='full'` → `total` ؛ `payment_plan='deposit'` → `deposit_amount` |
| **Receivables** ⭐ | `SUM(remaining_amount)` للمقدّمات المدفوعة غير المسلّمة |
| AOV | Paid revenue ÷ الأوردرات المدفوعة |
| Gross margin | Paid revenue − `SUM(quantity × unit_cost)` − Shipping cost |

⭐ = مفيش في شوبيفاي، وهي الأهم للنموذج بتاعنا.

### مقاييس التحويل
| المقياس | التعريف |
|---|---|
| Sessions | جلسات فريدة بحدث واحد على الأقل (نافذة خمول 30 دقيقة) |
| Order CR | أوردرات مُنشأة ÷ Sessions |
| **Paid CR** ⭐ | أوردرات مدفوعة ÷ Sessions ← **رقم التحويل الحقيقي** |
| **Payment completion rate** ⭐ | أوردرات مدفوعة ÷ أوردرات مُنشأة |
| Cart abandonment | 1 − (begin_checkout ÷ add_to_cart) |
| **Payment abandonment** ⭐ | 1 − Payment completion rate |
| Product CR | مشتريات ÷ مشاهدات المنتج (لكل منتج) |

الفرق بين **Order CR** و **Paid CR** هو أهم رقم في النظام كله. لو الفجوة كبيرة، المشكلة في بوابة الدفع مش في الموقع.

### مقاييس العملاء (المفتاح = `phone_norm`)
Returning customer rate، Repeat purchase rate، متوسط المدة بين الأوردرات، CLV، تقسيم RFM، Cohort retention شهري.

---

## 4. القمع (Funnel) — 7 خطوات

شوبيفاي عنده 4. إحنا عندنا 8 لأن الدفع منفصل عن إنشاء الأوردر، وكمان بنشوف لحظة كتابة بيانات التواصل:

```
1. Session               ████████████████████  100%
2. View product          ██████████████         xx%
3. Add to cart           ████████               xx%
4. Begin checkout        ██████                 xx%
5. Contact entered       █████                  xx%   ← من هنا ورايح نقدر نكلّمه
6. Order submitted       ████                   xx%
7. Payment page reached  ███                    xx%   ← EasyKash redirect
8. Paid ✓                ██                     xx%   ← callback متحقق
```

**خطوة 5 هي الفاصل التشغيلي.** أي حد وصلها ومكمّلش = ليد قابل للاسترداد بوسيلة تواصل. اللي وقف قبلها = رقم في تقرير بس.

كل خطوة معاها: العدد، نسبة التحويل من اللي قبلها، الفرق عن الفترة السابقة، والفلوس الضايعة بالجنيه. أكبر تسريب يتلوّن أحمر تلقائياً.

القمع مقسوم على: الجهاز (موبايل/ديسكتوب)، القناة (فيسبوك/تيك توك/direct)، المحافظة.

---

## 5. التقارير — التقسيم النهائي

### 5.1 Overview
KPI cards: Paid revenue · Cash collected · Orders (مدفوع/مُنشأ) · Paid CR · AOV · Returning rate · Receivables — كل واحد بمقارنة مع الفترة السابقة (نسبة **محسوبة**، مش مكتوبة بالإيد).
تحته: خط الإيراد اليومي (مُنشأ vs مدفوع على نفس الرسم)، القمع المختصر، أفضل 5 منتجات، توزيع المحافظات، آخر الأوردرات.

### 5.2 Sales
- الإيراد عبر الزمن (يوم / أسبوع / شهر) مع مقارنة فترة
- حسب المنتج · حسب اللون/الفاريانت ← **مهم جداً لمتجر شنط**
- حسب المحافظة (خريطة/جدول)
- حسب وسيلة الدفع الفعلية (`easykash_payment_method`: كارت / محفظة / فوري / أمان / ميزة)
- حسب خطة الدفع (كامل vs مقدّم 50%)
- حسب كود الخصم (`discount_code`) + عمق الخصم
- **حسب ساعة اليوم ويوم الأسبوع** ← بيحدد جدولة الإعلانات
- ملخص مالي: Gross → Discounts → Net → Shipping → Total → Paid

### 5.3 Funnel & Behavior
- القمع الكامل (فوق)
- صفحات الهبوط الأعلى (sessions, CR, revenue)
- **كلمات البحث** + **البحث بدون نتائج** ← أوضح إشارة لمنتجات ناقصة
- أداء الألوان: أي لون بيتشاف وأي لون بيتشترى
- توزيع الأجهزة والمتصفحات

**تقرير المنتج الكامل** — صف لكل منتج، مستقل تماماً عن إتمام الشراء:

| العمود | المصدر |
|---|---|
| مشاهدات | `view_product` |
| **مرات الإضافة للسلة** ⭐ | `add_to_cart` — **الرقم اللي طلبته: بيتحسب حتى لو الشراء ما تمّش خالص** |
| نسبة مشاهدة → سلة | إشارة قوة الصفحة (صور/وصف/سعر) |
| مرات الشيل من السلة | `remove_from_cart` ← **إشارة سعر مباشرة** |
| مشتريات (مدفوعة) | `purchase` |
| **نسبة سلة → شراء** ⭐ | الرقم الحاسم |
| **مرات ظهوره في سلة متروكة** ⭐ | من `abandoned_carts.items` |
| الفلوس العالقة | مجموع قيمته جوه السلات المتروكة |

الترتيب الافتراضي: **الأكتر إضافة للسلة**. والشريحة اللي بتتفرج عليها كل أسبوع: **إضافة عالية + شراء واطي** — ده منتج الناس عايزاه وفي حاجة بتمنعها. غالباً السعر، أو الشحن، أو مفيش ثقة كفاية. ده أوضح مؤشر تسعير هيكون عندك.

### 5.4 Customers
- عملاء جدد vs عائدين عبر الزمن
- Cohort retention (شهر التسجيل × شهر الشراء)
- تقسيم RFM: أبطال · مخلصين · معرّضين للفقد · نائمين · مشتري لمرة واحدة
- أعلى العملاء بالقيمة (بالتليفون) + زر واتساب مباشر
- CLV حسب قناة الاكتساب ← يقول أي إعلان بيجيب عملاء بيرجعوا

### 5.5 Marketing & Attribution
- Sessions / أوردرات / إيراد مدفوع حسب `utm_source` · `utm_campaign` · `channel`
- First-touch vs Last-touch جنب بعض
- **ROAS و CAC حقيقيين** من جدول `ad_spend`:
  `ROAS = Paid revenue ÷ Ad spend` · `CAC = Ad spend ÷ عملاء جدد`
  (شوبيفاي محتاج تطبيق مدفوع للحتة دي)
- أداء الحملات على مستوى الحملة

### 5.6 Operations
- قمع حالة الأوردر: pending → confirmed → shipped → delivered
- متوسط الوقت بين كل حالتين
- نسبة الإلغاء حسب المحافظة ← بيحدد مناطق مشاكل التوصيل
- **قائمة الدفع المتروك**: أوردرات `payment_status IN ('unpaid','pending','expired','failed')` أقدم من 30 دقيقة — **مع رقم التليفون** + زر واتساب بنص جاهز. ده أسرع فلوس مرجّعة في النظام كله.
- المستحقات: أوردرات المقدّم اللي لسه ليها باقي

### 5.7 Live View
آخر 30 دقيقة: زوار نشطين · كارتات نشطة (من `cart_snapshots`) · أوردرات النهارده · خريطة المحافظات · آخر الأحداث. عن طريق Supabase Realtime (النمط مستخدم بالفعل في [Dashboard.tsx:55](src/components/admin/pages/Dashboard.tsx:55)).

### 5.8 Profit (بعد إضافة `cost_price`)
هامش الربح لكل منتج · لكل أوردر · لكل قناة · يومي. صافي الربح بعد الشحن والخصومات ومصروف الإعلانات.

---

## 6. طبقة الحساب (Performance)

**قاعدة: صفر تجميع في المتصفح.** كل شيء عن طريق Postgres RPC functions بـ `SECURITY DEFINER`:

```
analytics_kpis(p_from, p_to)                → الفترة الحالية + السابقة في استعلام واحد
analytics_timeseries(p_from, p_to, p_grain) → سلسلة زمنية بتوقيت القاهرة
analytics_funnel(p_from, p_to, p_segment)
analytics_top_products(p_from, p_to, p_limit)
analytics_by_governorate(p_from, p_to)
analytics_by_channel(p_from, p_to)          → مع ROAS من ad_spend
analytics_customers_rfm()
analytics_cohorts(p_months)
analytics_abandoned_payments(p_minutes)
analytics_search_terms(p_from, p_to)
```

كل الدوال بتاخد الفترة كمعامل، بترجّع صفوف مجمّعة جاهزة، وبتستثني `status = 'cancelled'` افتراضياً. ده بيحل مشكلة الـ 1000 صف نهائياً.

Materialized view `analytics_daily` (تحديث ليلي بـ pg_cron) **مطلوب بس لما `analytics_events` تعدّي ~100 ألف صف**. قبل كده الـ RPC على فهارس كويسة كفاية.

سياسة الاحتفاظ: `analytics_events` أقدم من 18 شهر تتحوّل لملخص يومي وتتمسح.

---

## 7. البكسلات والتحويلات (أكبر مكسب فوري)

### 7.1 Meta
- **Pixel (كلاينت)**: `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`
- **Conversions API (سيرفر)**: `Purchase` من الـ callback المتحقق بـ HMAC — [callback/route.ts:79](src/app/api/payments/easykash/callback/route.ts:79)
- **إزالة التكرار**: نفس `event_id` (نستخدم `order_id`) في الاتنين
- بيانات مطابقة متقدمة (كلها SHA-256): **`email`** ← أقوى مفتاح · `phone_norm` · الاسم الأول/الأخير · المدينة · الدولة
- **ليه ده مهم**: بعد iOS ATT، البكسل لوحده بيفقد 20–35% من التحويلات. الـ CAPI من الـ webhook بيوصل ~100%. ده بيحسّن دقة استهداف فيسبوك مباشرة ويقلل تكلفة الأوردر.

### 7.2 TikTok
نفس النمط: Pixel + Events API، `ttclid` متخزّن على الجلسة، `CompletePayment` من السيرفر.

### 7.3 قرارات
- ❌ **GA4** — بعد ما يبقى عندنا first-party analytics كامل، GA4 مش هيضيف حاجة. نضيفه بس لو اشتغلنا Google Ads.
- ❌ **Google Tag Manager** — طبقة تعقيد زيادة لموقعين بكسل بس.
- ⚠️ **Vercel Analytics** — نستثنيه من صفحات الأدمن دلوقتي، ونشيله خالص بعد Phase 2 (هيبقى مكرر).
- ➕ **Snapchat Pixel** — بس لو فعلاً بيعلنوا على سناب.

---

## 8. واجهة الأدمن

`/admin/analytics` تتعاد بالكامل:

- **Date range picker** فوق: النهارده · أمس · 7 أيام · 30 يوم · هذا الشهر · مخصص + toggle "قارن بالفترة السابقة". بتوقيت القاهرة. الاختيار متخزّن في الـ URL (`?from=&to=&compare=1`) عشان اللينك يتشارك.
- **تابات**: Overview · Sales · Funnel · Products · Customers · Marketing · Operations · Live
- كل كارت فيه زر **تصدير CSV**
- **`recharts` بدل الـ div bars المرسومة بالإيد** — متثبّتة بالفعل ومش مستخدمة
- كل الأرقام المزيّفة تتشال أو تتحسب فعلاً
- الـ Sidebar: قوائم فرعية تحت Analytics + إظهار الصفحات اليتيمة (`shipping`, `promo-codes`, `faq`, `social-proof`, `top-banner`, `customer-love`, `design`) اللي موجودة ومش ظاهرة في [Sidebar.tsx:35](src/components/admin/layout/Sidebar.tsx:35)

---

## 9. التنبيهات والأتمتة

| التنبيه | الشرط | القناة |
|---|---|---|
| ملخص يومي | 9 صباحاً القاهرة | واتساب/تيليجرام للأدمن |
| دفع متروك | أوردر `unpaid` عدّى 30 دقيقة | صف في قائمة الاسترداد + زر `wa.me` بنص جاهز |
| صفر أوردرات | مفيش أوردر مدفوع من 6 ساعات في وقت الذروة | تنبيه فوري |
| ارتفاع فشل الدفع | نسبة الفشل > 30% في ساعة | تنبيه فوري (مشكلة في EasyKash) |
| بحث بدون نتائج | نفس الكلمة 10 مرات في أسبوع | ملخص أسبوعي |

استرداد الدفع المتروك: نبدأ بـ **قائمة يدوية + رابط واتساب** (رخيص ومباشر). الإرسال التلقائي محتاج WhatsApp Business API — مرحلة تانية لو الأرقام برّرت.

---

## 10. فيتشرز لازم تتضاف — لأنها هي اللي بتولّد البيانات

التحليلات مش بتخترع بيانات؛ بتقيس اللي الموقع بيعمله. الفيتشرز دي متختارة عشان كل واحدة فيها **تفتح تقرير مقفول دلوقتي**.

### الأولوية 1 — رخيصة وعائدها فوري

**1.1 سؤال "عرفت عننا منين؟" في صفحة نجاح الأوردر**
سؤال واحد اختياري بعد الشراء: فيسبوك · إنستجرام · تيك توك · حد رشحلي · بحث جوجل · مؤثر · تاني.
**ليه:** في السوق المصري جزء كبير من الترافيك "مظلم" — لينك من بايو إنستجرام، شير في واتساب، DM، كلام مؤثر. الـ UTM **مش هيشوف أي منها**. ده الطريق الوحيد لإسناده.
**بيفتح:** مزيج القنوات الحقيقي، وتعيير الـ UTM (تقارن المُبلَّغ ذاتياً بالـ UTM وتعرف حجم الفجوة المظلمة).
`analytics_events` → `attribution_survey` · عمود `orders.self_reported_source`

**1.2 تتبّع زرار الواتساب + إصلاح الرقم**
الرقم دلوقتي `201234567890` وهمي في [AddToCartSection.tsx:151](src/components/product/AddToCartSection.tsx:151)، والضغطة مش متتبّعة.
نصلّح الرقم، نحط اسم المنتج في الرسالة الجاهزة، ونطلق `whatsapp_click` ومعاه `product_id`.
**بيفتح:** **نسبة استفسار الواتساب لكل منتج** — منتج مشاهداته عالية + استفسارات عالية + تحويل واطي = معلومات ناقصة (مقاس؟ خامة؟ سعر؟). ده مقياس احتكاك مفيش في شوبيفاي، وخاص بالسوق هنا.
مكسب جانبي: فريق المبيعات بيعرف العميل بيسأل على إيه من غير ما يسأله.

**1.3 الويشليست تتخزن سيرفر-سايد**
موجودة بس في الـ localStorage — [localStorage.ts:428](src/lib/localStorage.ts:428). ننقلها لجدول `wishlists (visitor_id, product_id, phone_norm, created_at)`.
**ليه:** أقوى إشارة نية بعد `add_to_cart` مباشرة، وإحنا رامينها.
**بيفتح:** نسبة ويشليست→شراء · **أكتر منتج بيتحفظ ومبيتشتريش** (= مشكلة سعر) · جمهور retargeting جاهز لفيسبوك · قايمة أولوية للخصومات المستهدفة.

**1.4 الإيميل حقل إجباري في الشيك أوت** ✅ متأكد عليه
الأوردر دلوقتي فيه تليفون بس. الإيميل يبقى **required** مع validation.
**ليه:** هاش الإيميل هو **أقوى مفتاح مطابقة في Meta CAPI** — أقوى من التليفون. وجوده على 100% من الأوردرات (مش 40% زي لو كان اختياري) بيرفع match rate بشكل كبير وبيقلل تكلفة الأوردر مباشرة. وكمان بيفتح تأكيد الأوردر والمتابعة بالإيميل، وبيدّي مفتاح هوية تاني جنب التليفون.

**تنبيه على القرار:** الإجباري بيضيف احتكاك — شريحة من العملاء (خصوصاً موبايل-فيرست) مش فاكرة إيميلها. متوقع نزول بسيط في `begin_checkout → submit_order`.
**مش تخمين — هنقيسه:** القمع في Phase 2 بيقيس الخطوة دي بالظبط. لو النزول طلع أكبر من المكسب في match rate، نرجّعه اختياري. القرار هيبقى على رقم مش على رأي.
تخفيف الاحتكاك من غير ما نفقد الحقل: keyboard type=email، اقتراحات دومين (`@gmail.com`)، ورسالة خطأ واضحة بالعربي.

### الأولوية 2 — هوية العميل (الأساس لكل تحليل عملاء)

**2.1 "أوردراتي" بالتليفون بدل الجلسة**
دلوقتي [my-orders/page.tsx:90](src/app/[locale]/my-orders/page.tsx:90) شغالة على معرّف الجلسة → العميل يمسح المتصفح يفقد كل تاريخه، والعميل اللي دخل من الموبايل والابتوب بيتحسب **شخصين مختلفين**.
الحل: إدخال تليفون + OTP على واتساب (أو للنسخة الأولى: تليفون + رقم آخر أوردر، من غير OTP).
**ليه ده الأهم في القايمة:** من غيره كل أرقام CLV و RFM و Cohorts و "نسبة العائدين" **هتبقى غلط بشكل منهجي** — لأن العميل العائد من جهاز تاني بيتعدّ عميل جديد. مش هتعرف إنها غلط، هتاخد قرارات عليها.
مكسب جانبي: الكارت بيتنقل بين الأجهزة.

**2.2 جدول `customers` مشتق من `phone_norm`**
مش نظام حسابات — جدول مشتق بيتحدّث تلقائياً من الأوردرات:
`phone_norm` (PK) · `name` · `email` · `first_order_at` · `last_order_at` · `orders_count` · `paid_orders_count` · `total_spent` · `governorate` · `first_touch_channel` · `self_reported_source` · `tags`
**بيفتح:** كل تقارير العملاء تبقى استعلام واحد على فهرس بدل مسح جدول الأوردرات · صفحة عميل حقيقية في الأدمن · شرائح RFM جاهزة للتصدير كجمهور مخصص لفيسبوك.

### الأولوية 3 — رافعات متوسط قيمة الأوردر (وكل واحدة معاها تقرير)

**3.1 الباندلز / "الطقم"** — جداول `bundles` و `bundle_items` موجودة في الـ schema ومش مستخدمة.
شنطة + محفظة، أو طقم 3 قطع.
**بيفتح:** attach rate · رفع الـ AOV من الباندل · هامش الباندل مقابل القطعة المفردة.

**3.2 "اشتري معاه" / منتجات مرتبطة** — جدول `related_products` موجود و [products.ts](src/services/products.ts) بيقراه بالفعل، بس مش معروض بتتبّع.
نعرضه ونتتبّع الظهور والضغط.
**بيفتح:** CTR التوصيات + **الإيراد المنسوب للتوصية** — ده بالظبط تقرير Product recommendation conversions اللي في شوبيفاي.

**3.3 آخر ما شاهدت** — رخيصة، بترفع التحويل، وبتدّي مسار التصفح.
**بيفتح:** طول رحلة التصفح قبل الشراء · المنتجات اللي بتتقارن ببعض.

### الأولوية 4 — الاسترداد والاحتفاظ

**4.1 إشعارات حالة الأوردر على واتساب** (تأكيد · شُحن · وصل)
**بيفتح:** الوعد مقابل الفعلي في التوصيل · وبتقلل رسايل "فين أوردري" بشكل كبير.

**4.2 طلب تقييم بعد التوصيل** — `product_reviews.is_verified_purchase` موجود، و [ReviewDialog.tsx](src/components/orders/ReviewDialog.tsx) موجود، **ومفيش حاجة بتطلب التقييم أصلاً**.
رسالة واتساب بعد 3 أيام من التسليم فيها لينك مباشر.
**بيفتح:** ارتباط التقييم بنسبة التحويل لكل منتج · مواضيع الشكاوى المتكررة · محتوى social proof مجاني.

**4.3 برنامج إحالة** — بنية `promo_codes` موجودة بالكامل؛ نولّد كود لكل عميل.
**بيفتح:** الإحالة تبقى **قناة اكتساب قابلة للقياس بـ CAC حقيقي** — وغالباً هتطلع أرخص قناة عندك، بس دلوقتي مفيش طريقة تعرف بيها.

**4.4 اشتراك واتساب / نشرة** — بناء جمهور مملوك.
**بيفتح:** نمو القايمة · نسبة القايمة→شراء · قناة إعادة تسويق بتكلفة صفر.

### الأولوية 5 — البحث والاكتشاف

**5.1 تطبيع البحث العربي** — `ا/أ/إ/آ` · `ة/ه` · `ى/ي` · التشكيل · المسافات.
**ليه ده شرط مش تحسين:** من غيره تقرير "بحث بدون نتائج" هيمتلي بنتايج خاطئة، وهتقرأها إن "المنتج ناقص" وهي أصلاً مشكلة مطابقة حروف. **البيانات هتبقى مضلِّلة، وده أسوأ من عدم وجودها.**

**5.2 تتبّع الفلاتر** — [SearchAndFilters.tsx](src/components/navigation/SearchAndFilters.tsx) شغالة على URL params بالفعل، محتاجة `filter_apply` بس.
**بيفتح:** أي فلاتر بتتستخدم فعلاً · فلاتر بترجّع صفر نتايج (= فجوة في الكتالوج).

### القرار الكبير — استنى الأرقام

**الدفع عند الاستلام (COD) أو مقدّم أصغر**
دلوقتي الدفع مسبق بالكامل عن طريق EasyKash، ومفيش COD حقيقي (`'cash'` قيمة افتراضية بس في الكود). في مصر شريحة كبيرة مش هتدفع مقدّم لمتجر لسه ما تعاملتش معاه.
عندكم `payment_plan` (كامل / مقدّم 50%) موجود بالفعل — مقدّم أصغر (مثلاً قيمة الشحن بس) وسط بيشيل حاجز الدفع المسبق ولسه بيفلتر الأوردرات الوهمية.
**متقررش دلوقتي.** Phase 0 هيدّيك **Payment completion rate**. لو طلعت تحت ~60%، فده أكبر بند إيراد في القايمة كلها — وساعتها هيبقى معاك الرقم اللي يثبته بدل التخمين.

### ناحية الأدمن

**`audit_logs` تشتغل** — الجدول موجود وميت. مين غيّر سعر، مين مسح منتج، مين عدّل كود خصم. بيبقى مهم أول ما يبقى فيه أكتر من شخص على الأدمن.
**`cost_price`** — مذكور في §1.3، وهو الشرط الوحيد لأي تقرير ربحية.

---

## 11. خريطة التنفيذ

### Phase 0 — إصلاح الأكاذيب (أسبوع 1) 🔴 عاجل
- شيل `conversion_rate: 2.1` وكل نِسَب النمو المزيّفة من [Dashboard.tsx](src/components/admin/pages/Dashboard.tsx)
- استثنِ الأوردرات الملغية من كل حسابات الإيراد
- التجميع بتوقيت `Africa/Cairo`
- **افصل Placed revenue عن Paid revenue** في كل مكان
- انقل التجميع لـ RPC functions ← بيمنع الانكسار الصامت عند 1000 أوردر
- Date range picker + مقارنة فترة

**المخرجات**: أرقام صحيحة. ده مش تحسين — الأرقام المعروضة دلوقتي غلط.

### Phase 1 — الأساس (أسبوع 2)
**أنالتكس:** كوكي جلسة موحّدة · `analytics_sessions` + `analytics_events` + `cart_snapshots` · `/api/track` · التقاط UTM · أعمدة الإسناد على `orders` · `phone_norm` + backfill
**فيتشرز (§10):** سؤال "عرفت عننا منين؟" (1.1) · إصلاح وتتبّع زرار الواتساب (1.2) · حقل الإيميل الاختياري (1.4)
> الفيتشرز التلاتة دي **لازم تنزل مع الأساس مش بعده** — كل يوم من غيرها = يوم بيانات ضايع مش هيترجّع.

### Phase 2 — التتبع والقمع (أسبوع 3)
**أنالتكس:** تركيب كل الأحداث · تقرير القمع السباعي · تقارير السلوك (بحث/صفحات هبوط/تحويل المنتج) · Live View
**فيتشرز:** الويشليست سيرفر-سايد (1.3) · تطبيع البحث العربي (5.1) · تتبّع الفلاتر (5.2)
> تطبيع البحث **قبل** ما نطلع تقرير "بحث بدون نتائج"، مش بعده — وإلا هنقرأ التقرير غلط من أول يوم.

### Phase 3 — التسويق (أسبوع 4) 💰 أعلى عائد
Meta Pixel + CAPI · TikTok Pixel + Events API · تقارير الإسناد · `ad_spend` → ROAS/CAC
> حقل الإيميل من Phase 1 بيرفع match rate هنا مباشرةً — عشان كده هو بدري في الترتيب.

### Phase 4 — العملاء (أسبوع 5)
**أنالتكس:** عائد vs جديد · RFM · Cohorts · CLV حسب القناة · أعلى العملاء
**فيتشرز:** "أوردراتي" بالتليفون (2.1) · جدول `customers` (2.2)
> **2.1 شرط مسبق مش إضافة.** من غيرها كل أرقام العملاء في المرحلة دي هتبقى غلط بشكل منهجي (العميل من جهازين = عميلين).

### Phase 5 — الفلوس والعمليات (أسبوع 6)
**أنالتكس:** `cost_price` + تقارير الهامش · لوحة المستحقات · **قائمة استرداد الدفع المتروك** · تقارير العمليات
**فيتشرز:** إشعارات حالة الأوردر على واتساب (4.1) · طلب التقييم بعد التوصيل (4.2)
> هنا كمان بيبقى معانا **Payment completion rate** من Phase 0 بشهر بيانات → وقت قرار الـ COD / المقدّم الأصغر.

### Phase 6 — النمو
باندلز (3.1) · "اشتري معاه" بتتبّع (3.2) · آخر ما شاهدت (3.3) · برنامج إحالة (4.3) · اشتراك واتساب (4.4)
> كلها رافعات AOV واكتساب، وكل واحدة فيها بتفتح تقريرها الخاص. اتأخرت لأنها بتحتاج طبقة القياس تبقى شغالة الأول عشان نعرف إذا نفعت ولا لأ.

### Phase 7 — التلميع
تصدير CSV في كل مكان · العروض المحفوظة · الملخص اليومي · التنبيهات · `audit_logs` · حذف الجداول الميتة · سياسة الاحتفاظ

---

## 12. اللي مش هننفذه — ومعاه السبب

| المستبعد | السبب |
|---|---|
| تقارير POS / نقاط البيع | مفيش فرع فعلي |
| قنوات بيع متعددة (أمازون / Shop app / إنستجرام شوب) | متجر واحد بس |
| تقارير الضرائب | مفيش عمود ضريبة ومفيش تحصيل ضريبة على الأوردرات |
| تقارير المرتجعات والاسترداد | مفيش استرداد منفّذ؛ `payment_status='refunded'` موجودة في الـ CHECK بس مفيش كود بيكتبها. الإلغاء بس هو اللي متتبّع |
| كروت الهدايا | مش موجودة |
| تقارير تعدد العملات | EGP بس |
| تحليلات شركات الشحن | مفيش تكامل مع شركة شحن |
| Benchmarks ضد متاجر شبيهة | مستحيل — مفيش بيانات مقارنة |
| تحليلات الإيميل التسويقي | مفيش عمود إيميل على الأوردرات أصلاً (تليفون بس)، والقناة هنا واتساب |
| تقارير حسابات العملاء / تسجيل الدخول | مفيش نظام حسابات للمتسوقين |
| B2B / اشتراكات / أسعار جملة | مش في نموذج العمل |
| تحليل الاحتيال | حجم صغير + الدفع كله مسبق عن طريق EasyKash (مفيش chargeback risk عندنا) |
| Session recording / Heatmaps (Hotjar, Clarity) | ثقيل على الأداء ومش قابل للتصرف على المدى القريب. ممكن نعيد النظر بعد Phase 3 |
| GA4 / GTM | مكرر مع الـ first-party analytics بتاعنا. نضيفه بس لو دخلنا Google Ads |
| A/B testing framework | حجم الترافيك مش هيوصل لدلالة إحصائية دلوقتي |
| تقارير المخزون (sell-through / أيام التغطية / الراكد) | مش مطلوبة — قرار العمل إن المخزون ملوش لازمة هنا |
| نقاط ولاء / Gift cards / اشتراكات | تعقيد تشغيلي أكبر من العائد على الحجم ده |

---

## 13. مقارنة سريعة مع شوبيفاي

| القدرة | شوبيفاي | إحنا بعد الخطة |
|---|---|---|
| مبيعات عبر الزمن، حسب المنتج/المكان | ✅ | ✅ |
| قمع التحويل | ✅ 4 خطوات | ✅ **7 خطوات** |
| Live view | ✅ | ✅ |
| العملاء العائدين / Cohorts / RFM | ✅ | ✅ (بالتليفون) |
| إسناد UTM | ✅ | ✅ first + last touch |
| Meta CAPI سيرفر-سايد | ⚠️ تطبيق | ✅ من webhook متحقق |
| ROAS / CAC | ⚠️ تطبيق مدفوع | ✅ داخلي |
| هامش الربح | ⚠️ خطة أعلى | ✅ بعد `cost_price` |
| **قمع الدفع (مُنشأ vs مدفوع)** | ❌ مش موجود | ✅ ⭐ |
| **مستحقات خطة المقدّم** | ❌ | ✅ ⭐ |
| **تحليل على مستوى المحافظة المصرية** | ⚠️ عام | ✅ ⭐ |
| **استرداد بالواتساب** | ❌ (إيميل) | ✅ ⭐ |
| POS / قنوات متعددة / ضرايب | ✅ | ❌ مقصود |

---

## 14. أول 5 حاجات نبدأ بيها

1. شيل الأرقام المزيّفة من الداشبورد — الأدمن بياخد قرارات على `2.1%` مخترعة
2. اطلع الـ RPC functions ← الأرقام هتنكسر بصمت عند 1000 أوردر
3. افصل **Paid revenue** عن **Placed revenue** ← غالباً الإيراد الحقيقي أقل بكتير من المعروض
4. Meta Pixel + CAPI ← أكبر عائد فوري على فلوس الإعلانات
5. قائمة الدفع المتروك + واتساب ← فلوس على الأرض دلوقتي حالاً

### وحاجتين "نزّلهم النهارده" مستقلين عن كل ده
لأنهم **بيبدأوا يجمّعوا بيانات فوراً**، وكل يوم تأخير = بيانات ضايعة مش هترجع:
- سؤال **"عرفت عننا منين؟"** في صفحة نجاح الأوردر (§10 / 1.1)
- **إصلاح رقم الواتساب** الوهمي `201234567890` + تتبّع الضغطة (§10 / 1.2) — ده كمان bug شغّال دلوقتي بيضيّع استفسارات حقيقية
