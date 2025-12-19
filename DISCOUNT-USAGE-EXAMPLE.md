# استخدام نظام الخصم الجديد

## البيانات المُحدثة من API

```json
{
  "succeeded": true,
  "message": "Discount code applied successfully.",
  "data": {
    "originalTotal": 600,
    "discountPercentage": 10,
    "discountValue": 60,
    "finalTotal": 540
  }
}
```

## المكونات المُحدثة

### 1. PromoCodeInput
- يعرض تفاصيل الخصم بشكل احترافي
- يوضح المجموع الأصلي والخصم والمجموع النهائي
- يحتوي على أنيميشن جميل

### 2. DiscountBreakdown
- مكون منفصل لعرض تفاصيل الخصم
- يدعم الأنيميشن
- متوافق مع العربية والإنجليزية

### 3. DiscountSummary
- مكون مبسط لعرض الخصم في السلة
- يمكن إضافة زر الحذف

## مثال على الاستخدام

```tsx
import { useDiscount } from '@/hooks/useDiscount';
import PromoCodeInput from '@/components/checkout/PromoCodeInput';
import DiscountBreakdown from '@/components/ui/DiscountBreakdown';

function CheckoutPage() {
  const { discount, applyDiscountCode, removeDiscount } = useDiscount();

  return (
    <div>
      <PromoCodeInput
        onDiscountApplied={(discountData) => {
          // تحديث الحالة
          console.log('Discount applied:', discountData);
        }}
        onDiscountRemoved={() => {
          removeDiscount();
        }}
        appliedDiscount={discount}
      />

      {discount && (
        <DiscountBreakdown 
          discount={discount} 
          showAnimation={true} 
        />
      )}
    </div>
  );
}
```

## الميزات الجديدة

✅ **عرض تفصيلي للخصم**: المجموع الأصلي، نسبة الخصم، قيمة الخصم، المجموع النهائي
✅ **أنيميشن احترافي**: حركات سلسة عند تطبيق الخصم
✅ **دعم متعدد اللغات**: عربي وإنجليزي
✅ **تصميم جذاب**: ألوان وأيقونات مناسبة
✅ **سهولة الاستخدام**: مكونات قابلة لإعادة الاستخدام
✅ **معالجة الأخطاء**: رسائل واضحة للمستخدم

## التحديثات المطلوبة في الصفحات

1. **صفحة السلة**: إضافة دعم عرض الخصم
2. **صفحة الدفع**: استخدام المكونات الجديدة
3. **ملخص الطلب**: تحديث الحسابات لتشمل الخصم

## الترجمات المطلوبة

جميع الترجمات موجودة في ملفات `messages/ar.json` و `messages/en.json` تحت قسم `PromoCode`.